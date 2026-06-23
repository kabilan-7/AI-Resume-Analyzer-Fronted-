import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 120000,
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('rs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginRequest =
      err.config?.url === "/api/auth/login";

    if (err.response?.status === 401 && !isLoginRequest) {
      sessionStorage.removeItem('rs_token');
      sessionStorage.removeItem('rs_user');
      window.location.reload();
    }

    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────
export const registerUser = async (fullName, email, password) =>
  (await API.post('/api/auth/register', { fullName, email, password })).data;

export const loginUser = async (email, password) =>
  (await API.post('/api/auth/login', { email, password })).data;

// ── Single screening ─────────────────────────────────────────
export const screenResume = async (file, jobTitle, requiredSkills, minYearsExperience) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('jobTitle', jobTitle);
  requiredSkills.forEach(s => fd.append('requiredSkills', s));
  fd.append('minYearsExperience', String(minYearsExperience));
  return (await API.post('/api/screen', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })).data;
};

export const getResults = async (classification = null) => {
  const params = classification ? { classification } : {};
  return (await API.get('/api/screen/results', { params })).data;
};

// ── Job openings ─────────────────────────────────────────────
export const getJobs = async () =>
  (await API.get('/api/jobs')).data;

export const createJob = async (payload) =>
  (await API.post('/api/jobs', payload)).data;

export const deleteJob = async (id) =>
  API.delete(`/api/jobs/${id}`);

// ── Candidates ───────────────────────────────────────────────
export const getCandidates = async (jobId) =>
  (await API.get(`/api/jobs/${jobId}/candidates`)).data;

// ── Bulk screening ───────────────────────────────────────────
export const bulkScreen = async (jobId, files, onProgress) => {
  const fd = new FormData();
  files.forEach(f => fd.append('files', f));
  return (await API.post(`/api/jobs/${jobId}/bulk-screen`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  })).data;
};

// ── Export ───────────────────────────────────────────────────
export const exportCsv = (jobId) =>
  API.get(`/api/jobs/${jobId}/export/csv`, { responseType: 'blob' });

export const exportPdf = (jobId) =>
  API.get(`/api/jobs/${jobId}/export/pdf`, { responseType: 'blob' });