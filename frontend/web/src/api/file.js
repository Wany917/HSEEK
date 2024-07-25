import axios from 'src/utils/axios';

export async function sendFile(file) {
  console.log('Sending file:', file.name);
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post('/files', formData);
  console.log('Send file response:', response.data);
  return response.data;
}

export async function getFiles() {
  console.log('Fetching files');
  const response = await axios.get('/files');
  console.log('Get files response:', response.data);
  
  // Transformer les données pour inclure les résultats d'analyse
  const filesWithAnalysis = response.data.map(file => ({
    ...file,
    analysisResult: {
      knownViruses: file.knownViruses,
      scannedFiles: file.scannedFiles,
      infectedFiles: file.infectedFiles,
      scanTime: file.scanTime
    }
  }));
  
  return filesWithAnalysis;
}

export async function checkAnalysisResult() {
  console.log('Checking analysis results');
  try {
    const response = await axios.get('/files/check-analysis');
    console.log('Check analysis response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error checking analysis results:', error);
    throw error;
  }
}
export async function deleteInScanResult(fileId) {
  console.log('Deleting file:', fileId);
  try {
    const response = await axios.delete(`/files/${fileId}`);
    console.log('Delete file response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting file:', error.response?.data || error.message);
    throw error;
  }
}