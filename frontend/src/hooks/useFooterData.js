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
    address: data?.footer_address || 'Jl. Musik Harmoni No. 88, Jakarta Selatan, 12345',
    phone: data?.footer_phone || '(021) 555-1234',
    email: data?.footer_email || 'hello@legacymusic.com',
    loading
  };
}
