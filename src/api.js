import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 60000,
});

// Attach the JWT token to every outgoing request automatically
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('rs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, the backend returns 401 — log the user out
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('rs_token');
      sessionStorage.removeItem('rs_user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────
export const registerUser = async (fullName, email, password) => {
  const response = await API.post('/api/auth/register', { fullName, email, password });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await API.post('/api/auth/login', { email, password });
  return response.data;
};

// ── Screening ────────────────────────────────────────────────
export const screenResume = async (file, jobTitle, requiredSkills, minYearsExperience) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('jobTitle', jobTitle);
  requiredSkills.forEach(skill => formData.append('requiredSkills', skill));
  formData.append('minYearsExperience', String(minYearsExperience));

  const response = await API.post('/api/screen', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getResults = async (classification = null) => {
  const params = classification ? { classification } : {};
  const response = await API.get('/api/screen/results', { params });
  return response.data;
};