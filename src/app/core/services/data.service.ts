import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Activity,
  ApiResponse,
  AppNotification,
  MockDataStore,
  ParticipationStats,
  Registration,
  ReminderSchedule,
  User
} from '../models/app.models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly baseUrl = '/api';

  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/users`);
  }

  getActivities(): Observable<ApiResponse<Activity[]>> {
    return this.http.get<ApiResponse<Activity[]>>(`${this.baseUrl}/activities`);
  }

  getActivity(id: string): Observable<ApiResponse<Activity>> {
    return this.http.get<ApiResponse<Activity>>(`${this.baseUrl}/activities/${id}`);
  }

  createActivity(activity: Omit<Activity, 'id' | 'slotsTaken' | 'qrCodeToken'>): Observable<ApiResponse<Activity>> {
    return this.http.post<ApiResponse<Activity>>(`${this.baseUrl}/activities`, activity);
  }

  updateActivity(id: string, activity: Partial<Activity>): Observable<ApiResponse<Activity>> {
    return this.http.put<ApiResponse<Activity>>(`${this.baseUrl}/activities/${id}`, activity);
  }

  deleteActivity(id: string): Observable<ApiResponse<Activity>> {
    return this.http.delete<ApiResponse<Activity>>(`${this.baseUrl}/activities/${id}`);
  }

  getRegistrations(): Observable<ApiResponse<Registration[]>> {
    return this.http.get<ApiResponse<Registration[]>>(`${this.baseUrl}/registrations`);
  }

  getEmployeeRegistrations(employeeId: string): Observable<ApiResponse<Registration[]>> {
    return this.http.get<ApiResponse<Registration[]>>(`${this.baseUrl}/registrations/employee/${employeeId}`);
  }

  registerForActivity(payload: { employeeId: string; activityId: string }): Observable<ApiResponse<Registration>> {
    return this.http.post<ApiResponse<Registration>>(`${this.baseUrl}/registrations`, payload);
  }

  changeRegistration(payload: {
    registrationId: string;
    newActivityId: string;
    employeeId: string;
  }): Observable<ApiResponse<Registration>> {
    return this.http.put<ApiResponse<Registration>>(`${this.baseUrl}/registrations/change`, payload);
  }

  cancelRegistration(registrationId: string, employeeId: string): Observable<ApiResponse<Registration>> {
    return this.http.put<ApiResponse<Registration>>(`${this.baseUrl}/registrations/cancel`, {
      registrationId,
      employeeId
    });
  }

  checkIn(payload: { employeeId: string; qrCodeToken: string }): Observable<ApiResponse<Registration>> {
    return this.http.post<ApiResponse<Registration>>(`${this.baseUrl}/checkin`, payload);
  }

  getNotifications(recipientId: string): Observable<ApiResponse<AppNotification[]>> {
    return this.http.get<ApiResponse<AppNotification[]>>(`${this.baseUrl}/notifications/${recipientId}`);
  }

  broadcastMessage(message: string): Observable<ApiResponse<AppNotification[]>> {
    return this.http.post<ApiResponse<AppNotification[]>>(`${this.baseUrl}/notifications/broadcast`, { message });
  }

  sendParticipationReminder(message: string): Observable<ApiResponse<AppNotification[]>> {
    return this.http.post<ApiResponse<AppNotification[]>>(`${this.baseUrl}/notifications/reminder`, { message });
  }

  getReminderSchedule(): Observable<ApiResponse<ReminderSchedule>> {
    return this.http.get<ApiResponse<ReminderSchedule>>(`${this.baseUrl}/reminder-schedule`);
  }

  updateReminderSchedule(schedule: ReminderSchedule): Observable<ApiResponse<ReminderSchedule>> {
    return this.http.put<ApiResponse<ReminderSchedule>>(`${this.baseUrl}/reminder-schedule`, schedule);
  }

  getParticipationStats(): Observable<ApiResponse<ParticipationStats>> {
    return this.http.get<ApiResponse<ParticipationStats>>(`${this.baseUrl}/stats/participation`);
  }

  regenerateQrCode(activityId: string): Observable<ApiResponse<Activity>> {
    return this.http.post<ApiResponse<Activity>>(`${this.baseUrl}/activities/${activityId}/qr`, {});
  }

  resetMockData(): Observable<ApiResponse<MockDataStore>> {
    return this.http.post<ApiResponse<MockDataStore>>(`${this.baseUrl}/reset`, {});
  }
}
