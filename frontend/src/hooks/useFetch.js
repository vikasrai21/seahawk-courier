// src/hooks/useFetch.js — Generic data-fetching hook with refetch support
import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';

export function useFetch(url, options = {}) {
  const { skip = false, transform = null } = options;
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error,   setError]   = useState(null);
  const urlRef = useRef(url);
  urlRef.current = url;

  const refetch = useCallback(async (overrideUrl) => {
    const target = overrideUrl || urlRef.current;
    if (!target || skip) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(target);
      const raw = res?.data ?? res;
      setData(transform ? transform(raw) : raw);
    } catch (err) {
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [skip, transform]);

  useEffect(() => { if (!skip) refetch(); }, [refetch, skip]);

  return { data, loading, error, refetch, setData };
}
