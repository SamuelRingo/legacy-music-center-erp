import React, { createContext, useContext, useState, useCallback } from 'react';

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
