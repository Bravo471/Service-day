import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../core/services/data.service';
import {
  Activity,
  ParticipationStats,
  Registration,
  User
} from '../../../core/models/app.models';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrl: './monitoring.component.css'
})
export class MonitoringComponent implements OnInit {
  stats: ParticipationStats | null = null;
  registrations: Registration[] = [];
  activities: Activity[] = [];
  users: User[] = [];
  loading = true;
  message = '';
  errorMessage = '';

  constructor(private readonly dataService: DataService) {}

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.loading = true;
    this.dataService.getParticipationStats().subscribe({
      next: (response) => {
        this.stats = response.data;
      }
    });

    this.dataService.getRegistrations().subscribe({
      next: (response) => {
        this.registrations = response.data;
      }
    });

    this.dataService.getActivities().subscribe({
      next: (response) => {
        this.activities = response.data;
      }
    });

    this.dataService.getUsers().subscribe({
      next: (response) => {
        this.users = response.data.filter((user) => user.role === 'employee');
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load monitoring data.';
        this.loading = false;
      }
    });
  }

  sendParticipationReminder(): void {
    this.dataService
      .sendParticipationReminder(
        'Reminder: Please register for a Service Day activity before the cut-off deadline.'
      )
      .subscribe({
        next: (response) => {
          this.message = response.message ?? 'Reminders sent.';
        },
        error: (error) => {
          this.errorMessage = error?.error?.message ?? 'Unable to send reminders.';
        }
      });
  }

  getEmployeeName(employeeId: string): string {
    return this.users.find((user) => user.id === employeeId)?.name ?? employeeId;
  }

  getActivityName(activityId: string): string {
    return this.activities.find((activity) => activity.id === activityId)?.ngoName ?? activityId;
  }
}
