# Registro de cambios

Este proyecto se desarrolló de forma iterativa con revisión continua. Se documenta aquí en vez
de ocultarlo — un historial de correcciones muestra control de calidad activo, no improvisación.

## v0.7 — Corrección de eje de rotación postural (geometría)
- **Corrección importante**: la rotación que representa el cambio de postura (de pie → acostado)
  usaba el eje Z de la escena (adelante/atrás del cuerpo), lo cual producía un giro en el plano
  lateral (izquierda-derecha) sin sentido clínico — el modelo se "acostaba de lado" en vez de
  reclinarse hacia adelante/atrás. Se corrigió a rotación sobre el eje X (lateral), que es el eje
  correcto para producir una inclinación en el plano sagital (anteroposterior).
- La curvatura interna entre la vejiga y la uretra (ángulo uretrovesical, UVA) tenía el mismo
  problema: su componente principal estaba en el eje lateral (X) en vez del eje sagital (Z). Se
  corrigió para que la curvatura ocurra en el plano sagital, consistente con que el UVA es un
  ángulo anteroposterior real, no una desviación lateral.
- Se eliminó un componente lateral residual en el tramo bulbar/peneano ilustrativo, que
  introducía una ligera asimetría de lado incluso después de la corrección anterior de "curva
  hacia la derecha".

## v0.6 — Reproducibilidad y exportación
- Generador de números aleatorios con semilla (mulberry32) para la cohorte de sujetos virtuales
  y el bootstrap del análisis de sensibilidad. Antes usaba `Math.random()` sin semilla: dos
  generaciones nunca daban el mismo resultado y no había forma de reproducir una cohorte
  mostrada en vivo.
- Exportación de la cohorte a CSV (incluye la semilla usada por sujeto).
- Corrección de CSS responsive: la fila de la cohorte tenía un `style` en línea que sobreescribía
  la regla de colapso a una columna en pantallas chicas (&lt;880px) — no se aplicaba porque un
  estilo en línea tiene más especificidad que la regla de la media query.
- Comparador de Qmax real: se agregó una banda cualitativa (bajo/típico/alto) junto al percentil
  exacto, para reducir la falsa precisión de mostrar solo un número con muestras chicas.

## v0.5 — Fundamentación y justificación
- Página `fundamentacion.html` separada del simulador: marco teórico, tabla de paralelismo
  Paper↔Simulador, validación sistemática (5,625 combinaciones), y hoja de ruta de Fase 2.
- Validación de rango documentada y reproducible (`validation/validation_grid.js`).
- `METHODOLOGY.md`, `README.md` y `LICENSE` (MIT) agregados al repositorio.
- Librerías (three.js, OrbitControls, CSS2DRenderer, Chart.js) vendorizadas en `/vendor` —
  el simulador ya no depende de CDNs en vivo.
- Declaración explícita de manejo de datos (nada se transmite; todo vive en `localStorage`).

## v0.4 — Cohorte de sujetos virtuales
- Generación de sujetos sintéticos (edad, volumen prostático, diámetro uretral, Pdet) dentro de
  rangos de la literatura, con tabla y gráfico comparativo — responde a la limitación de n=1.
- Análisis de sensibilidad (r² por variable) con barras de error bootstrap (p10-p90) para mostrar
  la incertidumbre del estimado en muestras chicas.
- Comparador de Qmax real contra la cohorte guardada (percentil empírico), explícitamente
  etiquetado como no diagnóstico.
- Evaluación en vivo de la hipótesis de equivalencia postural del protocolo (H₀: |ΔQmax| ≥ 2 mL/s).

## v0.3 — Correcciones de física y geometría
- **Corrección de física mayor**: el modelo de fricción de tubería (Poiseuille/Darcy-Weisbach)
  producía valores absurdos (Qmax &gt;300 mL/s, Reynolds &gt;27,000) porque a las dimensiones
  anatómicas reales, un tubo corto y ancho casi no ofrece fricción. Se reemplazó por un modelo
  tipo orificio de Bernoulli, calibrado para reproducir el rango esperado del protocolo
  (Qmax 22-24 mL/s, Re 3500-5100).
- Corrección de textura orgánica: la función de ruido desplazaba vértices desde el origen de la
  escena en vez de a lo largo de la normal de superficie — producía púas en el tubo uretral en
  vez de una superficie orgánica lisa.
- Corrección de sesgo geométrico: el tramo bulbar/peneano de la uretra se desviaba hacia un lado
  fijo incluso con el ángulo postural en 0°, por coordenadas fijas en el eje lateral en vez del
  eje anterior.
- Corrección de fuga de memoria en etiquetas 3D (CSS2DObject): los elementos HTML no se
  eliminaban del DOM al reconstruir la anatomía, acumulándose en cada interacción.

## v0.2 — Corte de vejiga y modo presentación
- Corte transversal de la vejiga con animación del nivel de orina, sincronizada con la curva Q-t.
- Modo presentación (recorrido automático de las 5 posturas).
- Etiquetas 3D colapsables (puntos que se expanden a demanda).

## v0.1 — Versión inicial
- Visualización 3D de vejiga, próstata y uretra en 5 posturas, con dimensiones de la Tabla 1 del
  protocolo. Cálculo de Qmax en tiempo real, curva Q-t, comparación entre posturas.
