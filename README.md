# SeriesTracker Web

Aplicación web para el seguimiento de series de televisión. Construida con Angular 21 y Angular Material, consume la [SeriesTracker API](https://github.com/TuUsuario/seritracker-api).

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Angular | 21 |
| UI Components | Angular Material | 21 |
| Estilos | SCSS + Angular Material Theme | — |
| HTTP | Angular HttpClient | — |
| Routing | Angular Router con Lazy Loading | — |
| Forms | Angular Reactive Forms | — |
| Animaciones | Angular Animations | — |
| Tests | Vitest | 4 |

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

---

## Funcionalidades

### Autenticación
- Registro e inicio de sesión con JWT
- Sesión persistente en localStorage
- Redirección automática al expirar el token

### Gestión de Series
- **Agregar series** buscando directamente en TMDB
- **4 estados** — Viendo, Por ver, Completada, Abandonada
- **Calificación** de 1 a 10 con estrellas
- **Control de episodios** — marcar episodios vistos
- **Filtros** por estado y búsqueda por nombre

### Notificaciones
- Campana en el navbar con badge de no leídas
- Notificaciones de episodios que emiten hoy o mañana
- Marcar notificaciones como leídas

### UX
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

```bash
# Ejecutar tests
ng test --watch=false

# Ejecutar con cobertura
ng test --watch=false --coverage

# Modo watch durante desarrollo
ng test
```

### Cobertura actual

| Métrica | Resultado |
|---------|-----------|
| Statements | 86.2% |
| Branches | 85.71% |
| Tests totales | 26 |

### Tests implementados

| Archivo | Tests |
|---------|-------|
| `auth.service.spec.ts` | 6 |
| `series.service.spec.ts` | 9 |
| `tmdb.service.spec.ts` | 4 |
| `series-status.pipe.spec.ts` | 5 |
| `auth.guard.spec.ts` | 2 |

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

| Chunk | Tamaño |
|-------|--------|
| Initial total | ~422 kB raw / ~107 kB transferido |
| series-list (lazy) | ~35 kB |
| series-detail (lazy) | ~12 kB |
| series-search (lazy) | ~8 kB |

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
```

---

## Proyectos Relacionados

- **Backend:** [seritracker-api](https://github.com/TuUsuario/seritracker-api) — Spring Boot 3.5
