import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../core/services/data.service';
import { Activity } from '../../../core/models/app.models';

@Component({
  selector: 'app-activity-management',
  templateUrl: './activity-management.component.html',
  styleUrl: './activity-management.component.css'
})
export class ActivityManagementComponent implements OnInit {
  activities: Activity[] = [];
  loading = true;
  message = '';
  errorMessage = '';
  editingId: string | null = null;

  formModel = this.createEmptyForm();

  constructor(private readonly dataService: DataService) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.loading = true;
    this.dataService.getActivities().subscribe({
      next: (response) => {
        this.activities = response.data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load NGO activities.';
        this.loading = false;
      }
    });
  }

  startCreate(): void {
    this.editingId = null;
    this.formModel = this.createEmptyForm();
    this.message = '';
    this.errorMessage = '';
  }

  startEdit(activity: Activity): void {
    this.editingId = activity.id;
    this.formModel = {
      ngoName: activity.ngoName,
      serviceType: activity.serviceType,
      description: activity.description,
      location: activity.location,
      date: activity.date,
      time: activity.time,
      maxSlots: activity.maxSlots,
      cutOffDateTime: activity.cutOffDateTime.slice(0, 16),
      status: activity.status
    };
    this.message = '';
    this.errorMessage = '';
  }

  saveActivity(): void {
    const payload = {
      ...this.formModel,
      cutOffDateTime: new Date(this.formModel.cutOffDateTime).toISOString()
    };

    const request$ = this.editingId
      ? this.dataService.updateActivity(this.editingId, payload)
      : this.dataService.createActivity(payload);

    request$.subscribe({
      next: (response) => {
        this.message = response.message ?? 'Saved successfully.';
        this.startCreate();
        this.loadActivities();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Unable to save activity.';
      }
    });
  }

  deleteActivity(activity: Activity): void {
    if (!confirm(`Remove ${activity.ngoName}?`)) {
      return;
    }

    this.dataService.deleteActivity(activity.id).subscribe({
      next: (response) => {
        this.message = response.message ?? 'Activity removed.';
        this.loadActivities();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'Unable to delete activity.';
      }
    });
  }

  private createEmptyForm() {
    return {
      ngoName: '',
      serviceType: '',
      description: '',
      location: '',
      date: '',
      time: '',
      maxSlots: 10,
      cutOffDateTime: '',
      status: 'approved' as Activity['status']
    };
  }
}
