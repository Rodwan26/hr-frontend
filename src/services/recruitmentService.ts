import api from '@/lib/api';

export interface Job {
    id: number;
    title: string;
    description: string;
    department: string;
    location: string;
    employment_type: string;
    experience_level: string;
    requirements: string;
    is_active: boolean;
    status: string;
    created_at: string;
    candidate_profile?: {
        education: string;
        experience: string;
        skills: string[];
    };
}

export interface Resume {
    id: number;
    job_id: number;
    name: string;
    resume_text: string;
    anonymized_text?: string;
    status: string;
    ai_score: number;
    ai_feedback: string;
    ai_evidence?: any[];
    rejection_reason?: string;
    trust_metadata?: {
        confidence_score: number;
        ai_model: string;
    };
}

export const recruitmentService = {
    // Jobs
    getJobs: async (): Promise<Job[]> => {
        const response = await api.get('/jobs/');
        return response.data;
    },
    getJob: async (id: number): Promise<Job> => {
        const response = await api.get(`/jobs/${id}`);
        return response.data;
    },
    createJob: async (data: any) => {
        const response = await api.post('/jobs/', data);
        return response.data;
    },
    updateJob: async (id: number, data: any) => {
        const response = await api.put(`/jobs/${id}`, data);
        return response.data;
    },
    deleteJob: async (id: number) => {
        const response = await api.delete(`/jobs/${id}`);
        return response.data;
    },

    // Resumes
    getResumes: async (jobId: number): Promise<Resume[]> => {
        const response = await api.get(`/jobs/${jobId}/resumes`);
        return response.data;
    },
    submitResume: async (jobId: number, name: string, resumeText: string, blindScreening: boolean = true) => {
        const response = await api.post(`/jobs/${jobId}/resumes`, {
            name: name,
            resume_text: resumeText,
            blind_screening: blindScreening
        });
        return response.data;
    },
    updateResumeStatus: async (jobId: number, resumeId: number, status: string) => {
        const response = await api.patch(`/jobs/${jobId}/resumes/${resumeId}/status`, { status });
        return response.data;
    }
};
