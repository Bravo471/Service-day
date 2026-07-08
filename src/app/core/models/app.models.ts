export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
}

export interface Activity {
  id: string;
  ngoName: string;
  serviceType: string;
  description: string;
  location: string;
  date: string;
  time: string;
  maxSlots: number;
  slotsTaken: number;
  cutOffDateTime: string;
  status: 'approved' | 'pending' | 'cancelled';
  qrCodeToken: string;
}

export interface Registration {
  id: string;
  employeeId: string;
  activityId: string;
  registeredAt: string;
  status: 'confirmed' | 'cancelled' | 'changed';
  checkedIn: boolean;
  checkInTime: string | null;
}

export interface AppNotification {
  id: string;
  recipientId: string;
  type: 'registration' | 'reminder' | 'broadcast' | 'update' | 'cancellation';
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ReminderSchedule {
  intervals: number[];
  enabled: boolean;
}

export interface MockDataStore {
  activities: Activity[];
  users: User[];
  registrations: Registration[];
  notifications: AppNotification[];
  reminderSchedule: ReminderSchedule;
}

export interface ParticipationStats {
  totalSlotsOffered: number;
  totalSlotsTaken: number;
  totalSlotsRemaining: number;
  totalRegistrations: number;
  totalCheckIns: number;
  activityBreakdown: {
    activityId: string;
    ngoName: string;
    maxSlots: number;
    slotsTaken: number;
    slotsRemaining: number;
    utilizationPercent: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
