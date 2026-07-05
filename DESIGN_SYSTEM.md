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

## Dónde vive

- **`src/styles.scss`** — declara todos los tokens como custom properties
  en `:root`, configura el tema de Angular Material (`mat.theme(...)`) y
  define las utilidades de marca (`.btn-gradient`, `.text-gradient`,
  `.btn-danger`, `.btn-danger-solid`).
- **`src/styles/theme-colors.scss`** — paletas tonales M3 generadas con
  `ng generate @angular/material:theme-color`. No se edita a mano; si se
  cambia el color de marca, se regenera este archivo.
- **`src/index.html`** — carga las tres familias tipográficas desde
  Google Fonts.

## Color

### Superficies y texto

| Token | Valor | Uso |
|---|---|---|
| `--color-ink` | `#0b0d12` | Fondo de página |
| `--color-surface` | `#12151d` | Cards, inputs |
| `--color-surface-raised` | `#171b26` | Elementos sobre una card (placeholders, inputs anidados) |
| `--color-border` | `rgba(255,255,255,.08)` | Bordes por defecto |
| `--color-border-strong` | `rgba(255,255,255,.16)` | Bordes en hover/focus/active |
| `--color-text` | `#eef1f6` | Texto principal |
| `--color-text-dim` | `rgba(238,241,246,.58)` | Texto secundario |
| `--color-text-faint` | `rgba(238,241,246,.36)` | Metadatos, labels, placeholders |

### Acento de marca

| Token | Valor | Uso |
|---|---|---|
| `--color-teal` | `#2dd4bf` | Extremo frío del degradado; enlaces, focus |
| `--color-amber` | `#f5a623` | Extremo cálido del degradado |
| `--gradient-brand` | `linear-gradient(90deg, teal, amber)` | CTAs, barra de progreso "watching" |
| `--gradient-brand-soft` | versión 35% opacidad, 135deg | Fondos de estado activo (tabs, chips) |
| `--shadow-glow-brand` / `-sm` | sombra difusa teal+amber | Hover de cards, poster hero |

### Color semántico (independiente del acento)

| Token | Valor | Estado |
|---|---|---|
| `--status-watching` | `#00e5a0` | Viendo |
| `--status-want` | `#6c8eff` | Por ver |
| `--status-completed` | `#ffd166` | Completada |
| `--status-abandoned` | `#ff6b6b` | Abandonada / acciones destructivas |

Estos cuatro colores son deliberadamente distintos del teal/amber de
marca (aunque `--status-watching` y `--color-teal` comparten familia
cromática por coincidencia, no por regla). Si se añade un quinto estado,
se elige un hue que no colisione con los cinco anteriores.

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
  antes compartían el mismo hex por casualidad).
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
   (jerarquía de acción) o *semántico* (estado) antes de elegir el hue.
2. ¿Necesita un espaciado o radio nuevo? Añade el token a `styles.scss`
   en vez de un valor suelto en el componente.
3. ¿Es una acción destructiva? `.btn-danger` / `.btn-danger-solid`, nunca
   `color="warn"`.
4. Actualiza este archivo con la decisión y el porqué, igual que las
   secciones anteriores.
