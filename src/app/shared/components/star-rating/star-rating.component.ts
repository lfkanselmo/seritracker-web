import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './star-rating.component.html',
  styleUrl:    './star-rating.component.scss'
})
export class StarRatingComponent {

  @Input() value: number | null = null;
  @Input() readonly = false;

  @Output() ratingChange = new EventEmitter<number>();

  stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  hoveredStar: number | null = null;

  get displayValue(): number {
    return this.hoveredStar ?? this.value ?? 0;
  }

  onHover(star: number): void {
    if (!this.readonly) this.hoveredStar = star;
  }

  onLeave(): void {
    this.hoveredStar = null;
  }

  onSelect(star: number): void {
    if (!this.readonly) this.ratingChange.emit(star);
  }
}