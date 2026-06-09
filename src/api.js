import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 60000,
});

// Screen a resume
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

// Get all results
export const getResults = async (classification = null) => {
  const params = classification ? { classification } : {};
  const response = await API.get('/api/screen/results', { params });
  return response.data;
};