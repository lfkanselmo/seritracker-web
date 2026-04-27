import { Component } from '@angular/core';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';

@Component({
  selector: 'app-series-search',
  standalone: true,
  imports: [NavbarComponent],
  template: `
    <app-navbar />
    <div style="padding: 40px; text-align: center; color: white;">
      Búsqueda — próximamente
    </div>
  `
})
export class SeriesSearchComponent {}