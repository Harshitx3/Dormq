// API Configuration
const API_BASE_URL = 'https://dormq.vercel.app/api';

// Export the base URL for use in all API calls
export { API_BASE_URL };

// Helper function for making API requests
export async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set default headers if not provided
    if (!options.headers) {
        options.headers = {
            'Content-Type': 'application/json'
        };
    }
    
    // Add authorization token if available
    const token = localStorage.getItem('token');
    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}