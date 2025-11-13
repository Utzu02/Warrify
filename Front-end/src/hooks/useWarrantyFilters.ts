import { useMemo } from 'react';
import type { Warranty } from '../types/dashboard';

interface UseWarrantyFiltersResult {
  filteredWarranties: Warranty[];
  managedCount: number;
  expiringSoonCount: number;
  remainingCount: number;
  getWarrantyCount: (filterKey: string, filterValue: string | number) => number;
}

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const useWarrantyFilters = (
  warranties: Warranty[],
  searchQuery: string,
  sortOption: string,
  activeFilters: Record<string, Array<string | number>>
): UseWarrantyFiltersResult => {
  
  const filteredAndSortedWarranties = useMemo(() => {
    let result = [...warranties];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(warranty => 
        warranty.productName.toLowerCase().includes(query) ||
        warranty.provider.toLowerCase().includes(query)
      );
    }

    // Product name filter
    const productFilters = activeFilters.productName ?? [];
    if (productFilters.length > 0) {
      result = result.filter((w) => productFilters.includes(w.productName));
    }

    // Provider filter
    const providerFilters = activeFilters.provider ?? [];
    if (providerFilters.length > 0) {
      result = result.filter((w) => providerFilters.includes(w.provider));
    }

    // Purchase date filter
    const purchaseFilters = (activeFilters.purchaseDate ?? []) as number[];
    if (purchaseFilters.length > 0) {
      const now = Date.now();
      result = result.filter((w) => {
        const date = w.purchaseDate ? new Date(w.purchaseDate).getTime() : null;
        if (!date) return false;
        return purchaseFilters.some((days) => now - date <= days * 24 * 60 * 60 * 1000);
      });
    }

    // Expiration date filter
    const expirationFilters = (activeFilters.expirationDate ?? []) as number[];
    if (expirationFilters.length > 0) {
      const now = Date.now();
      result = result.filter((w) => {
        const date = w.expirationDate ? new Date(w.expirationDate).getTime() : null;
        if (!date) return false;
        return expirationFilters.some((days) => date - now <= days * 24 * 60 * 60 * 1000);
      });
    }

    // Is Expired filter
    const isExpiredFilters = activeFilters.isExpired ?? [];
    if (isExpiredFilters.length > 0) {
      const now = Date.now();
      result = result.filter((w) => {
        const expDate = w.expirationDate ? new Date(w.expirationDate).getTime() : null;
        if (!expDate) return false;
        const isExpired = expDate < now;
        
        return isExpiredFilters.some((filter) => {
          if (filter === 'yes') return isExpired;
          if (filter === 'no') return !isExpired;
          return false;
        });
      });
    }

    // Sorting
    const today = new Date();
    switch (sortOption) {
      case "Expiration Date (Asc)":
        return result.sort((a, b) => {
          const aDate = parseDate(a.expirationDate)?.getTime() ?? Number.POSITIVE_INFINITY;
          const bDate = parseDate(b.expirationDate)?.getTime() ?? Number.POSITIVE_INFINITY;
          return aDate - bDate;
        });
      case "Expiration Date (Desc)":
        return result.sort((a, b) => {
          const aDate = parseDate(a.expirationDate)?.getTime() ?? Number.NEGATIVE_INFINITY;
          const bDate = parseDate(b.expirationDate)?.getTime() ?? Number.NEGATIVE_INFINITY;
          return bDate - aDate;
        });
      case "Upcoming Expiration (Asc)":
        return result.sort((a, b) => {
          const aDiff = (parseDate(a.expirationDate)?.getTime() ?? Number.POSITIVE_INFINITY) - today.getTime();
          const bDiff = (parseDate(b.expirationDate)?.getTime() ?? Number.POSITIVE_INFINITY) - today.getTime();
          return aDiff - bDiff;
        });
      case "Upcoming Expiration (Desc)":
        return result.sort((a, b) => {
          const aDiff = (parseDate(a.expirationDate)?.getTime() ?? Number.POSITIVE_INFINITY) - today.getTime();
          const bDiff = (parseDate(b.expirationDate)?.getTime() ?? Number.POSITIVE_INFINITY) - today.getTime();
          return bDiff - aDiff;
        });
      case "Name (A-Z)":
        return result.sort((a, b) => a.productName.localeCompare(b.productName));
      case "Name (Z-A)":
        return result.sort((a, b) => b.productName.localeCompare(a.productName));
      default:
        return result;
    }
  }, [warranties, searchQuery, sortOption, activeFilters]);

  const managedCount = warranties.length;

  const expiringSoonCount = useMemo(() => {
    const now = Date.now();
    const thresholdMs = 7 * 24 * 60 * 60 * 1000;
    return warranties.reduce((count, warranty) => {
      const expDate = parseDate(warranty.expirationDate);
      if (!expDate) {
        return count;
      }
      const diff = expDate.getTime() - now;
      if (diff <= thresholdMs) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [warranties]);

  const remainingCount = Math.max(managedCount - expiringSoonCount, 0);

  const getWarrantyCount = (filterKey: string, filterValue: string | number): number => {
    const now = Date.now();
    
    switch (filterKey) {
      case 'productName':
        return warranties.filter(w => w.productName === filterValue).length;
      
      case 'provider':
        return warranties.filter(w => w.provider === filterValue).length;
      
      case 'purchaseDate': {
        const days = filterValue as number;
        return warranties.filter(w => {
          const date = w.purchaseDate ? new Date(w.purchaseDate).getTime() : null;
          if (!date) return false;
          return now - date <= days * 24 * 60 * 60 * 1000;
        }).length;
      }
      
      case 'expirationDate': {
        const days = filterValue as number;
        return warranties.filter(w => {
          const date = w.expirationDate ? new Date(w.expirationDate).getTime() : null;
          if (!date) return false;
          return date - now <= days * 24 * 60 * 60 * 1000;
        }).length;
      }
      
      case 'isExpired': {
        return warranties.filter(w => {
          const expDate = w.expirationDate ? new Date(w.expirationDate).getTime() : null;
          if (!expDate) return false;
          const isExpired = expDate < now;
          return filterValue === 'yes' ? isExpired : !isExpired;
        }).length;
      }
      
      default:
        return 0;
    }
  };

  return {
    filteredWarranties: filteredAndSortedWarranties,
    managedCount,
    expiringSoonCount,
    remainingCount,
    getWarrantyCount
  };
};
