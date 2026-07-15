import { useCallback } from 'react';
import api from '../lib/api';
import { useCachedQuery } from '../lib/cache';

export default function useFooterData() {
  const fetchFooterFn = useCallback(async () => {
    try {
      const res = await api.get('/public/landing-content?section=footer');
      const data = res.data.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});
      return data;
    } catch (e) {
      console.error('Failed to fetch footer data', e);
      return {};
    }
  }, []);

  const { data, loading } = useCachedQuery('landing_footer_data', fetchFooterFn);
  
  return {
    address: data?.address || (loading ? 'Memuat...' : ''),
    phone: data?.phone || (loading ? 'Memuat...' : ''),
    email: data?.email || (loading ? 'Memuat...' : ''),
    loading
  };
}
