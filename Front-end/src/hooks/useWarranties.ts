import { useState, useEffect } from 'react';
import { fetchUserWarranties } from '../api/users';
import type { Warranty } from '../types/dashboard';

interface UseWarrantiesResult {
  warranties: Warranty[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useWarranties = (userId?: string): UseWarrantiesResult => {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadWarranties = async () => {
      setLoading(true);
      try {
        if (!userId) {
          setError('Please log in to view your warranties.');
          setWarranties([]);
          setLoading(false);
          return;
        }

        const payload = await fetchUserWarranties(userId, { signal: controller.signal });

        if (!isMounted) {
          return;
        }

        const mapped = (payload.items || []).map((item: any) => ({
          id: item.id,
          productName: item.productName,
          purchaseDate: item.purchaseDate,
          expirationDate: item.expirationDate,
          provider: item.provider,
          filename: item.filename,
          size: item.size
        }));

        setWarranties(mapped);
        setError(null);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unexpected error');
        setWarranties([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadWarranties();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [userId, refetchTrigger]);

  const refetch = () => setRefetchTrigger(prev => prev + 1);

  return { warranties, loading, error, refetch };
};
