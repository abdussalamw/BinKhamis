import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor to add Authorization token and School ID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add School ID if present in user object (for tenant isolation)
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.school_id) {
        config.headers['X-School-ID'] = user.school_id;
      }
    } catch (e) {
      console.error("Error parsing user for school_id", e);
    }
  }

  return config;
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/auth/signin')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/signin';
    }
    return Promise.reject(error);
  }
);

export default api;
