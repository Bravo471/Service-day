import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Activity, AppNotification, Registration } from '../../../core/models/app.models';

@Component({
  selector: 'app-opportunities',
  templateUrl: './opportunities.component.html',
  styleUrl: './opportunities.component.css'
})
export class OpportunitiesComponent implements OnInit {
  activities: Activity[] = [];
  currentRegistration: Registration | null = null;
  notifications: AppNotification[] = [];
  loading = true;
  message = '';
  errorMessage = '';

  constructor(
    private readonly dataService: DataService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const employeeId = this.authService.currentUser?.id ?? '';

    this.dataService.getActivities().subscribe({
      next: (response) => {
        this.activities = response.data;
      }
    });

    this.dataService.getEmployeeRegistrations(employeeId).subscribe({
      next: (response) => {
        this.currentRegistration = response.data[0] ?? null;
        this.loading = false;
      }
    });

    this.dataService.getNotifications(employeeId).subscribe({
      next: (response) => {
        this.notifications = response.data.slice(0, 5);
      }
    });
  }

  register(activity: Activity): void {
    const employeeId = this.authService.currentUser?.id;
    if (!employeeId) {
      return;
    }

    this.dataService.registerForActivity({ employeeId, activityId: activity.id }).subscribe({
      next: (response) => {
        this.message = response.message ?? 'Registered successfully.';
        this.errorMessage = '';
        this.loadData();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Registration failed.';
        this.message = '';
      }
    });
  }

  isFull(activity: Activity): boolean {
    return activity.slotsTaken >= activity.maxSlots;
  }

  isCutOffPassed(activity: Activity): boolean {
    return new Date(activity.cutOffDateTime).getTime() < Date.now();
  }

  getAvailabilityLabel(activity: Activity): string {
    if (this.isCutOffPassed(activity)) {
      return 'Cut-off passed';
    }
    if (this.isFull(activity)) {
      return 'Full';
    }
    return 'Open';
  }

  getAvailabilityVariant(activity: Activity): 'success' | 'warning' | 'danger' {
    if (this.isCutOffPassed(activity) || this.isFull(activity)) {
      return this.isFull(activity) ? 'danger' : 'warning';
    }
    return 'success';
  }
}
