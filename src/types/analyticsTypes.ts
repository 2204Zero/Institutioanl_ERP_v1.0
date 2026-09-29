// Enterprise Analytics, Business Intelligence & AI Platform Data Models (Phase 11)

export type UserRoleType =
  | 'Student'
  | 'Teacher'
  | 'Parent'
  | 'Department Head'
  | 'Principal'
  | 'Finance Officer'
  | 'HR Manager'
  | 'Library Manager'
  | 'Transport Manager'
  | 'Administrator';

export type ChartType =
  | 'line'
  | 'bar'
  | 'stackedBar'
  | 'area'
  | 'pie'
  | 'donut'
  | 'radar'
  | 'heatmap'
  | 'scatter'
  | 'bubble'
  | 'treemap'
  | 'sunburst'
  | 'funnel'
  | 'gauge'
  | 'calendarHeatmap'
  | 'sparkline'
  | 'kpiCard'
  | 'dataTable';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type MLModelType =
  | 'Random Forest'
  | 'XGBoost'
  | 'Logistic Regression'
  | 'Decision Tree'
  | 'KMeans'
  | 'Isolation Forest'
  | 'Neural Networks'
  | 'Time Series Forecasting';

// Global Institution KPIs
export interface GlobalAnalyticsKPIs {
  totalStudents: number;
  totalFaculty: number;
  totalDepartments: number;
  annualRevenue: number;
  annualExpenses: number;
  netSurplus: number;
  overallAttendanceRate: number;
  libraryUtilizationRate: number;
  hostelOccupancyRate: number;
  transportUtilizationRate: number;
  scopusPublications: number;
  placementPercentage: number;
  averageCGPA: number;
  graduationRate: number;
  retentionRate: number;
  studentSatisfactionScore: number; // 0 - 5
  staffPerformanceIndex: number;    // 0 - 100
}

// Chart Data Structures
export interface DataPoint {
  label: string;
  value: number;
  category?: string;
  color?: string;
  secondaryValue?: number;
  metadata?: Record<string, unknown>;
}

export interface SeriesData {
  name: string;
  data: number[];
  color?: string;
}

export interface RadarDataPoint {
  subject: string;
  scoreA: number;
  scoreB?: number;
  fullMark: number;
}

export interface HeatmapCell {
  x: string; // e.g. Day of Week
  y: string; // e.g. Time of Day or Hour
  value: number;
}

export interface BubblePoint {
  x: number;
  y: number;
  z: number;
  name: string;
  category: string;
}

export interface TreemapNode {
  name: string;
  value: number;
  children?: TreemapNode[];
  color?: string;
}

// Domain Specific Analytics
export interface StudentDomainAnalytics {
  admissionsTrend: DataPoint[];
  strengthByDepartment: DataPoint[];
  strengthBySemester: DataPoint[];
  attendanceDistribution: DataPoint[];
  cgpaDistribution: DataPoint[];
  failuresBySubject: DataPoint[];
  backlogCounts: DataPoint[];
  scholarshipDisbursal: DataPoint[];
  feeStatusBreakdown: DataPoint[];
  placementReadinessScore: DataPoint[];
  highRiskStudentsCount: number;
  predictedDropoutRate: number;
}

export interface FacultyDomainAnalytics {
  averageTeachingHours: number;
  researchPublicationsCount: number;
  scopusCitations: number;
  googleScholarHIndex: number;
  patentsFiled: number;
  fundedProjectsCount: number;
  facultyAttendanceRate: number;
  studentFeedbackScore: number; // 0 - 5
  performanceIndex: number;
  promotionEligibleCount: number;
  workloadDistribution: DataPoint[];
}

export interface FinanceDomainAnalytics {
  monthlyRevenue: SeriesData[];
  monthlyExpenses: SeriesData[];
  feeCollectionModeBreakdown: DataPoint[];
  outstandingFeesByDept: DataPoint[];
  scholarshipAllocation: DataPoint[];
  payrollDisbursal: DataPoint[];
  budgetUtilizationPercentage: number;
  departmentExpenses: DataPoint[];
  cashFlowForecast: DataPoint[];
  profitAndLossSummary: {
    revenue: number;
    operatingExpense: number;
    payroll: number;
    capitalExpenditure: number;
    netMargin: number;
  };
}

export interface LibraryDomainAnalytics {
  mostBorrowedBooks: DataPoint[];
  digitalLibraryActiveUsers: number;
  categoryUsageBreakdown: DataPoint[];
  totalFinesCollected: number;
  lateReturnPercentage: number;
  peakHoursUsage: DataPoint[];
  topReaders: { studentName: string; rollNo: string; booksCount: number }[];
  predictedBookDemand: DataPoint[];
}

export interface HostelDomainAnalytics {
  overallOccupancyRate: number;
  messFeeCollected: number;
  maintenanceTicketsResolved: number;
  pendingComplaintsCount: number;
  dailyVisitorCount: number;
  roomUtilizationByBlock: DataPoint[];
}

export interface TransportDomainAnalytics {
  busOccupancyRate: number;
  monthlyFuelConsumptionLiters: number;
  driverPerformanceScore: number;
  gpsDelayIncidents: number;
  routeEfficiencyIndex: number;
  maintenanceCostByVehicle: DataPoint[];
}

export interface ExamDomainAnalytics {
  passPercentage: number;
  failPercentage: number;
  departmentRankings: DataPoint[];
  topPerformers: { name: string; dept: string; cgpa: number }[];
  subjectDifficultyIndex: DataPoint[];
  bloomsTaxonomyCoverage: DataPoint[];
  cgpaDistributionMap: DataPoint[];
}

export interface HRDomainAnalytics {
  monthlyPayrollTrend: DataPoint[];
  leaveStatisticsByDept: DataPoint[];
  facultyTurnoverRate: number;
  recruitmentFunnel: DataPoint[];
  employeeSatisfactionScore: number;
  performanceRatingsDistribution: DataPoint[];
}

// AI & Machine Learning Predictive Hub
export interface AIPredictionRecord {
  id: string;
  targetId: string;
  targetName: string;
  department: string;
  predictionType:
    | 'Student Performance'
    | 'Low Attendance'
    | 'Dropout Risk'
    | 'Fee Default Risk'
    | 'Course Recommendation'
    | 'Book Recommendation'
    | 'Faculty Workload'
    | 'Research Match'
    | 'Placement Eligibility';
  modelUsed: MLModelType;
  riskLevel: RiskLevel;
  confidenceScore: number; // Percentage 0 - 100
  featureImportance: { feature: string; weight: number }[];
  recommendation: string;
  createdDate: string;
}

export interface AIModelMetrics {
  modelName: MLModelType;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingSamples: number;
  lastTrained: string;
}

// Natural Language BI Search
export interface NLSearchQueryResult {
  query: string;
  intent: 'KpiQuery' | 'TrendAnalysis' | 'RiskFilter' | 'Comparison' | 'Forecast';
  extractedEntities: Record<string, string>;
  summary: string;
  suggestedChartType: ChartType;
  chartData: DataPoint[];
  generatedInsight: string;
}

// Report Builder & Exports
export type ExportFormat = 'PDF' | 'EXCEL' | 'CSV';
export type ScheduleFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface ScheduledReport {
  id: string;
  reportName: string;
  module: string;
  format: ExportFormat;
  frequency: ScheduleFrequency;
  recipients: string[];
  lastGenerated: string;
  status: 'ACTIVE' | 'PAUSED';
}
