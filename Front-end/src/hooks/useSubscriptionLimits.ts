import { useEffect, useState, useCallback } from 'react';
import { fetchSubscriptionLimits } from '../api/subscription';

export const useSubscriptionLimits = () => {
  const [maxWarranties, setMaxWarranties] = useState<number | null>(null);
  const [currentWarranties, setCurrentWarranties] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [overLimit, setOverLimit] = useState<boolean>(false);
  const [exceedsBy, setExceedsBy] = useState<number>(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSubscriptionLimits();
      const max = data.maxWarranties ?? null;
      const current = typeof data.currentWarranties === 'number' ? data.currentWarranties : 0;
      setMaxWarranties(max);
      setCurrentWarranties(current);
        // prefer backend-provided remaining if available
        if (typeof data.remaining === 'number') {
          setRemaining(data.remaining);
        } else if (typeof max === 'number') {
          setRemaining(Math.max(0, max - current));
        } else {
          setRemaining(null);
        }

        setOverLimit(Boolean(data.overLimit));
        setExceedsBy(typeof data.exceedsBy === 'number' ? data.exceedsBy : Math.max(0, current - (max ?? 0)));
    } catch (err: any) {
      setError(err?.message || 'Failed to load limits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // don't auto-refresh often here — caller can call refresh if needed
  }, [load]);

  return {
    maxWarranties,
    currentWarranties,
  remaining,
  overLimit,
  exceedsBy,
    loading,
    error,
    refresh: load
  } as const;
};

export default useSubscriptionLimits;
