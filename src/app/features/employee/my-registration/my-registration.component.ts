import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { DataService } from '../../../core/services/data.service';
import { Activity, Registration } from '../../../core/models/app.models';

@Component({
  selector: 'app-my-registration',
  templateUrl: './my-registration.component.html',
  styleUrl: './my-registration.component.css'
})
export class MyRegistrationComponent implements OnInit {
  registration: Registration | null = null;
  activity: Activity | null = null;
  activities: Activity[] = [];
  selectedActivityId = '';
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
        this.registration = response.data[0] ?? null;
        if (this.registration) {
          this.dataService.getActivity(this.registration.activityId).subscribe({
            next: (activityResponse) => {
              this.activity = activityResponse.data;
              this.loading = false;
            }
          });
        } else {
          this.activity = null;
          this.loading = false;
        }
      },
      error: () => {
        this.errorMessage = 'Unable to load registration.';
        this.loading = false;
      }
    });
  }

  canModify(): boolean {
    if (!this.activity) {
      return false;
    }
    return new Date(this.activity.cutOffDateTime).getTime() >= Date.now();
  }

  changeRegistration(): void {
    const employeeId = this.authService.currentUser?.id;
    if (!employeeId || !this.registration || !this.selectedActivityId) {
      return;
    }

    this.dataService
      .changeRegistration({
        registrationId: this.registration.id,
        newActivityId: this.selectedActivityId,
        employeeId
      })
      .subscribe({
        next: (response) => {
          this.message = response.message ?? 'Registration updated.';
          this.errorMessage = '';
          this.loadData();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'Unable to change registration.';
        }
      });
  }

  cancelRegistration(): void {
    const employeeId = this.authService.currentUser?.id;
    if (!employeeId || !this.registration) {
      return;
    }

    this.dataService.cancelRegistration(this.registration.id, employeeId).subscribe({
      next: (response) => {
        this.message = response.message ?? 'Registration cancelled.';
        this.errorMessage = '';
        this.loadData();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Unable to cancel registration.';
      }
    });
  }
}
