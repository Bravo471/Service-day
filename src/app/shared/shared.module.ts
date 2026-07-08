import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { SlotMeterComponent } from './components/slot-meter/slot-meter.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    SlotMeterComponent
  ],
  imports: [CommonModule, RouterModule, FormsModule],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    SlotMeterComponent
  ]
})
export class SharedModule {}
