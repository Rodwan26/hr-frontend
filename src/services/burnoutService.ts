import api from '@/lib/api';

export interface MetricCreate {
    employee_id: number;
    metric_type: string;
    value: number;
    date: string;
}

export interface PerformanceMetric {
    id: number;
    employee_id: number;
    metric_type: string;
    value: number;
    date: string;
    organization_id: number;
}

export interface BurnoutAssessment {
    id: number;
    employee_id: number;
    risk_level: string;       // low, medium, high, critical
    indicators: string[];
    ai_analysis: string;
    recommendations: string[];
    assessed_at: string;
    organization_id: number;
}

export interface BurnoutDashboard {
    assessment: BurnoutAssessment | null;
    metrics: PerformanceMetric[];
}

export const burnoutService = {
    /**
     * Log a performance metric (e.g. work_hours) for a given employee.
     * POST /burnout/track-metric
     */
    async trackMetric(metric: MetricCreate): Promise<PerformanceMetric> {
        const response = await api.post('/burnout/track-metric', metric);
        return response.data;
    },

    /**
     * Retrieve all recorded performance metrics for an employee.
     * GET /burnout/metrics/{employee_id}
     */
    async getMetrics(employeeId: number): Promise<PerformanceMetric[]> {
        const response = await api.get(`/burnout/metrics/${employeeId}`);
        return response.data;
    },

    /**
     * Run the AI burnout risk analysis for an employee and persist the result.
     * POST /burnout/analyze/{employee_id}
     */
    async analyzeBurnout(employeeId: number): Promise<BurnoutAssessment> {
        const response = await api.post(`/burnout/analyze/${employeeId}`);
        // The backend wraps the result in a TrustedAIResponse; the actual
        // assessment data lives in `response.data.data`.
        return response.data.data ?? response.data;
    },

    /**
     * Fetch the combined dashboard (latest assessment + last-30 metrics).
     * GET /burnout/dashboard/{employee_id}
     */
    async getDashboard(employeeId: number): Promise<BurnoutDashboard> {
        const response = await api.get(`/burnout/dashboard/${employeeId}`);
        return response.data;
    },

    /**
     * Retrieve the full assessment history for an employee.
     * GET /burnout/assessments/{employee_id}
     */
    async getAssessments(employeeId: number): Promise<BurnoutAssessment[]> {
        const response = await api.get(`/burnout/assessments/${employeeId}`);
        return response.data;
    },
};
