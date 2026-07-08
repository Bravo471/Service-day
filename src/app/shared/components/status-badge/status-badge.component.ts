import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: '<span class="badge" [ngClass]="variant">{{ label }}</span>',
  styleUrl: './status-badge.component.css'
})
export class StatusBadgeComponent {
  @Input() label = '';
  @Input() variant: 'success' | 'warning' | 'danger' | 'info' = 'info';
}
