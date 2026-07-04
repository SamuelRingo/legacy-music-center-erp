import { useState, useEffect } from 'react';

const globalCache = {};

export function getCache(key, expireMs = 300000) {
  const entry = globalCache[key];
  if (entry && entry.data && (Date.now() - entry.lastFetched < expireMs)) {
    return entry.data;
  }
  return null;
}

export function setCache(key, data) {
  globalCache[key] = { data, lastFetched: Date.now() };
}

export function clearCache(key) {
  if (key) {
    delete globalCache[key];
  } else {
    // clear all if no key passed
    Object.keys(globalCache).forEach(k => delete globalCache[k]);
  }
}

export function useCachedQuery(key, fetchFn, expireMs = 300000) {
  // Initialize with cached data to prevent flash of loading state
  const cachedInitial = getCache(key, expireMs);
  const [data, setData] = useState(cachedInitial || null);
  const [loading, setLoading] = useState(!cachedInitial);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cachedInitial) return;

    let isMounted = true;
    setLoading(true);
    setError(false);
    
    fetchFn()
      .then(res => {
        if (!isMounted) return;
        setData(res);
        setCache(key, res);
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error(`Fetch error for key ${key}:`, err);
        setError(true);
        setLoading(false);
      });
      
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // Intentionally not including fetchFn to prevent infinite loops if not memoized

  const refetch = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetchFn();
      setData(res);
      setCache(key, res);
    } catch(err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}
