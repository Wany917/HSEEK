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

export async function checkAnalysisResult(filename) {
  const checkInterval = 5000; // 5 seconds
  const maxDuration = 60000; // 1 minute total
  const startTime = Date.now();

  const checkOnce = async () => {
    try {
      const response = await axios.get('/files/check-analysis');
      if (response.data.message === 'Analysis completed and results stored.') {
        return response.data.result;
      }
    } catch (error) {
      console.error('Error checking analysis result:', error);
    }
    return null;
  };

  const recursiveCheck = async () => {
    if (Date.now() - startTime >= maxDuration) {
      throw new Error('Analysis timed out');
    }

    const result = await checkOnce();
    if (result) {
      return result;
    }

    await new Promise(resolve => setTimeout(resolve, checkInterval));
    return recursiveCheck();
  };

  return recursiveCheck();
}

export async function deleteFile(fileName) {
  const response = await axios.delete(`/files/${fileName}`);
  return response.data;
}