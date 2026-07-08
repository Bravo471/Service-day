import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-slot-meter',
  templateUrl: './slot-meter.component.html',
  styleUrl: './slot-meter.component.css'
})
export class SlotMeterComponent {
  @Input() taken = 0;
  @Input() max = 1;

  get percent(): number {
    return Math.min(100, Math.round((this.taken / this.max) * 100));
  }
}
