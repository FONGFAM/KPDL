import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Generate or retrieve session ID
const getSessionId = () => {
    let sessionId = sessionStorage.getItem('kpdl_session_id');
    if (!sessionId) {
        sessionId = crypto.randomUUID ? crypto.randomUUID() :
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : ((r & 0x3) | 0x8);
                return v.toString(16);
            });
        sessionStorage.setItem('kpdl_session_id', sessionId);
    }
    return sessionId;
};

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add session ID to all requests
api.interceptors.request.use((config) => {
    config.headers['X-Session-ID'] = getSessionId();
    return config;
});

// Global error interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.detail || error.message || 'An error occurred';
        console.error('API Error:', message);
        return Promise.reject(new Error(message));
    }
);

export const kpdlAPI = {
    // Upload file
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-Session-ID': getSessionId(),
            },
        });
        return response.data;
    },

    // Select sheet from Excel file
    selectSheet: async (sheetName) => {
        const response = await api.post(`/select-sheet?sheet_name=${encodeURIComponent(sheetName)}`);
        return response.data;
    },

    // Preprocess data
    preprocessData: async (selectedColumns) => {
        const response = await api.post('/preprocess', {
            selected_columns: selectedColumns,
        });
        return response.data;
    },

    // Run K-means
    runKMeans: async (k, autoK = false) => {
        const response = await api.post('/kmeans', {
            k: k,
            auto_k: autoK,
        });
        return response.data;
    },

    // Get conclusion
    getConclusion: async () => {
        const response = await api.get('/conclusion');
        return response.data;
    },

    // Export results
    exportResults: async () => {
        const response = await api.get('/export');
        return response.data;
    },

    // Reset
    reset: async () => {
        const response = await api.get('/reset');
        // Clear session ID on reset
        sessionStorage.removeItem('kpdl_session_id');
        return response.data;
    },

    // Get current session ID
    getSessionId,
};

export default api;
