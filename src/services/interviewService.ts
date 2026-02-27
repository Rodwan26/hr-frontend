import api from '@/lib/api';

import { TrustedAIResponse } from '@/types/ai';
export type { TrustedAIResponse };

export interface Interview {
    id: number;
    candidate_name: string;
    candidate_email: string;
    interviewer_name: string;
    interviewer_email: string;
    job_title: string;
    status: string;
    preferred_dates: string;
    scheduled_date?: string;
    scheduled_time?: string;
    meeting_link?: string;
}

export interface SlotSuggestion {
    date: string;
    time: string;
    reasoning: string;
}

export interface InterviewKit {
    id: number;
    job_title: string;
    questions: { id: number; text: string; criteria: string; category: string }[];
}

export const interviewService = {
    getInterviews: async () => {
        const response = await api.get('/interviews');
        return response.data;
    },
    createInterview: async (
        candidateName: string,
        candidateEmail: string,
        interviewerName: string,
        interviewerEmail: string,
        jobTitle: string,
        preferredDates: string
    ) => {
        const response = await api.post('/interviews', {
            candidate_name: candidateName,
            candidate_email: candidateEmail,
            interviewer_name: interviewerName,
            interviewer_email: interviewerEmail,
            job_title: jobTitle,
            preferred_dates: preferredDates
        });
        return response.data;
    },
    suggestSlots: async (interviewId: number, preferredDates: string, interviewerAvailability: string): Promise<TrustedAIResponse<{ suggestions: SlotSuggestion[] }>> => {
        const response = await api.post(`/interviews/${interviewId}/suggest-slots`, {
            preferred_dates: preferredDates,
            interviewer_availability: interviewerAvailability
        });
        // Map trust_metadata to trust for UI component
        const data = response.data;
        if (data.trust_metadata && !data.trust) {
            data.trust = {
                confidence_score: data.trust_metadata.confidence_score,
                confidence_level: data.trust_metadata.confidence_score > 0.8 ? 'high' : 'medium',
                ai_model: data.trust_metadata.ai_model,
                reasoning: '',
                sources: [],
                is_fallback: false,
                requires_human_confirmation: false
            };
        }
        return data;
    },
    confirmInterview: async (interviewId: number, date: string, time: string) => {
        const response = await api.post(`/interviews/${interviewId}/confirm`, {
            date,
            time
        });
        return response.data;
    },
    generateQuestions: async (jobTitle: string, candidateResume: string): Promise<TrustedAIResponse<{ questions: string[] }>> => {
        const response = await api.post('/interviews/generate-questions', {
            job_title: jobTitle,
            candidate_resume: candidateResume
        });
        const data = response.data;
        if (data.trust_metadata && !data.trust) {
            data.trust = {
                confidence_score: data.trust_metadata.confidence_score,
                confidence_level: data.trust_metadata.confidence_score > 0.8 ? 'high' : 'medium',
                ai_model: data.trust_metadata.ai_model,
                reasoning: '',
                sources: [],
                is_fallback: false,
                requires_human_confirmation: false
            };
        }
        return data;
    },
    analyzeFit: async (jobRequirements: string, candidateResume: string): Promise<TrustedAIResponse<{ fit_score: number; reasoning: string }>> => {
        const response = await api.post('/interviews/analyze-fit', {
            job_requirements: jobRequirements,
            candidate_resume: candidateResume
        });
        const data = response.data;
        if (data.trust_metadata && !data.trust) {
            data.trust = {
                confidence_score: data.trust_metadata.confidence_score,
                confidence_level: data.trust_metadata.confidence_score > 0.8 ? 'high' : 'medium',
                ai_model: data.trust_metadata.ai_model,
                reasoning: '',
                sources: [],
                is_fallback: false,
                requires_human_confirmation: false
            };
        }
        return data;
    },
    generateInterviewKit: async (interviewId: number) => {
        const response = await api.post(`/interviews/${interviewId}/kit`);
        return response.data;
    },
    getInterviewKit: async (interviewId: number) => {
        const response = await api.get(`/interviews/${interviewId}/kit`);
        return response.data;
    },
    submitInterviewFeedback: async (data: any) => {
        const response = await api.post(`/interviews/${data.interview_id}/feedback`, data);
        return response.data;
    },
    getInterviewAnalysis: async (interviewId: number) => {
        const response = await api.get(`/interviews/${interviewId}/analysis`);
        return response.data;
    }
};
