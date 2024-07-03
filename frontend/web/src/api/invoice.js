import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher } from 'src/utils/axios';

const endpoint = 'http://localhost:3333/invoice';
// ----------------------------------------------------------------------

export function useGetAllInvoices() {
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      invoices: data?.invoices || [],
      invoicesLoading: isLoading,
      invoicesError: error,
      invoicesValidating: isValidating,
      invoicesEmpty: !isLoading && !data?.invoices.length,
    }),
    [data?.invoices, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetInvoiceById(id) {
  const URL = id ? [endpoint, { params: { id } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      invoices: data?.invoices,
      invoicesLoading: isLoading,
      invoicesError: error,
      invoicesValidating: isValidating,
    }),
    [data?.invoices, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetLatestinvoices(id) {
  const URL = id ? [endpoint, { params: { id } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      latestinvoices: data?.latestinvoices || [],
      latestinvoicesLoading: isLoading,
      latestinvoicesError: error,
      latestinvoicesValidating: isValidating,
      latestinvoicesEmpty: !isLoading && !data?.latestinvoices.length,
    }),
    [data?.latestinvoices, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useSearchinvoices(query) {
  const URL = query ? [endpoint, { params: { query } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.results || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !data?.results.length,
    }),
    [data?.results, error, isLoading, isValidating]
  );

  return memoizedValue;
}
