# Simulador de Dinámica Miccional 3D

Simulador educativo interactivo (HTML/JS, sin backend) que explora cómo la postura corporal,
la presión detrusora, la edad y la geometría uretral afectan el flujo urinario máximo (Qmax),
basado en el protocolo de investigación *"Simulación computacional de la dinámica miccional en
varones jóvenes asintomáticos: influencia de la postura corporal sobre la eficiencia del flujo
uretral mediante un modelo tridimensional de elementos finitos"*.

**⚠️ Antes de usar, citar o presentar esto**, lee:
- [`fundamentacion.html`](./fundamentacion.html) — la justificación teórica completa: marco
  teórico, tabla de paralelismo Paper↔Simulador, validación sistemática, y **qué falta en Fase 2**.
  Es la página que se debe mostrar a un revisor o comité.
- [`METHODOLOGY.md`](./METHODOLOGY.md) — la misma justificación en formato Markdown plano, para
  quien prefiera leerlo directo en GitHub sin abrir el navegador.

Es un modelo exploratorio (n=1, prueba de concepto), **no** un resultado de simulación CFD
validado — esto se declara de forma visible dentro del propio simulador, no solo aquí.

## Qué hace

- Visualiza en 3D la anatomía (vejiga, próstata, uretra) en 5 posturas (0°-60°), con
  dimensiones reales tomadas de la Tabla 1 del protocolo.
- Calcula Qmax en tiempo real con un modelo tipo orificio de Bernoulli (ver fundamentación),
  ajustable por edad, volumen prostático, diámetro uretral, presión detrusora, densidad y
  viscosidad del fluido.
- Corte de vejiga con animación del vaciado, siguiendo la curva de presión fisiológica del
  protocolo.
- Cohorte de "sujetos virtuales" (generación aleatoria dentro de rangos de la literatura, o
  manual) con análisis de sensibilidad (con incertidumbre bootstrap) y un comparador de
  percentil contra un Qmax medido.
- Evaluación en vivo de la hipótesis de equivalencia postural del protocolo (H₀: \|ΔQmax(0° vs
  60°)\| ≥ 2 mL/s).
- Botón "Metodología" dentro del propio simulador (modal) y link directo a la página de
  fundamentación completa.

## Cómo desplegarlo (uso didáctico — compartir con residentes/colegas)

Es un sitio 100% estático — no requiere build, servidor, ni base de datos.

### Opción A — Vercel (recomendada para compartir un link rápido)

1. Sube este repositorio a GitHub (o impórtalo directo desde tu editor local).
2. En [vercel.com](https://vercel.com) → **Add New → Project** → importa el repositorio.
3. Framework preset: **Other** (sitio estático). No hay build command ni output directory que
   configurar — déjalos vacíos o por defecto.
4. Deploy. Obtienes una URL tipo `tu-proyecto.vercel.app`, lista para compartir en clase o en el
   simposio. Cada `git push` a `main` actualiza el sitio automáticamente.

### Opción B — GitHub Pages

1. Settings → Pages → Branch `main` → carpeta raíz (`/`) → Save.
2. La URL queda como `tu-usuario.github.io/nombre-repo`.

### Opción C — Localmente, sin desplegar nada

Abre `index.html` directamente en cualquier navegador moderno (Chrome, Firefox, Safari, Edge).
Todas las librerías están vendorizadas en `/vendor`, así que funciona sin conexión a internet
(excepto las tipografías, que son un detalle cosmético no crítico si no cargan).

## Estructura del repositorio

```
index.html              — el simulador (HTML+CSS+JS)
fundamentacion.html      — justificación teórica completa (paralelismo, validación, Fase 2 pendiente)
vendor/                 — three.js, OrbitControls, CSS2DRenderer, Chart.js (vendorizados, sin CDN)
validation/
  validation_grid.js    — script Node.js que reproduce el barrido de validación de 5,625 combinaciones
METHODOLOGY.md           — la fundamentación en Markdown plano (misma info que fundamentacion.html)
README.md                — este archivo
LICENSE                  — MIT
```

## Privacidad / manejo de datos

No se recolecta ni transmite ningún dato personal o clínico. Todo lo que ingreses (cohorte de
sujetos virtuales, comparación de Qmax) se guarda únicamente en el `localStorage` de tu propio
navegador — nunca se envía a un servidor, porque no hay servidor: es un sitio 100% estático.

## Cómo citar

Si usas o presentas este simulador, por favor referencia tanto el protocolo original como este
repositorio:

> [Nombre del/la autor/a]. *Simulador de Dinámica Miccional 3D* [software]. Basado en el
> protocolo "Simulación computacional de la dinámica miccional en varones jóvenes
> asintomáticos" ([Grupo de Investigación Urológica]). Disponible en: [URL del repositorio /
> URL de Vercel]. [Año].

## Licencia

**El código propio de este repositorio se distribuye bajo licencia MIT** — texto completo en
[`LICENSE`](./LICENSE). En resumen: puedes usar, copiar, modificar y redistribuir libremente,
con atribución, sin garantía.

Las librerías de terceros vendorizadas en `/vendor` conservan sus licencias originales (también
MIT, compatibles):
- [three.js](https://github.com/mrdoob/three.js) — MIT License
- [Chart.js](https://github.com/chartjs/Chart.js) — MIT License

## Desarrollo

Este simulador fue desarrollado con asistencia de IA (Claude, Anthropic). Ver
[`fundamentacion.html`](./fundamentacion.html) o [`METHODOLOGY.md`](./METHODOLOGY.md) para el
detalle completo de las decisiones de modelado, su calibración, y sus justificaciones.
