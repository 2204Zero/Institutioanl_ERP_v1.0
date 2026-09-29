import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/apiConfig';
import { APIResponse } from '../types/api';

export interface DashboardMetrics {
  totalStudents: number;
  totalFaculty: number;
  totalRevenue: number;
  activeCourses: number;
  studentGrowthPercentage: number;
  facultyGrowthPercentage: number;
  revenueGrowthPercentage: number;
  courseGrowthPercentage: number;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type: 'enrollment' | 'payment' | 'grade' | 'system' | 'security';
  details?: string;
}

export interface RevenueChartData {
  month: string;
  tuition: number;
  grants: number;
  donations: number;
  total: number;
}

const MOCK_METRICS: DashboardMetrics = {
  totalStudents: 14850,
  totalFaculty: 820,
  totalRevenue: 12450000,
  activeCourses: 340,
  studentGrowthPercentage: 12.5,
  facultyGrowthPercentage: 4.2,
  revenueGrowthPercentage: 18.3,
  courseGrowthPercentage: 6.8,
};

const MOCK_CHARTS: RevenueChartData[] = [
  { month: 'Jan', tuition: 4200000, grants: 1200000, donations: 300000, total: 5700000 },
  { month: 'Feb', tuition: 3800000, grants: 1100000, donations: 250000, total: 5150000 },
  { month: 'Mar', tuition: 5100000, grants: 1500000, donations: 400000, total: 7000000 },
  { month: 'Apr', tuition: 4900000, grants: 1400000, donations: 350000, total: 6650000 },
  { month: 'May', tuition: 6200000, grants: 1800000, donations: 500000, total: 8500000 },
  { month: 'Jun', tuition: 5800000, grants: 1600000, donations: 450000, total: 7850000 },
];

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    user: 'Aarav Sharma',
    action: 'Paid Semester 5 Tuition Fee (₹85,000)',
    timestamp: '10 mins ago',
    type: 'payment',
    details: 'Online UPI',
  },
  {
    id: 'act-2',
    user: 'Dr. Rajesh Kumar',
    action: 'Approved Refund Request for TXN-2026-89010',
    timestamp: '25 mins ago',
    type: 'system',
    details: 'Admin Override',
  },
  {
    id: 'act-3',
    user: 'Priya Nair',
    action: 'Completed CS301 Database Systems Course Registration',
    timestamp: '1 hour ago',
    type: 'enrollment',
    details: 'Computer Science',
  },
];

class DashboardService {
  public async getMetrics(): Promise<APIResponse<DashboardMetrics>> {
    if (API_CONFIG.USE_MOCK) {
      return {
        success: true,
        code: 200,
        message: 'Dashboard metrics retrieved successfully (Mock)',
        timestamp: new Date().toISOString(),
        data: MOCK_METRICS,
      };
    }

    return apiClient.get<DashboardMetrics>(API_CONFIG.ENDPOINTS.DASHBOARD.METRICS);
  }

  public async getChartData(period: 'month' | 'quarter' | 'year' = 'month'): Promise<APIResponse<RevenueChartData[]>> {
    if (API_CONFIG.USE_MOCK) {
      return {
        success: true,
        code: 200,
        message: `Revenue chart data for ${period} retrieved successfully (Mock)`,
        timestamp: new Date().toISOString(),
        data: MOCK_CHARTS,
      };
    }

    return apiClient.get<RevenueChartData[]>(API_CONFIG.ENDPOINTS.DASHBOARD.CHARTS, { period });
  }

  public async getRecentActivities(limit: number = 10): Promise<APIResponse<ActivityItem[]>> {
    if (API_CONFIG.USE_MOCK) {
      return {
        success: true,
        code: 200,
        message: 'Recent activities retrieved successfully (Mock)',
        timestamp: new Date().toISOString(),
        data: MOCK_ACTIVITIES.slice(0, limit),
      };
    }

    return apiClient.get<ActivityItem[]>(API_CONFIG.ENDPOINTS.DASHBOARD.ACTIVITIES, { limit });
  }
}

export const dashboardService = new DashboardService();
