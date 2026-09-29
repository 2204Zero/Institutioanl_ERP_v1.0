import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/apiConfig';
import { APIResponse } from '../types/api';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const INITIAL_MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Semester Fee Payment Deadline',
    message: 'Fall 2026 tuition fee payment deadline is approaching in 5 days.',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
  },
  {
    id: 'notif-2',
    title: 'New Student Registration',
    message: 'Alex Mercer (STU-2026-089) completed registration for Computer Science.',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Grade Submission Complete',
    message: 'Dr. Sarah Connor published final grades for CS301 Database Systems.',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    read: true,
  },
];

class NotificationService {
  private localNotifications: NotificationItem[] = [...INITIAL_MOCK_NOTIFICATIONS];

  public async getNotifications(): Promise<APIResponse<NotificationItem[]>> {
    if (API_CONFIG.USE_MOCK) {
      return {
        success: true,
        code: 200,
        message: 'Notifications retrieved successfully (Mock)',
        timestamp: new Date().toISOString(),
        data: [...this.localNotifications],
      };
    }

    return apiClient.get<NotificationItem[]>('/api/v1/notifications');
  }

  public async markAsRead(id: string): Promise<APIResponse<boolean>> {
    if (API_CONFIG.USE_MOCK) {
      this.localNotifications = this.localNotifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        success: true,
        code: 200,
        message: 'Notification marked as read',
        timestamp: new Date().toISOString(),
        data: true,
      };
    }

    return apiClient.patch<boolean>(`/api/v1/notifications/${id}/read`);
  }

  public async markAllAsRead(): Promise<APIResponse<boolean>> {
    if (API_CONFIG.USE_MOCK) {
      this.localNotifications = this.localNotifications.map((n) => ({ ...n, read: true }));
      return {
        success: true,
        code: 200,
        message: 'All notifications marked as read',
        timestamp: new Date().toISOString(),
        data: true,
      };
    }

    return apiClient.post<boolean>('/api/v1/notifications/mark-all-read');
  }

  public async deleteNotification(id: string): Promise<APIResponse<boolean>> {
    if (API_CONFIG.USE_MOCK) {
      this.localNotifications = this.localNotifications.filter((n) => n.id !== id);
      return {
        success: true,
        code: 200,
        message: 'Notification deleted',
        timestamp: new Date().toISOString(),
        data: true,
      };
    }

    return apiClient.delete<boolean>(`/api/v1/notifications/${id}`);
  }
}

export const notificationService = new NotificationService();
