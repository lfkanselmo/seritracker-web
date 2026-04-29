# SeriesTracker — Arquitectura Frontend Angular

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Angular | v21 |
| UI Components | Angular Material | v21 |
| Estilos | SCSS + Angular Material Theme | — |
| HTTP | Angular HttpClient | — |
| Routing | Angular Router (Lazy Loading) | — |
| Forms | Angular Reactive Forms | — |
| State | Estado local en componentes | — |

---

## Estructura de Carpetas

```
src/app/
│
├── core/                          ← Singleton — se carga una sola vez
│   ├── guards/
│   │   └── auth.guard.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts    ← Agrega JWT a cada request
│   │   └── error.interceptor.ts   ← Maneja errores HTTP globalmente
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── series.model.ts
│   │   └── api-response.model.ts
│   └── services/
│       ├── auth.service.ts
│       ├── series.service.ts
│       └── tmdb.service.ts
│
├── shared/                        ← Componentes reutilizables
│   ├── components/
│   │   ├── series-card/
│   │   │   ├── series-card.component.ts
│   │   │   ├── series-card.component.html
│   │   │   └── series-card.component.scss
│   │   ├── star-rating/
│   │   │   ├── star-rating.component.ts
│   │   │   ├── star-rating.component.html
│   │   │   └── star-rating.component.scss
│   │   └── confirm-dialog/
│   │       ├── confirm-dialog.component.ts
│   │       ├── confirm-dialog.component.html
│   │       └── confirm-dialog.component.scss
│   └── pipes/
│       └── series-status.pipe.ts
│
├── features/                      ← Módulos de funcionalidad
│   ├── auth/
│   │   ├── login/
│   │   │   ├── login.component.ts
│   │   │   ├── login.component.html
│   │   │   └── login.component.scss
│   │   └── register/
│   │       ├── register.component.ts
│   │       ├── register.component.html
│   │       └── register.component.scss
│   └── series/
│       ├── series-list/
│       │   ├── series-list.component.ts
│       │   ├── series-list.component.html
│       │   └── series-list.component.scss
│       ├── series-detail/
│       │   ├── series-detail.component.ts
│       │   ├── series-detail.component.html
│       │   └── series-detail.component.scss
│       └── series-search/
│           ├── series-search.component.ts
│           ├── series-search.component.html
│           └── series-search.component.scss
│
└── layout/                        ← Estructura visual global
    └── navbar/
        ├── navbar.component.ts
        ├── navbar.component.html
        └── navbar.component.scss
```

---

## Principios de Arquitectura

### Separación de responsabilidades por capa

```
core/services    → solo lógica HTTP, sin estado UI
features/        → lógica de cada feature, orquesta servicios
shared/          → componentes puros, sin lógica de negocio
layout/          → estructura visual global
```

### Flujo de datos unidireccional

```
Service (HTTP) → Component (lógica) → Template (vista)
                      ↑
              Guard / Interceptor
```

---

## Lineamientos de Componentes

### Cada componente tiene exactamente tres archivos

```
nombre.component.ts     ← lógica, nunca HTML inline
nombre.component.html   ← template, nunca lógica
nombre.component.scss   ← estilos, nunca globales
```

### El .ts NUNCA tiene
- HTML inline (`template: \`...\``)
- CSS inline (`styles: [...]`)
- Llamadas HTTP directas — siempre a través de un servicio

### El .html NUNCA tiene
- Lógica de negocio compleja
- Más de 3 niveles de anidamiento
- Strings hardcodeados — usar constantes o pipes

### El .scss NUNCA tiene
- Estilos globales — esos van en `styles.scss`
- Variables hardcodeadas — usar variables CSS o el tema de Material

---

## Lineamientos de Servicios

```typescript
// ✅ BIEN — servicio enfocado, un solo propósito
@Injectable({ providedIn: 'root' })
export class SeriesService {
  getAll(userId: number): Observable<ApiResponse<UserSeries[]>>
  getById(id: number): Observable<ApiResponse<UserSeries>>
  create(...): Observable<ApiResponse<UserSeries>>
  updateStatus(...): Observable<ApiResponse<UserSeries>>
}
```

### Reglas
- Un servicio por dominio — AuthService, SeriesService, TmdbService
- Siempre devolver Observable — nunca Promise en servicios HTTP
- Nunca subscribirse dentro de un servicio
- Manejo de errores en el componente o interceptor, no en el servicio

---

## Manejo de Errores HTTP

### Responsabilidades

| Quién | Qué maneja |
|-------|-----------|
| `errorInterceptor` | 0 (sin conexión), 401 (sesión expirada), 403 (sin permisos), 404 (no encontrado), 500 (error servidor) |
| Componente | 409 (duplicado), errores con contexto específico de negocio |
| Estado de error en UI | `loadSeries` muestra bloque de error con botón reintentar |

### Regla principal

```
Si el error es técnico o genérico → errorInterceptor
Si el error necesita contexto de negocio → componente
```

### El bloque error en subscripciones

```typescript
// ✅ Si el interceptor ya lo cubre — dejar vacío
error: () => {}

// ✅ Si necesita lógica específica de negocio (ej: 409 duplicado)
error: (err) => {
  if (err.status === 409) {
    this.errorMessage = 'Esta serie ya está en tu lista';
  }
}

// ✅ Si necesita mostrar estado de error en la UI
error: (err) => {
  this.hasError     = true;
  this.errorMessage = err.error?.message ?? 'Error al cargar';
  this.isLoading    = false;
}

// ❌ NUNCA repetir lo que ya hace el interceptor
error: () => this.snackBar.open('Error del servidor', '✕')
```

### Comportamiento del errorInterceptor por código

| Código | Acción |
|--------|--------|
| `0` | Snackbar: "Sin conexión con el servidor" |
| `401` | Logout + redirect a /auth/login + snackbar |
| `403` | Snackbar: "No tienes permisos" |
| `404` | Snackbar: "Recurso no encontrado" |
| `409` | Sin acción — lo maneja el componente |
| `500` | Snackbar: "Error interno del servidor" |

---

## Nomenclatura

### Archivos — kebab-case
```
series-list.component.ts
auth.guard.ts
auth.interceptor.ts
error.interceptor.ts
series.model.ts
series-status.pipe.ts
```

### Clases — PascalCase
```typescript
export class SeriesListComponent { }
export class AuthService { }
export class SeriesStatusPipe { }
export interface UserSeries { }
```

### Variables y métodos — camelCase
```typescript
userId: number
isLoading: boolean
seriesList: UserSeries[]
```

### Convención de métodos
```typescript
// Ciclo de vida
ngOnInit(): void
ngOnDestroy(): void

// Eventos de usuario → on + Acción
onSubmit(): void
onDelete(): void
onStatusChange(status: SeriesStatus): void

// Carga de datos → load + Entidad
loadSeries(): void
loadSeriesDetail(): void

// Booleanos → is / has / can
isLoading: boolean
hasError: boolean
canDelete(): boolean
```

### Templates
```html
<!-- Eventos -->
(click)="onDelete()"
(submit)="onSubmit()"

<!-- Property Binding -->
[disabled]="isLoading"
[src]="series.posterUrl"

<!-- Two-way — solo en formularios -->
[(ngModel)]="searchQuery"
```

---

## Patrones de Diseño

| Patrón | Dónde | Por qué |
|--------|-------|---------|
| Smart/Dumb Components | features/ vs shared/ | Separa lógica de presentación |
| Observable pattern | Servicios HTTP | Manejo reactivo de datos |
| Lazy Loading | Rutas de features | Carga solo lo necesario |
| Interceptor | HTTP requests | JWT y errores centralizados |
| Guard | Rutas protegidas | Autenticación declarativa |
| Pipe | Templates | Transformación de datos reutilizable |

### Smart vs Dumb Components

```
Smart (features/)          Dumb (shared/)
─────────────────          ──────────────
Conoce los servicios       No conoce servicios
Tiene lógica de negocio    Solo recibe @Input()
Se subscribe a Observables Emite eventos @Output()
Orquesta otros componentes Es reutilizable
```

---

## Manejo de Estado

Estado local en componentes — claramente tipado y agrupado:

```typescript
export class SeriesListComponent {
  // Estado de datos
  seriesList: UserSeries[] = [];

  // Estado de UI
  isLoading    = false;
  hasError     = false;
  errorMessage = '';
  activeTab: SeriesStatus | null = null;
  searchQuery  = '';
}
```

---

## Manejo de Subscripciones

```typescript
// ✅ BIEN — usando takeUntilDestroyed (Angular 16+)
export class SeriesListComponent {
  private destroyRef = inject(DestroyRef);

  loadSeries(): void {
    this.seriesService.getAll(this.userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(response => {
        this.seriesList = response.data;
      });
  }
}

// ❌ MAL — subscripción sin cancelar
loadSeries(): void {
  this.seriesService.getAll(this.userId)
    .subscribe(response => {
      this.seriesList = response.data;
    });
}
```

---

## Buenas Prácticas

### Generales
- Todo componente es `standalone: true` — sin NgModules
- Usar `@if` y `@for` — sintaxis moderna Angular 17+
- Tipado estricto — nunca `any` sin justificación
- Sin lógica en el constructor — usar `ngOnInit`

### Performance
- Lazy loading en todas las rutas de features
- `trackBy` en todos los `@for` con listas
- Imágenes con `loading="lazy"`

### Seguridad
- Nunca interpolar HTML sin sanitizar
- Solo guardar el token en localStorage

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
```
