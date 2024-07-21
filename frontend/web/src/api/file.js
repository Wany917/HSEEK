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
  return response.data;
}

export async function checkAnalysisResult(filename) {
  console.log('Checking analysis result for:', filename);
  const checkInterval = 5000; // 5 seconds
  const maxDuration = 60000; // 1 minute total
  const startTime = Date.now();

  const checkOnce = async () => {
    try {
      const response = await axios.get('/files/check-analysis');
      console.log('Check analysis response:', response.data);
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
      console.error('Analysis timed out');
      throw new Error('Analysis timed out');
    }

    const result = await checkOnce();
    if (result) {
      return result;
    }

    console.log('Analysis not complete, checking again in', checkInterval, 'ms');
    await new Promise(resolve => setTimeout(resolve, checkInterval));
    return recursiveCheck();
  };

  return recursiveCheck();
}

export async function deleteFile(fileName) {
  console.log('Deleting file:', fileName);
  const response = await axios.delete(`/files/${fileName}`);
  console.log('Delete file response:', response.data);
  return response.data;
}