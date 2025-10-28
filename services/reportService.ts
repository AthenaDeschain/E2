import apiService from './apiService';

interface ReportPayload {
    contentType: 'post' | 'comment';
    contentId: string;
    reason?: string; // Optional reason
}

export const reportService = {
    reportContent: (payload: ReportPayload): Promise<void> => {
        return apiService('/reports', 'POST', payload);
    },
};
