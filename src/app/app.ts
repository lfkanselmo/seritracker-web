import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { routeAnimations } from './shared/animations/app.animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  animations: [routeAnimations],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss',
})
export class AppComponent {
  getRouteState(outlet: RouterOutlet): string {
    return outlet.activatedRouteData?.['animation'] ?? '';
  }
}
