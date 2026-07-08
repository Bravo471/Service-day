import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
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
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<ApiResponse<User[]>> {
    return this.getJson<User[]>(`${this.baseUrl}/users`);
  }

  getActivities(): Observable<ApiResponse<Activity[]>> {
    return this.getJson<Activity[]>(`${this.baseUrl}/activities`);
  }

  getActivity(id: string): Observable<ApiResponse<Activity>> {
    return this.getJson<Activity>(`${this.baseUrl}/activities/${id}`);
  }

  createActivity(activity: Omit<Activity, 'id' | 'slotsTaken' | 'qrCodeToken'>): Observable<ApiResponse<Activity>> {
    return this.postJson<Activity>(`${this.baseUrl}/activities`, activity);
  }

  updateActivity(id: string, activity: Partial<Activity>): Observable<ApiResponse<Activity>> {
    return this.putJson<Activity>(`${this.baseUrl}/activities/${id}`, activity);
  }

  deleteActivity(id: string): Observable<ApiResponse<Activity>> {
    return this.deleteJson<Activity>(`${this.baseUrl}/activities/${id}`);
  }

  getRegistrations(): Observable<ApiResponse<Registration[]>> {
    return this.getJson<Registration[]>(`${this.baseUrl}/registrations`);
  }

  getEmployeeRegistrations(employeeId: string): Observable<ApiResponse<Registration[]>> {
    return this.getJson<Registration[]>(`${this.baseUrl}/registrations/employee/${employeeId}`);
  }

  registerForActivity(payload: { employeeId: string; activityId: string }): Observable<ApiResponse<Registration>> {
    return this.postJson<Registration>(`${this.baseUrl}/registrations`, payload);
  }

  changeRegistration(payload: {
    registrationId: string;
    newActivityId: string;
    employeeId: string;
  }): Observable<ApiResponse<Registration>> {
    return this.putJson<Registration>(`${this.baseUrl}/registrations/change`, payload);
  }

  cancelRegistration(registrationId: string, employeeId: string): Observable<ApiResponse<Registration>> {
    return this.putJson<Registration>(`${this.baseUrl}/registrations/cancel`, {
      registrationId,
      employeeId
    });
  }

  checkIn(payload: { employeeId: string; qrCodeToken: string }): Observable<ApiResponse<Registration>> {
    return this.postJson<Registration>(`${this.baseUrl}/checkin`, payload);
  }

  getNotifications(recipientId: string): Observable<ApiResponse<AppNotification[]>> {
    return this.getJson<AppNotification[]>(`${this.baseUrl}/notifications/${recipientId}`);
  }

  broadcastMessage(message: string): Observable<ApiResponse<AppNotification[]>> {
    return this.postJson<AppNotification[]>(`${this.baseUrl}/notifications/broadcast`, { message });
  }

  sendParticipationReminder(message: string): Observable<ApiResponse<AppNotification[]>> {
    return this.postJson<AppNotification[]>(`${this.baseUrl}/notifications/reminder`, { message });
  }

  getReminderSchedule(): Observable<ApiResponse<ReminderSchedule>> {
    return this.getJson<ReminderSchedule>(`${this.baseUrl}/reminder-schedule`);
  }

  updateReminderSchedule(schedule: ReminderSchedule): Observable<ApiResponse<ReminderSchedule>> {
    return this.putJson<ReminderSchedule>(`${this.baseUrl}/reminder-schedule`, schedule);
  }

  getParticipationStats(): Observable<ApiResponse<ParticipationStats>> {
    return this.getJson<ParticipationStats>(`${this.baseUrl}/stats/participation`);
  }

  regenerateQrCode(activityId: string): Observable<ApiResponse<Activity>> {
    return this.postJson<Activity>(`${this.baseUrl}/activities/${activityId}/qr`, {});
  }

  resetMockData(): Observable<ApiResponse<MockDataStore>> {
    return this.postJson<MockDataStore>(`${this.baseUrl}/reset`, {});
  }

  private getJson<T>(url: string): Observable<ApiResponse<T>> {
    return this.http.get<unknown>(url).pipe(map((response) => this.normalizeResponse<T>(response)));
  }

  private postJson<T>(url: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.post<unknown>(url, body).pipe(map((response) => this.normalizeResponse<T>(response)));
  }

  private putJson<T>(url: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.put<unknown>(url, body).pipe(map((response) => this.normalizeResponse<T>(response)));
  }

  private deleteJson<T>(url: string): Observable<ApiResponse<T>> {
    return this.http.delete<unknown>(url).pipe(map((response) => this.normalizeResponse<T>(response)));
  }

  private normalizeResponse<T>(response: unknown): ApiResponse<T> {
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      return response as ApiResponse<T>;
    }

    return {
      success: true,
      data: response as T
    };
  }
}
