import api from '@/lib/api';

export interface Document {
    id: number;
    filename: string;
    organization_id: number;
    created_at: string;
}

export const documentService = {
    upload: async (formData: FormData) => {
        const response = await api.post('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    query: async (question: string, documentIds?: number[]) => {
        const response = await api.post('/documents/query', {
            question,
            document_ids: documentIds || []
        });
        return response.data;
    },
    list: async () => {
        const response = await api.get('/documents');
        return response.data;
    },
    delete: async (id: number) => {
        const response = await api.delete(`/documents/${id}`);
        return response.data;
    },
    getChunks: async (id: number) => {
        const response = await api.get(`/documents/${id}/chunks`);
        return response.data;
    }
};
