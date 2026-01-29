// API Service for Blood Bank Management System
const API_URL = 'http://localhost:3001';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        credentials: 'include',
        ...options,
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
};

// Auth API
export const authAPI = {
    // Get Google OAuth URL
    getGoogleAuthUrl: () => `${API_URL}/auth/google`,

    // Login with username/password
    login: (username, password) =>
        apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        }),

    // Register new user
    register: (userData) =>
        apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

    // Get current user
    getCurrentUser: () => apiCall('/auth/me'),

    // Logout
    logout: () => apiCall('/auth/logout', { method: 'POST' }),

    // Update profile
    updateProfile: (data) =>
        apiCall('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

// Donors API
export const donorsAPI = {
    // Get all donors
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/api/donors${queryString ? `?${queryString}` : ''}`);
    },

    // Get single donor
    getById: (id) => apiCall(`/api/donors/${id}`),

    // Create donor
    create: (donorData) =>
        apiCall('/api/donors', {
            method: 'POST',
            body: JSON.stringify(donorData),
        }),

    // Update donor
    update: (id, data) =>
        apiCall(`/api/donors/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    // Delete donor
    delete: (id) =>
        apiCall(`/api/donors/${id}`, { method: 'DELETE' }),
};

// Blood Requests API
export const requestsAPI = {
    // Get all requests
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/api/requests${queryString ? `?${queryString}` : ''}`);
    },

    // Get single request
    getById: (id) => apiCall(`/api/requests/${id}`),

    // Create request
    create: (requestData) =>
        apiCall('/api/requests', {
            method: 'POST',
            body: JSON.stringify(requestData),
        }),

    // Update request
    update: (id, data) =>
        apiCall(`/api/requests/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    // Delete request
    delete: (id) =>
        apiCall(`/api/requests/${id}`, { method: 'DELETE' }),
};

// Blood Banks API
export const banksAPI = {
    // Get all banks with inventory
    getAll: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`/api/banks${queryString ? `?${queryString}` : ''}`);
    },

    // Get single bank
    getById: (id) => apiCall(`/api/banks/${id}`),

    // Get bank inventory
    getInventory: (bankId) => apiCall(`/api/banks/${bankId}/inventory`),

    // Update inventory
    updateInventory: (bankId, data) =>
        apiCall(`/api/banks/${bankId}/inventory`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    // Create bank
    create: (bankData) =>
        apiCall('/api/banks', {
            method: 'POST',
            body: JSON.stringify(bankData),
        }),
};

// Blood Bank User API (for blood bank managers)
export const bloodBankUserAPI = {
    // Get user's associated bank with inventory
    getBank: () => apiCall('/api/blood-bank-user/bank'),

    // Update bank details
    updateBank: (data) =>
        apiCall('/api/blood-bank-user/bank', {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    // Update inventory
    updateInventory: (data) =>
        apiCall('/api/blood-bank-user/inventory', {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    // Get blood requests
    getRequests: () => apiCall('/api/blood-bank-user/requests'),
};

// Health check
export const healthCheck = () => apiCall('/api/health');

export default {
    auth: authAPI,
    donors: donorsAPI,
    requests: requestsAPI,
    banks: banksAPI,
    bloodBankUser: bloodBankUserAPI,
    healthCheck,
};
