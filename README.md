# SeriesTracker Web

Aplicación web para el seguimiento de series de televisión. Construida con Angular 21 (zoneless) y Angular Material 21, consume la [SeriesTracker API](https://github.com/TuUsuario/seritracker-api).

Identidad visual propia — degradado "Ambilight" (teal → amber) documentada
en [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md). Cualquier UI nueva debe partir
de esos tokens, no de valores hardcodeados.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Angular (zoneless) | 21 |
| UI Components | Angular Material (theming M3) | 21 |
| Estilos | SCSS + custom properties (design tokens) | — |
| HTTP | Angular HttpClient | — |
| Routing | Angular Router con Lazy Loading | — |
| Forms | Angular Reactive Forms | — |
| Animaciones | Angular Animations | — |
| Tests | Vitest (vía `@angular/build:unit-test`) | 4 |
| Contenedor | Docker (nginx + build multi-stage) | — |

---

## Requisitos Previos

- Node.js 20+
- npm 10+
- Angular CLI 21+
- [SeriesTracker API](https://github.com/TuUsuario/seritracker-api) corriendo en `localhost:8080`

---

## Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/TuUsuario/seritracker-web.git
cd seritracker-web
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar el entorno

El archivo `src/environments/environment.ts` ya apunta a `http://localhost:8080/api/v1` para desarrollo local. No requiere configuración adicional.

### 4. Ejecutar la aplicación

```bash
ng serve
```

La aplicación queda disponible en `http://localhost:4200`.

> Asegúrate de tener el backend corriendo antes de arrancar el frontend.

### 5. (Opcional) Correr con Docker

```bash
docker build -t seritracker-web .
docker run -p 8081:80 -e API_URL=http://localhost:8080/api/v1 seritracker-web
```

El build multi-stage compila con Node 22 y sirve los estáticos con nginx.
`API_URL` se inyecta en runtime vía `envsubst` (`docker-entrypoint.d/40-envsubst-api-url.sh`), no queda hardcodeado en el bundle.

---

## Funcionalidades

### Autenticación
- Registro e inicio de sesión con JWT
- Sesión persistente en localStorage
- Redirección automática al expirar el token

### Gestión de Series
- **Agregar series** buscando directamente en TMDB
- **4 estados** — Viendo, Por ver, Completada, Abandonada — cada uno con su propio color semántico, independiente del acento de marca
- **Calificación** de 1 a 10 con estrellas
- **Control de episodios** — marcar episodios vistos
- **Filtros** por estado y búsqueda por nombre
- **Paginación** server-side en la lista (`mat-paginator`)

### Notificaciones
- Campana en el navbar con badge de no leídas
- Notificaciones de episodios que emiten hoy o mañana
- Marcar notificaciones como leídas

### UX
- Identidad visual "Ambilight" — ver [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)
- Diseño responsive — móvil, tablet y desktop
- Animaciones de página y listas con stagger
- Manejo de errores global con snackbars
- Estados de carga y error en todas las vistas

---

## Estructura del Proyecto

```
src/app/
├── core/                    ← Singleton — se carga una sola vez
│   ├── guards/              ← auth.guard.ts
│   ├── interceptors/        ← auth + error interceptors
│   ├── models/              ← interfaces TypeScript
│   └── services/            ← AuthService, SeriesService, TmdbService, NotificationService
│
├── shared/                  ← Componentes reutilizables
│   ├── components/
│   │   ├── series-card/     ← Tarjeta de serie (dumb component)
│   │   ├── star-rating/     ← Calificación con estrellas
│   │   └── confirm-dialog/  ← Diálogo de confirmación
│   ├── pipes/
│   │   └── series-status.pipe.ts
│   └── animations/
│       └── app.animations.ts
│
├── features/                ← Módulos de funcionalidad (lazy loaded)
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   └── series/
│       ├── series-list/     ← Vista principal con filtros y stats
│       ├── series-detail/   ← Detalle con control de episodios
│       └── series-search/   ← Búsqueda en TMDB
│
└── layout/
    └── navbar/              ← Navbar con notificaciones y menú de usuario
```

---

## Rutas

| Ruta | Componente | Protegida |
|------|-----------|-----------|
| `/auth/login` | LoginComponent | No |
| `/auth/register` | RegisterComponent | No |
| `/series` | SeriesListComponent | ✅ Sí |
| `/series/search` | SeriesSearchComponent | ✅ Sí |
| `/series/:id` | SeriesDetailComponent | ✅ Sí |

---

## Patrones de Arquitectura

### Smart vs Dumb Components

```
Smart (features/)          Dumb (shared/)
─────────────────          ──────────────
Conoce los servicios       No conoce servicios
Tiene lógica de negocio    Solo recibe @Input()
Se subscribe a Observables Emite eventos @Output()
```

### Interceptores HTTP

| Interceptor | Responsabilidad |
|-------------|----------------|
| `authInterceptor` | Agrega el JWT a cada request |
| `errorInterceptor` | Maneja 0, 401, 403, 404, 500 globalmente |

### Manejo de errores

```
Error técnico/genérico → errorInterceptor (snackbar automático)
Error de negocio (409) → componente (mensaje contextual)
Error de carga inicial → estado de error en UI con botón reintentar
```

---

## Tests

Los tests corren con Vitest a través del builder `@angular/build:unit-test`
de Angular CLI — **no** con `vitest` directo (no hay `vitest.config.ts`
propio; el entorno de testing lo arma la CLI). Por eso `npm test` invoca
`ng test`, no `vitest`.

```bash
# Ejecutar tests
npm test -- --watch=false

# Ejecutar con cobertura
npm run test:coverage -- --watch=false

# Modo watch durante desarrollo
npm test
```

### Cobertura actual

| Métrica | Resultado |
|---------|-----------|
| Statements | 73.68% |
| Branches | 71.69% |
| Functions | 64.02% |
| Lines | 80.15% |
| Tests totales | 104 (14 archivos) |

### Tests implementados

| Archivo | Qué cubre |
|---------|-----------|
| `auth.service.spec.ts` | Login, registro, manejo de token |
| `series.service.spec.ts` | CRUD de series, paginación |
| `tmdb.service.spec.ts` | Búsqueda en TMDB |
| `series-status.pipe.spec.ts` | Traducción de estados |
| `auth.guard.spec.ts` | Protección de rutas |
| `login.component.spec.ts` / `register.component.spec.ts` | Validación de formularios, submit |
| `series-list.component.spec.ts` | Filtros, paginación, tabs, acciones sobre series |
| `series-detail.component.spec.ts` | Control de episodios, cambio de estado, eliminación |
| `series-search.component.spec.ts` | Búsqueda y alta de series |
| `navbar.component.spec.ts` | Notificaciones, logout |
| `series-card.component.spec.ts` / `star-rating.component.spec.ts` / `confirm-dialog.component.spec.ts` | Componentes compartidos |

---

## Build de Producción

```bash
ng build --configuration production
```

Los archivos se generan en `dist/seritracker-web/`. Están optimizados con:
- Tree shaking
- Lazy loading por ruta
- Output hashing para caché del navegador

### Tamaño del bundle

| Chunk | Raw | Transferido |
|-------|-----|--------------|
| Initial total | ~446 kB | ~112 kB |
| series-list (lazy) | ~91 kB | ~20 kB |
| series-detail (lazy) | ~14 kB | ~3.6 kB |
| series-search (lazy) | ~8 kB | ~2.7 kB |
| login / register (lazy) | ~5 kB c/u | ~1.8 kB c/u |

---

## Variables de Entorno

| Archivo | Uso |
|---------|-----|
| `src/environments/environment.ts` | Desarrollo local |
| `src/environments/environment.prod.ts` | Producción |

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};
```

---

## Convenciones de Código

### Archivos — kebab-case
```
series-list.component.ts
auth.guard.ts
series-status.pipe.ts
```

### Métodos — camelCase con prefijos
```typescript
onSubmit()          // eventos de usuario
loadSeries()        // carga de datos
isLoading: boolean  // booleanos
```

### Commits
```
feat: add series search component
fix: correct episode count on detail page
refactor: extract status badge to shared component
test: add unit tests for series service
```

---

## Checklist antes de cada commit

```
✅ ¿El componente tiene sus 3 archivos separados?
✅ ¿El .ts no tiene HTML ni CSS inline?
✅ ¿El servicio solo tiene lógica HTTP?
✅ ¿Las subscripciones usan takeUntilDestroyed?
✅ ¿Los @for tienen trackBy?
✅ ¿No hay any sin justificación?
✅ ¿Los métodos de evento empiezan con on?
✅ ¿El bloque error no repite lo que ya hace el interceptor?
✅ ¿El commit sigue el formato feat/fix/refactor?
✅ ¿Los colores/espaciados/radios usan tokens de styles.scss (ver DESIGN_SYSTEM.md)?
✅ ¿Las acciones destructivas usan .btn-danger / .btn-danger-solid (nunca color="warn")?
```

---

## Proyectos Relacionados

- **Backend:** [seritracker-api](https://github.com/TuUsuario/seritracker-api) — Spring Boot 3.5
