import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../core/services/data.service';
import { ReminderSchedule } from '../../../core/models/app.models';

@Component({
  selector: 'app-notifications-admin',
  templateUrl: './notifications-admin.component.html',
  styleUrl: './notifications-admin.component.css'
})
export class NotificationsAdminComponent implements OnInit {
  schedule: ReminderSchedule = { intervals: [7, 3, 1], enabled: true };
  broadcastMessage = '';
  message = '';
  errorMessage = '';

  constructor(private readonly dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getReminderSchedule().subscribe({
      next: (response) => {
        this.schedule = response.data;
      }
    });
  }

  saveSchedule(): void {
    this.dataService.updateReminderSchedule(this.schedule).subscribe({
      next: (response) => {
        this.message = response.message ?? 'Reminder schedule saved.';
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Unable to save schedule.';
      }
    });
  }

  sendBroadcast(): void {
    if (!this.broadcastMessage.trim()) {
      this.errorMessage = 'Please enter a broadcast message.';
      return;
    }

    this.dataService.broadcastMessage(this.broadcastMessage.trim()).subscribe({
      next: (response) => {
        this.message = response.message ?? 'Broadcast sent.';
        this.broadcastMessage = '';
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Unable to send broadcast.';
      }
    });
  }

  triggerScheduledReminders(): void {
    const reminders = this.schedule.intervals.map((days) =>
      this.dataService.broadcastMessage(
        `Automated reminder: Service Day activity starts in ${days} day(s). Please confirm your registration.`
      )
    );

    reminders[0].subscribe({
      next: () => {
        this.message = 'Scheduled reminders simulated for 1 week, 3 days, and 1 day intervals.';
      }
    });
  }
}
