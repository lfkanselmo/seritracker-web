import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'series',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component')
          .then(m => m.RegisterComponent)
      }
    ]
  },
  /*
  {
    path: 'series',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/series/series-list/series-list.component')
          .then(m => m.SeriesListComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/series/series-detail/series-detail.component')
          .then(m => m.SeriesDetailComponent)
      }
    ]
  },
  */
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];