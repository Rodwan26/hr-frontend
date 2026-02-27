export interface TrustSource {
    source_file: string;
    chunk_id: number;
    content: string;
}

export interface TrustData {
    confidence_score: number;
    confidence_level: string;
    reasoning: string;
    sources: TrustSource[];
    is_fallback: boolean;
    fallback_reason?: string;
    requires_human_confirmation: boolean;
}

export interface TrustedAIResponse<T = string> {
    data?: T;
    content?: string;
    trust: TrustData;
}
