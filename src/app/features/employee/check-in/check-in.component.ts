import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.component.html',
  styleUrl: './check-in.component.css'
})
export class CheckInComponent {
  qrCodeToken = '';
  message = '';
  errorMessage = '';

  constructor(
    private readonly dataService: DataService,
    private readonly authService: AuthService
  ) {}

  checkIn(): void {
    const employeeId = this.authService.currentUser?.id;
    if (!employeeId || !this.qrCodeToken.trim()) {
      this.errorMessage = 'Please enter or scan a QR code token.';
      return;
    }

    this.dataService.checkIn({ employeeId, qrCodeToken: this.qrCodeToken.trim() }).subscribe({
      next: (response) => {
        this.message = response.message ?? 'Checked in successfully.';
        this.errorMessage = '';
        this.qrCodeToken = '';
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Check-in failed.';
        this.message = '';
      }
    });
  }
}
