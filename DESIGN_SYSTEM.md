# Sistema de diseño — "Ambilight"

Identidad visual de SeriesTracker. El nombre viene del bias lighting de un
televisor en un cuarto oscuro: un fondo casi negro y un acento cálido que
se degrada de un extremo a otro. Se eligió **degradado sobre transparencia**
(no "glass"/blur) porque es la preferencia explícita del producto y porque
un degradado de dos colores narra mejor la metáfora "pantalla encendida en
la oscuridad" que un panel translúcido.

Este documento es la fuente de verdad para cualquier pantalla nueva.
Si un componente necesita un color, tipografía, espaciado o radio que no
esté aquí, **se añade aquí primero** y luego se usa — no se hardcodea.

## Principios

1. **El acento de marca (teal → amber) es para jerarquía de acción, no
   para estado.** Se usa en: el CTA principal de cada pantalla, el tab
   activo, glows de hover en tarjetas, la barra de progreso "en curso".
   Nunca se usa para comunicar éxito/error/estado de una serie — para eso
   existen los colores semánticos (`--status-*`), que son un juego de
   colores totalmente separado.
2. **Un solo CTA con gradiente por pantalla.** Si todo brilla, nada
   destaca. Las acciones secundarias son `mat-stroked-button` con bordes
   sutiles (`--color-border-strong`).
3. **Las acciones destructivas son rojas, punto.** Ver la nota sobre
   `color="warn"` más abajo — nunca depender de las variantes de color de
   Angular Material para esto; usar `.btn-danger` / `.btn-danger-solid`.
4. **Fondo casi negro, nunca negro puro.** `--color-ink` (`#0b0d12`) tiene
   un ligerísimo sesgo azulado, no es `#000`. Las superficies elevadas
   (`--color-surface`, `--color-surface-raised`) se distinguen por
   luminosidad, no por saturación.
5. **Todo color/tipografía/espaciado sale de un token.** Nunca hardcodear
   un hex o un `px` de espaciado en un componente. Esto es lo que permite
   que un cambio de identidad futuro sea un cambio en un solo archivo.
6. **Ningún componente hardcodea `rgba()` de un color de marca/estado.**
   Si necesitás una versión translúcida de `--color-teal`, `--color-amber`
   o un `--status-*`, usá `color-mix(in srgb, var(--token) X%, transparent)`
   en vez de escribir el `rgb()` a mano. Un `rgba(45, 212, 191, .1)`
   hardcodeado es exactamente `--color-teal` al 10% en el tema oscuro —
   pero queda desincronizado apenas el tema claro cambia ese hue. Esta
   regla existe porque se encontraron y corrigieron ocho casos así al
   implementar el tema claro (ver sección siguiente).

## Dónde vive

- **`src/styles.scss`** — declara todos los tokens como custom properties
  en `:root`, configura el tema de Angular Material (`mat.theme(...)`) y
  define las utilidades de marca (`.btn-gradient`, `.text-gradient`,
  `.btn-danger`, `.btn-danger-solid`).
- **`src/styles/theme-colors.scss`** — paletas tonales M3 generadas con
  `ng generate @angular/material:theme-color`. No se edita a mano; si se
  cambia el color de marca, se regenera este archivo.
- **`src/index.html`** — carga las tres familias tipográficas desde
  Google Fonts, y un `<script>` inline que aplica el tema guardado antes
  de que cargue Angular (evita el flash del tema incorrecto).
- **`src/app/core/services/theme.service.ts`** — resuelve el tema inicial,
  expone el toggle y persiste la preferencia. Ver "Tema claro/oscuro".

## Color

### Superficies y texto

| Token | Oscuro (default) | Claro | Uso |
|---|---|---|---|
| `--color-ink` | `#0b0d12` | `#f5f6f8` | Fondo de página |
| `--color-surface` | `#12151d` | `#ffffff` | Cards, inputs |
| `--color-surface-raised` | `#171b26` | `#eef0f4` | Elementos sobre una card (placeholders, inputs anidados) |
| `--color-border` | `rgba(255,255,255,.08)` | `rgba(15,23,35,.09)` | Bordes por defecto |
| `--color-border-strong` | `rgba(255,255,255,.16)` | `rgba(15,23,35,.18)` | Bordes en hover/focus/active |
| `--color-text` | `#eef1f6` | `#12141a` | Texto principal |
| `--color-text-dim` | `rgba(238,241,246,.58)` | `rgba(18,20,26,.64)` | Texto secundario |
| `--color-text-faint` | `rgba(238,241,246,.36)` | `rgba(18,20,26,.42)` | Metadatos, labels, placeholders |

Ninguno de los dos fondos es blanco/negro puro — ambos llevan un
sesguito frío, coherente con el principio 4.

### Acento de marca

| Token | Oscuro (default) | Claro | Uso |
|---|---|---|---|
| `--color-teal` | `#2dd4bf` | `#0f9c8c` | Extremo frío del degradado; enlaces, focus |
| `--color-amber` | `#f5a623` | `#b56a05` | Extremo cálido del degradado |

En el tema claro, teal y amber se profundizan (más oscuros, menos
saturados) — el mismo valor del tema oscuro pierde casi todo el
contraste sobre blanco. El resto de los tokens de marca se derivan
de estos dos con `color-mix()` y **no se repiten por tema**:

| Token | Definición |
|---|---|
| `--gradient-brand` | `linear-gradient(90deg, var(--color-teal), var(--color-amber))` |
| `--gradient-brand-soft` | mismo degradado, cada extremo a `color-mix(in srgb, var(--color-teal) 35%, transparent)` |
| `--shadow-glow-brand` / `-sm` | sombra difusa con `color-mix()` sobre teal/amber |

Uso: CTAs, barra de progreso "watching", fondos de estado activo (tabs,
chips), glow de hover en cards.

### Color semántico (independiente del acento)

| Token | Oscuro (default) | Claro | Estado |
|---|---|---|---|
| `--status-watching` | `#00e5a0` | `#0a8f63` | Viendo |
| `--status-want` | `#6c8eff` | `#3457d5` | Por ver |
| `--status-completed` | `#ffd166` | `#a9720a` | Completada |
| `--status-abandoned` | `#ff6b6b` | `#d43d3d` | Abandonada / acciones destructivas |

Estos cuatro colores son deliberadamente distintos del teal/amber de
marca (aunque `--status-watching` y `--color-teal` comparten familia
cromática por coincidencia, no por regla). Si se añade un quinto estado,
se elige un hue que no colisione con los cinco anteriores — y se le
suma su propio valor claro/oscuro en esta tabla.

### ⚠️ Nota: `color="warn"` de Angular Material no funciona con `mat.theme()`

La API simplificada `mat.theme()` (Material 3 / Angular Material 21) no
themiza las variantes `color="accent"` / `color="warn"` de los
componentes — sin el mixin `mat.color-variants-backwards-compatibility()`
(incompatible con esta API), un botón `color="warn"` cae de vuelta al
color primario. Se comprobó en vivo: el botón "Eliminar de mi lista"
se renderizaba en teal en lugar de rojo.

**Regla:** nunca usar `color="warn"` ni `color="accent"` en este proyecto.
Usar las utilidades `.btn-danger` (outline) o `.btn-danger-solid` (relleno)
para cualquier acción destructiva.

## Tema claro/oscuro

El tema se activa con el atributo `[data-theme]` en `<html>` — `"dark"` es
el default (`:root` sin atributo), `"light"` es la variante explícita
(`:root[data-theme="light"]`). `mat.theme()` se invoca dos veces en
`styles.scss`, una por cada `theme-type`, cada una bajo su selector.

**Resolución del tema inicial** (sin flash del tema incorrecto):
1. Un `<script>` inline en `index.html` (antes de que cargue Angular) lee
   `localStorage.theme`; si no hay nada guardado, usa
   `window.matchMedia('(prefers-color-scheme: light)')`. Aplica el
   resultado como `data-theme` en `<html>` de forma síncrona.
2. `ThemeService` (`core/services/theme.service.ts`) repite el mismo
   criterio para inicializar su `signal` — el `<script>` ya pintó lo
   correcto, esto solo sincroniza el estado de Angular con el DOM.
3. A partir de ahí, el toggle (`ThemeService.toggle()`, botón en el
   navbar) siempre pisa la preferencia del sistema — una vez que el
   usuario elige explícitamente, esa elección persiste en
   `localStorage.theme` sin importar cambios futuros del SO.

**Al agregar un componente nuevo:** no hace falta pensar en el tema —
si todo sale de los tokens de esta tabla (nunca de un hex hardcodeado),
el componente ya funciona en ambos. La única disciplina es la del
principio 6: ninguna versión translúcida de un color se hardcodea, se
deriva con `color-mix()`.

## Tipografía

| Rol | Familia | Token |
|---|---|---|
| Display / headings / valores destacados | Sora | `--font-display` |
| Cuerpo / UI | Inter | `--font-body` |
| Datos tabulares (episodios, códigos, inputs numéricos) | JetBrains Mono | `--font-mono` |

Sora se reserva para títulos y números grandes (progreso, contadores) —
le da peso "editorial" a lo que el usuario debe notar primero. JetBrains
Mono se usa donde hay alineación numérica (progreso `12/62 ep`, inputs de
episodios) para que los dígitos no salten al cambiar de valor.

## Espaciado, radios, movimiento

```scss
--space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
--space-5: 20px; --space-6: 24px; --space-8: 32px;
--space-10: 40px; --space-12: 48px;

--radius-sm: 10px;  // botones, inputs, chips
--radius-md: 14px;  // stat cards, posters pequeños
--radius-lg: 20px;  // cards principales, modales
--radius-full: 999px; // barras de progreso, pills

--dur-fast: 120ms;  // hover de icon buttons
--dur-base: 200ms;  // hover de cards, transiciones de color
--dur-slow: 320ms;  // animaciones de entrada
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
```

Todas las transiciones respetan `prefers-reduced-motion` (regla global en
`styles.scss` que colapsa duraciones a `0.01ms`).

## Utilidades de marca

- **`.btn-gradient`** — CTA primario con `--gradient-brand`, glow en hover.
  Uno solo por pantalla (login, "Agregar", "Agregar primera serie").
- **`.text-gradient`** — texto con el degradado aplicado vía
  `background-clip: text`. Reservado para números/valores hero si se
  necesita en el futuro (no se usa aún en producción).
- **`.btn-danger`** / **`.btn-danger-solid`** — ver nota de `color="warn"`
  arriba.

## Cómo se aplica hoy

- **Auth (login/register):** card sobre fondo `--color-ink`, CTA con
  `.btn-gradient`, enlaces en `--color-teal`.
- **Navbar:** fondo `--color-ink`, indicador de notificación no leída en
  teal (no en el verde de "watching" — son conceptos distintos aunque
  antes compartían el mismo hex por casualidad). Toggle de tema
  claro/oscuro (ícono sol/luna) entre la campana y el menú de usuario.
- **Series list:** tab activo con `--gradient-brand-soft`, stat cards con
  los cuatro `--status-*`, paginador de Material sin recolorear (usa el
  tema M3 tal cual).
- **Series card:** glow dual teal+amber en hover (`--shadow-glow-brand`),
  badge de estado y barra de progreso ligados al estado real de la serie
  vía la clase `statusClass` del componente (antes estaban hardcodeados
  en verde sin importar el estado — corregido en este pase).
- **Series detail:** poster con glow de marca, badge de estado con
  variantes de color, estado activo en "Cambiar estado" con
  `--gradient-brand-soft`, zona de peligro con `.btn-danger`.
- **Confirm dialog:** botón de confirmación destructivo con
  `.btn-danger-solid`.

## Extender el sistema

Antes de añadir una funcionalidad nueva:

1. ¿Necesita un color que no está en la tabla? Decide si es *marca*
   (jerarquía de acción) o *semántico* (estado) antes de elegir el hue,
   y dale su propio valor claro y oscuro.
2. ¿Necesita un espaciado o radio nuevo? Añade el token a `styles.scss`
   en vez de un valor suelto en el componente.
3. ¿Es una acción destructiva? `.btn-danger` / `.btn-danger-solid`, nunca
   `color="warn"`.
4. ¿Necesita una versión translúcida de un color existente? `color-mix()`
   sobre el token, nunca un `rgba()` escrito a mano (principio 6).
5. Actualiza este archivo con la decisión y el porqué, igual que las
   secciones anteriores.
