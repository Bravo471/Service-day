import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../core/services/data.service';
import { Activity, Registration, User } from '../../../core/models/app.models';

@Component({
  selector: 'app-qr-codes',
  templateUrl: './qr-codes.component.html',
  styleUrl: './qr-codes.component.css'
})
export class QrCodesComponent implements OnInit {
  activities: Activity[] = [];
  registrations: Registration[] = [];
  users: User[] = [];
  selectedActivityId = '';
  loading = true;
  message = '';
  errorMessage = '';

  constructor(private readonly dataService: DataService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.dataService.getActivities().subscribe({
      next: (response) => {
        this.activities = response.data;
        this.selectedActivityId = this.activities[0]?.id ?? '';
      }
    });

    this.dataService.getRegistrations().subscribe({
      next: (response) => {
        this.registrations = response.data;
      }
    });

    this.dataService.getUsers().subscribe({
      next: (response) => {
        this.users = response.data;
        this.loading = false;
      }
    });
  }

  get selectedActivity(): Activity | undefined {
    return this.activities.find((activity) => activity.id === this.selectedActivityId);
  }

  regenerateQr(): void {
    if (!this.selectedActivityId) {
      return;
    }

    this.dataService.regenerateQrCode(this.selectedActivityId).subscribe({
      next: (response) => {
        this.message = response.message ?? 'QR code regenerated.';
        this.loadData();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Unable to regenerate QR code.';
      }
    });
  }

  getCheckInsForActivity(activityId: string): Registration[] {
    return this.registrations.filter(
      (registration) => registration.activityId === activityId && registration.checkedIn
    );
  }

  getEmployeeName(employeeId: string): string {
    return this.users.find((user) => user.id === employeeId)?.name ?? employeeId;
  }
}
