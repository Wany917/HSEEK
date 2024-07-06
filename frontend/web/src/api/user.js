import axios from 'axios';
import { useMemo, useState, useEffect } from 'react';

const endpoint = 'http://localhost:3333/users';

export function useGetAllUsers(page = 1, perPage = 10, username = '') {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const accessToken = sessionStorage.getItem('accessToken');
        
        const response = await axios.get(endpoint, {
          params: { page, perPage, username },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setData(response.data.data);
        console.log("test:", response.data.data)
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, perPage, username]);

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

export function useGetUserById(id) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setIsValidating(true);
      try {
        const response = await axios.get(`${endpoint}/${id}`);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setIsValidating(false);
      }
    };

    fetchData();
  }, [id]);

  const memoizedValue = useMemo(
    () => ({
      user: data?.data,
      userLoading: !data && !error,
      userError: error,
      userValidating: isValidating,
    }),
    [data, error, isValidating]
  );

  return memoizedValue;
}