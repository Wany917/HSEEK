import axios from 'axios';

export const sendFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const accessToken = sessionStorage.getItem('accessToken');

  const response = await axios.post('http://localhost:3333/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const getFiles = async () => {
  const accessToken = sessionStorage.getItem('accessToken');
  const response = await axios.get('http://localhost:3333/files', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};
