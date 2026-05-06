import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { routeAnimations } from './shared/animations/app.animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  animations: [routeAnimations],
  template: `
    <div [@routeAnimations]="getRouteState(outlet)" style="position: relative">
      <router-outlet #outlet="outlet" />
    </div>
  `
})
export class AppComponent {
  getRouteState(outlet: RouterOutlet): string {
    return outlet.activatedRouteData?.['animation'] ?? '';
  }
}