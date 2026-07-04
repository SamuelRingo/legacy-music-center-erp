import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export function useLandingContent(section, fallbackData = {}) {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      try {
        const response = await api.get('/public/landing-content', { params: { section } });
        const result = response.data;
        
        if (isMounted) {
          // If the DB has data, override the fallback
          if (result && result.length > 0) {
            const contentMap = {};
            result.forEach(item => {
              contentMap[item.key] = item.value;
            });
            // Merge with fallback so we don't have undefined if some keys are missing
            setData(prev => ({ ...prev, ...contentMap }));
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Failed to fetch landing content for ${section}:`, err);
          setError(err);
          // Keep the fallback data in state
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [section]);

  return { data, loading, error };
}
