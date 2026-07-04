import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [cache, setCache] = useState({
    admin: { data: null, lastFetched: 0 },
    staff: { data: null, lastFetched: 0 },
    teacher: { data: null, lastFetched: 0 },
    student: { data: null, lastFetched: 0 },
  });

  const getCachedData = (role, expireMs = 300000) => { // Default 5 menit
    const entry = cache[role];
    if (entry && entry.data && (Date.now() - entry.lastFetched < expireMs)) {
      return entry.data;
    }
    return null;
  };

  const setCachedData = (role, data) => {
    setCache(prev => ({
      ...prev,
      [role]: { data, lastFetched: Date.now() }
    }));
  };

  const clearDashboardCache = (role) => {
    setCache(prev => ({
      ...prev,
      [role]: { data: null, lastFetched: 0 }
    }));
  };

  return (
    <DashboardContext.Provider value={{ getCachedData, setCachedData, clearDashboardCache }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardCache() {
  return useContext(DashboardContext);
}

export function useDashboardQuery(role, fetchFn, expireMs = 300000) {
  const { getCachedData, setCachedData, clearDashboardCache } = useContext(DashboardContext);
  
  // Baca cache saat inisialisasi agar terhindar dari flash skeleton
  const cachedInitial = getCachedData(role, expireMs);
  const [data, setData] = useState(cachedInitial || null);
  const [loading, setLoading] = useState(!cachedInitial);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cachedInitial) return; // Jika sudah ada cache, jangan fetch on mount

    let isMounted = true;
    setLoading(true);
    setError(false);
    
    fetchFn()
      .then(res => {
        if (!isMounted) return;
        setData(res);
        setCachedData(role, res);
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Dashboard fetch error:', err);
        setError(true);
        setLoading(false);
      });
      
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]); 

  const refetch = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetchFn();
      setData(res);
      setCachedData(role, res);
    } catch(err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}
