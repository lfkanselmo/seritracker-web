import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        data: { animation: 'auth' },
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: 'register',
        data: { animation: 'auth' },
        loadComponent: () => import('./features/auth/register/register.component')
          .then(m => m.RegisterComponent)
      },
      {
        path: 'forgot-password',
        data: { animation: 'auth' },
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component')
          .then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        data: { animation: 'auth' },
        loadComponent: () => import('./features/auth/reset-password/reset-password.component')
          .then(m => m.ResetPasswordComponent)
      }
    ]
  },
  {
    path: 'series',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        data: { animation: 'series-list' },
        loadComponent: () => import('./features/series/series-list/series-list.component')
          .then(m => m.SeriesListComponent)
      },
      {
        path: 'search',
        data: { animation: 'series-search' },
        loadComponent: () => import('./features/series/series-search/series-search.component')
          .then(m => m.SeriesSearchComponent)
      },
      {
        path: ':id',
        data: { animation: 'series-detail' },
        loadComponent: () => import('./features/series/series-detail/series-detail.component')
          .then(m => m.SeriesDetailComponent)
      }
    ]
  },
  {
    path: 'account',
    canActivate: [authGuard],
    data: { animation: 'account' },
    loadComponent: () => import('./features/account/account.component')
      .then(m => m.AccountComponent)
  },
  {
    path: 'calendar',
    canActivate: [authGuard],
    data: { animation: 'calendar' },
    loadComponent: () => import('./features/calendar/calendar.component')
      .then(m => m.CalendarComponent)
  },
  {
    path: '**',
    redirectTo: 'series'
  }
];