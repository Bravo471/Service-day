import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import {
  Activity,
  ApiResponse,
  AppNotification,
  MockDataStore,
  ParticipationStats,
  Registration,
  ReminderSchedule
} from '../models/app.models';

const STORAGE_KEY = 'service-day-mock-store';

@Injectable()
export class MockApiInterceptor implements HttpInterceptor {
  private store: MockDataStore | null = null;

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!req.url.startsWith('/api/')) {
      return next.handle(req);
    }

    return this.ensureStore().pipe(
      switchMap(() => {
        const response = this.handleApiRequest(req.method, req.url, req.body);
        return of(new HttpResponse({ status: response.status, body: response.body })).pipe(delay(250));
      })
    );
  }

  private ensureStore(): Observable<MockDataStore> {
    if (this.store) {
      return of(this.store);
    }

    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      this.store = JSON.parse(cached) as MockDataStore;
      return of(this.store);
    }

    return new Observable<MockDataStore>((observer) => {
      fetch('assets/data/mock-data.json')
        .then((res) => res.json())
        .then((data: MockDataStore) => {
          this.store = data;
          this.persistStore();
          observer.next(data);
          observer.complete();
        })
        .catch((error) => observer.error(error));
    });
  }

  private handleApiRequest(
    method: string,
    url: string,
    body: unknown
  ): { status: number; body: ApiResponse<unknown> } {
    const store = this.store!;
    const path = url.replace('/api/', '');

    if (method === 'GET' && path === 'users') {
      return this.ok(store.users);
    }

    if (method === 'GET' && path === 'activities') {
      return this.ok(store.activities.filter((activity) => activity.status === 'approved'));
    }

    if (method === 'GET' && path.startsWith('activities/') && !path.includes('/qr')) {
      const id = path.split('/')[1];
      const activity = store.activities.find((item) => item.id === id);
      return activity ? this.ok(activity) : this.fail('Activity not found');
    }

    if (method === 'POST' && path === 'activities') {
      const payload = body as Omit<Activity, 'id' | 'slotsTaken' | 'qrCodeToken'>;
      const activity: Activity = {
        ...payload,
        id: this.createId('act'),
        slotsTaken: 0,
        qrCodeToken: `QR-${payload.ngoName.slice(0, 3).toUpperCase()}-${Date.now()}`
      };
      store.activities.push(activity);
      this.persistStore();
      return this.ok(activity, 'NGO activity created successfully.');
    }

    if (method === 'PUT' && path.startsWith('activities/') && !path.includes('/qr')) {
      const id = path.split('/')[1];
      const index = store.activities.findIndex((item) => item.id === id);
      if (index === -1) {
        return this.fail('Activity not found');
      }
      store.activities[index] = { ...store.activities[index], ...(body as Partial<Activity>) };
      this.persistStore();
      return this.ok(store.activities[index], 'NGO activity updated successfully.');
    }

    if (method === 'DELETE' && path.startsWith('activities/')) {
      const id = path.split('/')[1];
      const index = store.activities.findIndex((item) => item.id === id);
      if (index === -1) {
        return this.fail('Activity not found');
      }
      const [removed] = store.activities.splice(index, 1);
      this.persistStore();
      return this.ok(removed, 'NGO activity removed successfully.');
    }

    if (method === 'GET' && path === 'registrations') {
      return this.ok(store.registrations.filter((item) => item.status === 'confirmed'));
    }

    if (method === 'GET' && path.startsWith('registrations/employee/')) {
      const employeeId = path.split('/')[2];
      const registrations = store.registrations.filter(
        (item) => item.employeeId === employeeId && item.status === 'confirmed'
      );
      return this.ok(registrations);
    }

    if (method === 'POST' && path === 'registrations') {
      return this.handleRegistration(body as { employeeId: string; activityId: string });
    }

    if (method === 'PUT' && path === 'registrations/change') {
      return this.handleChangeRegistration(
        body as { registrationId: string; newActivityId: string; employeeId: string }
      );
    }

    if (method === 'PUT' && path === 'registrations/cancel') {
      return this.handleCancelRegistration(body as { registrationId: string; employeeId: string });
    }

    if (method === 'POST' && path === 'checkin') {
      return this.handleCheckIn(body as { employeeId: string; qrCodeToken: string });
    }

    if (method === 'GET' && path.startsWith('notifications/')) {
      const recipientId = path.split('/')[1];
      const notifications = store.notifications.filter(
        (item) => item.recipientId === recipientId || item.recipientId === 'all'
      );
      return this.ok(notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }

    if (method === 'POST' && path === 'notifications/broadcast') {
      const message = (body as { message: string }).message;
      const notification = this.createNotification('all', 'broadcast', message);
      store.notifications.unshift(notification);
      this.persistStore();
      return this.ok([notification], 'Broadcast message sent.');
    }

    if (method === 'POST' && path === 'notifications/reminder') {
      const message = (body as { message: string }).message;
      const employeeIds = store.users.filter((user) => user.role === 'employee').map((user) => user.id);
      const created = employeeIds.map((employeeId) =>
        this.createNotification(employeeId, 'reminder', message)
      );
      store.notifications.unshift(...created);
      this.persistStore();
      return this.ok(created, 'Participation reminders sent.');
    }

    if (method === 'GET' && path === 'reminder-schedule') {
      return this.ok(store.reminderSchedule);
    }

    if (method === 'PUT' && path === 'reminder-schedule') {
      store.reminderSchedule = body as ReminderSchedule;
      this.persistStore();
      return this.ok(store.reminderSchedule, 'Reminder schedule updated.');
    }

    if (method === 'GET' && path === 'stats/participation') {
      return this.ok(this.buildParticipationStats(store));
    }

    if (method === 'POST' && path.endsWith('/qr')) {
      const id = path.split('/')[1];
      const activity = store.activities.find((item) => item.id === id);
      if (!activity) {
        return this.fail('Activity not found');
      }
      activity.qrCodeToken = `QR-${activity.ngoName.slice(0, 3).toUpperCase()}-${Date.now()}`;
      this.persistStore();
      return this.ok(activity, 'QR code regenerated.');
    }

    if (method === 'POST' && path === 'reset') {
      localStorage.removeItem(STORAGE_KEY);
      this.store = null;
      return this.ensureStore().pipe(
        switchMap((data) => of({ status: 200, body: this.wrap(data, 'Mock data reset successfully.') }))
      ) as unknown as { status: number; body: ApiResponse<unknown> };
    }

    return this.fail('Endpoint not found');
  }

  private handleRegistration(payload: { employeeId: string; activityId: string }) {
    const store = this.store!;
    const activity = store.activities.find((item) => item.id === payload.activityId);
    if (!activity) {
      return this.fail('Activity not found');
    }

    if (this.isCutOffPassed(activity.cutOffDateTime)) {
      return this.fail('Registration cut-off date/time has passed.');
    }

    if (activity.slotsTaken >= activity.maxSlots) {
      return this.fail('This activity is fully booked.');
    }

    const existing = store.registrations.find(
      (item) => item.employeeId === payload.employeeId && item.status === 'confirmed'
    );
    if (existing) {
      return this.fail('You are already registered for an activity. Please change or cancel first.');
    }

    const registration: Registration = {
      id: this.createId('reg'),
      employeeId: payload.employeeId,
      activityId: payload.activityId,
      registeredAt: new Date().toISOString(),
      status: 'confirmed',
      checkedIn: false,
      checkInTime: null
    };

    activity.slotsTaken += 1;
    store.registrations.push(registration);
    store.notifications.unshift(
      this.createNotification(
        payload.employeeId,
        'registration',
        `You have successfully registered for ${activity.ngoName} - ${activity.serviceType}.`
      )
    );
    this.persistStore();
    return this.ok(registration, 'Registration successful.');
  }

  private handleChangeRegistration(payload: {
    registrationId: string;
    newActivityId: string;
    employeeId: string;
  }) {
    const store = this.store!;
    const registration = store.registrations.find((item) => item.id === payload.registrationId);
    if (!registration || registration.employeeId !== payload.employeeId) {
      return this.fail('Registration not found.');
    }

    const currentActivity = store.activities.find((item) => item.id === registration.activityId);
    const newActivity = store.activities.find((item) => item.id === payload.newActivityId);
    if (!currentActivity || !newActivity) {
      return this.fail('Activity not found.');
    }

    if (this.isCutOffPassed(currentActivity.cutOffDateTime) || this.isCutOffPassed(newActivity.cutOffDateTime)) {
      return this.fail('Cut-off date/time has passed for one or both activities.');
    }

    if (newActivity.slotsTaken >= newActivity.maxSlots) {
      return this.fail('The selected activity is fully booked.');
    }

    currentActivity.slotsTaken = Math.max(0, currentActivity.slotsTaken - 1);
    newActivity.slotsTaken += 1;
    registration.activityId = payload.newActivityId;
    registration.status = 'changed';
    registration.registeredAt = new Date().toISOString();
    registration.status = 'confirmed';

    store.notifications.unshift(
      this.createNotification(
        payload.employeeId,
        'update',
        `Your registration has been changed to ${newActivity.ngoName} - ${newActivity.serviceType}.`
      )
    );
    this.persistStore();
    return this.ok(registration, 'Registration updated successfully.');
  }

  private handleCancelRegistration(payload: { registrationId: string; employeeId: string }) {
    const store = this.store!;
    const registration = store.registrations.find((item) => item.id === payload.registrationId);
    if (!registration || registration.employeeId !== payload.employeeId) {
      return this.fail('Registration not found.');
    }

    const activity = store.activities.find((item) => item.id === registration.activityId);
    if (!activity) {
      return this.fail('Activity not found.');
    }

    if (this.isCutOffPassed(activity.cutOffDateTime)) {
      return this.fail('Cancellation is not allowed after the cut-off date/time.');
    }

    registration.status = 'cancelled';
    activity.slotsTaken = Math.max(0, activity.slotsTaken - 1);
    store.notifications.unshift(
      this.createNotification(
        payload.employeeId,
        'cancellation',
        `Your registration for ${activity.ngoName} has been cancelled.`
      )
    );
    this.persistStore();
    return this.ok(registration, 'Registration cancelled successfully.');
  }

  private handleCheckIn(payload: { employeeId: string; qrCodeToken: string }) {
    const store = this.store!;
    const activity = store.activities.find((item) => item.qrCodeToken === payload.qrCodeToken);
    if (!activity) {
      return this.fail('Invalid QR code.');
    }

    const registration = store.registrations.find(
      (item) =>
        item.employeeId === payload.employeeId &&
        item.activityId === activity.id &&
        item.status === 'confirmed'
    );

    if (!registration) {
      return this.fail('You are not registered for this activity.');
    }

    if (registration.checkedIn) {
      return this.fail('You have already checked in.');
    }

    registration.checkedIn = true;
    registration.checkInTime = new Date().toISOString();
    this.persistStore();
    return this.ok(registration, `Checked in successfully at ${activity.ngoName}.`);
  }

  private buildParticipationStats(store: MockDataStore): ParticipationStats {
    const approvedActivities = store.activities.filter((item) => item.status === 'approved');
    const totalSlotsOffered = approvedActivities.reduce((sum, item) => sum + item.maxSlots, 0);
    const totalSlotsTaken = approvedActivities.reduce((sum, item) => sum + item.slotsTaken, 0);
    const confirmedRegistrations = store.registrations.filter((item) => item.status === 'confirmed');

    return {
      totalSlotsOffered,
      totalSlotsTaken,
      totalSlotsRemaining: totalSlotsOffered - totalSlotsTaken,
      totalRegistrations: confirmedRegistrations.length,
      totalCheckIns: confirmedRegistrations.filter((item) => item.checkedIn).length,
      activityBreakdown: approvedActivities.map((activity) => ({
        activityId: activity.id,
        ngoName: activity.ngoName,
        maxSlots: activity.maxSlots,
        slotsTaken: activity.slotsTaken,
        slotsRemaining: activity.maxSlots - activity.slotsTaken,
        utilizationPercent: Math.round((activity.slotsTaken / activity.maxSlots) * 100)
      }))
    };
  }

  private createNotification(
    recipientId: string,
    type: AppNotification['type'],
    message: string
  ): AppNotification {
    return {
      id: this.createId('notif'),
      recipientId,
      type,
      message,
      createdAt: new Date().toISOString(),
      read: false
    };
  }

  private isCutOffPassed(cutOffDateTime: string): boolean {
    return new Date(cutOffDateTime).getTime() < Date.now();
  }

  private createId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  }

  private persistStore(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
  }

  private ok<T>(data: T, message?: string): { status: number; body: ApiResponse<T> } {
    return { status: 200, body: this.wrap(data, message) };
  }

  private fail(message: string): { status: number; body: ApiResponse<null> } {
    return { status: 400, body: { success: false, data: null, message } };
  }

  private wrap<T>(data: T, message?: string): ApiResponse<T> {
    return { success: true, data, message };
  }
}
