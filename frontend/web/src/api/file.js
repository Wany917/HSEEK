import axios from 'src/utils/axios';

export async function sendFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post('/files', formData);
  return response.data;
}

export async function getFiles() {
  const response = await axios.get('/files');
  return response.data;
}

export async function checkAnalysisResult() {
  const response = await axios.get('/files/check-analysis');
  return response.data;
}

export async function getAnalysisResult(id) {
  const response = await axios.get(`/files/analysis/${id}`);
  return response.data;
}

export async function deleteFile(fileName) {
  const response = await axios.delete(`/files/${fileName}`);
  return response.data;
}