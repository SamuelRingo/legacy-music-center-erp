import { useState, useEffect } from 'react';
import api from '../../../lib/api';

export function useLandingContent(section, fallbackData = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      try {
        const response = await api.get('/public/landing-content', { params: { section } });
        const result = response.data;
        
        if (isMounted) {
          const contentMap = {};
          if (result && result.length > 0) {
            result.forEach(item => {
              contentMap[item.key] = item.value;
            });
          }
          setData(contentMap);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Failed to fetch landing content for ${section}:`, err);
          setError(err);
          setData(fallbackData);
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
