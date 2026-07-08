# Metodología del simulador

Este documento explica, en prosa, las ecuaciones, supuestos y calibración detrás del
*Simulador de Dinámica Miccional 3D*. Existe porque un simulador interactivo no debe ser
una caja negra: cualquier persona que lo evalúe (revisor, docente, colega) debería poder
entender exactamente qué calcula y qué NO calcula, sin tener que leer el código fuente.

**Lectura obligatoria antes de citar o presentar este simulador**: es un modelo exploratorio
simplificado (n=1, prueba de concepto), no una simulación CFD validada. Ver §6.

---

## 1. Qué problema resuelve y qué NO resuelve

El simulador estima el flujo urinario máximo (Qmax) y su relación con la postura corporal,
usando la misma geometría, dimensiones y curva de presión detrusora del protocolo
*"Simulación computacional de la dinámica miccional en varones jóvenes asintomáticos"*.

**Lo que SÍ hace:** calcula Qmax con una ecuación algebraica cerrada (ver §3), en tiempo real,
para explorar cómo cambian los resultados al mover ángulo postural, presión detrusora, edad,
volumen prostático, diámetro uretral, densidad y viscosidad del fluido.

**Lo que NO hace:** no resuelve las ecuaciones de Navier-Stokes en 3D, no tiene malla de
elementos finitos, no modela capa límite ni separación de flujo, y no está validado contra
datos de pacientes reales. Es la etapa exploratoria previa a la Fase 2 (3D Slicer → Blender →
Gmsh → OpenFOAM/pimpleFoam) descrita en el protocolo original.

---

## 2. Por qué un modelo de orificio (Bernoulli) y no fricción de tubería (Poiseuille)

La primera versión de este simulador usó un modelo de fricción de tubería
(Hagen-Poiseuille / Darcy-Weisbach), análogo a modelar la uretra como una tubería recta.
Con las dimensiones anatómicas reales del protocolo (diámetro ~7-10mm, longitud ~43mm), ese
modelo predice una resistencia casi nula — y por tanto velocidades y caudales fisiológicamente
absurdos (>10 m/s, cientos de mL/s), porque un tubo tan corto y ancho ofrece muy poca fricción
de pared.

La razón física es que **la resistencia real al vaciado vesical no la da la fricción del
lumen visible**, la da el esfínter/mucosa actuando como una "garganta" (orificio) mucho más
estrecha que el diámetro anatómico segmentado. Esto es consistente con cómo la urodinámica
clínica modela la relación presión-flujo desde hace décadas: Griffiths (1980) y los
nomogramas ICS/Liverpool (Siroky et al. 1979) usan relaciones tipo orificio, no de tubería.

Por eso el simulador usa la ecuación de Bernoulli/orificio:

```
Q = Cd · A · √(2·ΔP / ρ)
```

donde `A` es el área transversal uretral (a partir del diámetro efectivo), `ΔP` es la presión
detrusora instantánea, `ρ` la densidad del fluido, y `Cd` un coeficiente de descarga que
agrupa —de forma simplificada— la resistencia esfinteriana/mucosa real.

## 3. La ecuación completa, con la pérdida por angulación

```
Q = A · √( 2·ΔP / (ρ · (C₀ + K)) )      donde C₀ = 1/Cd²

K(ángulo) = 0.05 + 3.2 · (UVA(ángulo) − 90) / (125 − 90)
```

`K` es un coeficiente de pérdida menor que representa cómo la apertura del ángulo
uretrovesical (UVA) — que va de 90° en bipedestación a 125° en cuclillas, según la Tabla 1
del protocolo original — estrecha/tuerce el trayecto funcional de flujo. **`K` no está
derivado de primeros principios**: sus dos parámetros (base 0.05, pendiente 3.2) se ajustaron
para que la variación de Qmax entre 0° y 60° quedara cerca del <6% que predice el abstract del
protocolo, y esto se declara explícitamente aquí en vez de presentarlo como un resultado
independiente.

El factor de edad (`ageFactor`) multiplica `Cd`:

```
ageFactor(edad) = 1 − 0.0025 · (edad − 25)
```

Esto es un supuesto **ilustrativo y modesto** (una caída de ~0.25%/año en el coeficiente de
descarga, referenciada a los 25 años), inspirado en la tendencia descrita en nomogramas
urodinámicos de una discreta caída de Qmax con la edad incluso en varones asintomáticos <40
años. No está derivado de datos propios del protocolo ni de una regresión ajustada — es una
tendencia cualitativa tomada de la literatura general y aplicada de forma simplificada.

El volumen prostático (15-25 mL, rango no obstructivo según el protocolo) **cambia la
anatomía visible pero no entra en esta ecuación** — a esos volúmenes normales no hay una
relación hidráulica establecida que modelar, y se prefirió no inventar una.

## 4. Calibración de Cd — qué se ajustó y a qué dato

`Cd` se calibró resolviendo la ecuación de §3 para que, en las condiciones de referencia del
protocolo (Pdet=50 cmH₂O, D=7.2mm, ρ=1030 kg/m³, μ=0.001 Pa·s, ángulo=0°, edad=25),
el Qmax resultante cayera en ~23 mL/s — el punto medio del rango 22-24 mL/s que predice el
abstract del protocolo. Esto dio:

- `CD_AUTO = 0.183` (modo "Automático / RANS-like")
- `CD_LAMINAR = 0.166` (modo "Laminar forzado" — 10% menor, una sensibilidad ilustrativa
  análoga a la comparación RANS-vs-laminar del protocolo, **no una segunda calibración
  independiente**)

**Esto es una calibración de un solo punto, no una validación en rango.** Es una limitación
real y se declara como tal. Lo que sí se hizo (ver §5) fue verificar sistemáticamente que el
modelo calibrado de esta forma no produce valores absurdos en ningún otro punto del rango de
parámetros que permiten los controles del simulador — que es un chequeo de sanidad, no una
validación estadística contra datos independientes.

## 5. Validación de rango (barrido sistemático)

Se corrió un barrido de **5,625 combinaciones** cubriendo el rango completo de los 6 controles
del simulador:

| Variable | Valores probados |
|---|---|
| Presión detrusora (Pdet) | 30, 40, 50, 60, 70 cmH₂O |
| Diámetro uretral efectivo | 4.0, 6.0, 7.2, 9.0, 10.5 mm |
| Ángulo postural | 0°, 15°, 30°, 45°, 60° |
| Edad | 18, 25, 29, 35, 40 años |
| Densidad | 990, 1030, 1060 kg/m³ |
| Viscosidad | 0.60, 1.00, 1.60 mPa·s |

**Resultado:** Qmax varió entre 5.0 y 60.0 mL/s en todo el rango, con velocidad máxima de
chorro de 0.69 m/s (caso extremo: Pdet=70, D=4mm, edad=18) y Reynolds máximo de 12,420 — todos
valores dentro de rangos fisiológicamente plausibles para presiones/diámetros fuera de lo
normal (recordar que el rango de sliders permite explorar más allá de los valores normativos
del protocolo a propósito, para exploración). **Cero combinaciones** produjeron valores
negativos, no-finitos, o velocidades por encima de 3.5 m/s.

Este barrido se puede reproducir ejecutando `validation/validation_grid.js` (Node.js) incluido
en este repositorio.

## 6. Limitaciones declaradas (léase antes de citar el simulador)

- **n=1**: toda la geometría deriva de un único sujeto de referencia (ProstateX-0000, TCIA).
  Los "sujetos virtuales" de la cohorte son variaciones sintéticas por muestreo aleatorio, no
  pacientes reales ni una muestra poblacional validada.
- **No es CFD**: es un modelo algebraico 0D/1D (orificio + pérdida menor), no una solución de
  Navier-Stokes en 3D. No captura gradientes espaciales de presión/velocidad, capa límite, ni
  separación de flujo.
- **Cd es una calibración de un punto**, no un ajuste multi-punto ni una validación cruzada.
- **K(ángulo) y ageFactor(edad) son supuestos ilustrativos**, no relaciones derivadas de datos
  propios del protocolo.
- **El análisis de sensibilidad (r²) es exploratorio**: con cohortes pequeñas (n<15), el
  simulador muestra explícitamente un rango de incertidumbre (bootstrap p10-p90) porque el
  punto estimado por sí solo puede ser inestable.
- **El comparador de Qmax real no es una herramienta diagnóstica ni un nomograma clínico
  validado** (a diferencia de Liverpool/ICS) — compara contra una cohorte sintética pequeña,
  únicamente para discusión conceptual.

## Referencias citadas en este documento

1. Griffiths DJ. *Urodynamics: the mechanics and hydrodynamics of the lower urinary tract.*
   Adam Hilger; 1980.
2. Siroky MB, Olsson CA, Krane RJ. The flow rate nomogram: I. Development. *J Urol.*
   1979;122(5):665-8.
3. Veeratterapillay R, et al. Variabilidad test-retest en uroflujometría (citado en el
   protocolo original como base del margen de equivalencia de 2 mL/s). 2014.
4. Protocolo original: *"Simulación computacional de la dinámica miccional en varones jóvenes
   asintomáticos: influencia de la postura corporal sobre la eficiencia del flujo uretral
   mediante un modelo tridimensional de elementos finitos"* — ver referencias completas ahí.
