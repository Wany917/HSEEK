import axios from 'axios';
import { useMemo, useState, useEffect } from 'react';

const endpoint = 'http://localhost:3333/files';

export function sendFile(file) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const sendFile = async () => {
        setIsLoading(true);
        try {
          const accessToken = sessionStorage.getItem('accessToken');
          
          await axios.post(endpoint, {
            params: { file },
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          setError(null);
        } catch (err) {
          setError(err);
        } finally {
          setIsLoading(false);
        }
      };
  
      sendFile();
    }, [file]);
  
    const memoizedValue = useMemo(
      () => ({
        users: data?.data || [],
        usersLoading: isLoading,
        usersError: error,
        meta: data?.meta || {},
      }),
      [data, error, isLoading]
    );
  
    return memoizedValue;
  }