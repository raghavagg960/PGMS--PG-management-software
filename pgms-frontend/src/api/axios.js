import axios from 'axios';

// 1. Create the base configuration linked straight to your Django local server
const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    timeout: 10000, // If the backend doesn't reply in 10 seconds, safely cancel the request
    headers: {
        'Content-Type': 'application/json',
    }
});

// 2. Interceptor: Automatically inject the JWT token into the headers of secure requests
API.interceptors.request.use(
    (config) => {
        // Look into the browser's local storage for our saved login key
        const token = localStorage.getItem('access_token');
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Response Interceptor: Catch specific errors globally (like expired tokens)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        // If Django returns a 401 Unauthorized, it means our token expired
        if (error.response && error.response.status === 401) {
            console.warn("Session expired or token invalid. Redirecting to login...");
            // Optional: clear local storage so the user is forced to log back in cleanly
            localStorage.clear();
        }
        return Promise.reject(error);
    }
);

export default API;