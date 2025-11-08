import GridContainer from "../components/GridContainer/GridContainer";
import LoginLightbox from "../components/LoginLightbox/LoginLightbox";
import DashboardHero from "../components/dashboard/DashboardHero";
import DashboardTools from "../components/dashboard/DashboardTools";
import DashboardTable from "../components/dashboard/DashboardTable";
import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import "./styles/Dashboard.css";
import type { Warranty } from "../types/dashboard";
import { BASE_URL } from "../config";
  
  interface DashProps {
    isLoggedIn?: boolean;
  }
  
  const Dashboard = ({ isLoggedIn }: DashProps) => {
    const [warranties, setWarranties] = useState<Warranty[]>([]);
    const [loadingWarranties, setLoadingWarranties] = useState(true);
    const [warrantyError, setWarrantyError] = useState<string | null>(null);
  
    useEffect(() => {
      let isMounted = true;
      const controller = new AbortController();
  
      const loadWarranties = async () => {
        try {
          const userId = Cookies.get('UID');
          if (!userId) {
            setWarrantyError('Please log in to view your warranties.');
            setWarranties([]);
            setLoadingWarranties(false);
            return;
          }
  
          const response = await fetch(`${BASE_URL}/api/users/${userId}/warranties`, {
            credentials: 'include',
            signal: controller.signal
          });
  
          const payload = await response.json().catch(() => ({}));
  
          if (!response.ok) {
            throw new Error(payload.error || 'Failed to load warranties');
          }
  
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
          setWarrantyError(null);
        } catch (error) {
          if (!isMounted) {
            return;
          }
          setWarrantyError(error instanceof Error ? error.message : 'Unexpected error');
          setWarranties([]);
        } finally {
          if (isMounted) {
            setLoadingWarranties(false);
          }
        }
      };
  
      loadWarranties();
  
      return () => {
        isMounted = false;
        controller.abort();
      };
    }, []);
  
    const [sortOption, setSortOption] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Record<string, Array<string | number>>>({});
  
    const parseDate = (value?: string | null) => {
      if (!value) return null;
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };
  
    const filteredAndSortedWarranties = useMemo(() => {
      let result = [...warranties];
      
      // Filtrare
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(warranty => 
          warranty.productName.toLowerCase().includes(query) ||
          warranty.provider.toLowerCase().includes(query)
        );
      }

      const productFilters = activeFilters.productName ?? [];
      if (productFilters.length > 0) {
        result = result.filter((w) => productFilters.includes(w.productName));
      }

      const providerFilters = activeFilters.provider ?? [];
      if (providerFilters.length > 0) {
        result = result.filter((w) => providerFilters.includes(w.provider));
      }

      const purchaseFilters = (activeFilters.purchaseDate ?? []) as number[];
      if (purchaseFilters.length > 0) {
        const now = Date.now();
        result = result.filter((w) => {
          const date = w.purchaseDate ? new Date(w.purchaseDate).getTime() : null;
          if (!date) return false;
          return purchaseFilters.some((days) => now - date <= days * 24 * 60 * 60 * 1000);
        });
      }

      const expirationFilters = (activeFilters.expirationDate ?? []) as number[];
      if (expirationFilters.length > 0) {
        const now = Date.now();
        result = result.filter((w) => {
          const date = w.expirationDate ? new Date(w.expirationDate).getTime() : null;
          if (!date) return false;
          return expirationFilters.some((days) => date - now <= days * 24 * 60 * 60 * 1000);
        });
      }
  
      // Sortare
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
    }, [warranties, searchQuery, sortOption]);

    const managedWarranties = warranties.length;
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
    const remainingCount = Math.max(managedWarranties - expiringSoonCount, 0);
  
    const handleSortSelection = (option: string) => {
      setSortOption(option);
      setIsSortOpen(false);
    };
  
    const toggleSortDropdown = () => setIsSortOpen(!isSortOpen);
    const sortOptions = [
      "Expiration Date (Asc)",
      "Expiration Date (Desc)",
      "Upcoming Expiration (Asc)",
      "Upcoming Expiration (Desc)",
      "Name (A-Z)",
      "Name (Z-A)"
    ];

    const uniqueValues = <T extends string | null | undefined>(mapFn: (w: Warranty) => T) => {
      return Array.from(new Set(warranties.map(mapFn).filter(Boolean))) as string[];
    };

    const filters = [
      {
        key: 'productName',
        label: 'Product name',
        options: uniqueValues((w) => w.productName).map((value) => ({ label: value, value }))
      },
      {
        key: 'provider',
        label: 'Provider',
        options: uniqueValues((w) => w.provider).map((value) => ({ label: value, value }))
      },
      {
        key: 'purchaseDate',
        label: 'Purchase date',
        options: [
          { label: 'Last 7 days', value: 7 },
          { label: 'Last 30 days', value: 30 },
          { label: 'Last 90 days', value: 90 }
        ]
      },
      {
        key: 'expirationDate',
        label: 'Expiration date',
        options: [
          { label: 'Next 7 days', value: 7 },
          { label: 'Next 30 days', value: 30 },
          { label: 'Next 90 days', value: 90 }
        ]
      }
    ];

    const handleFilterChange = (key: string, value: string | number) => {
      setActiveFilters((prev) => {
        const current = prev[key] ?? [];
        const exists = current.includes(value);
        const nextValues = exists ? current.filter((item) => item !== value) : [...current, value];
        return { ...prev, [key]: nextValues };
      });
    };

    return (
      <div className="dashboard-page">
        {!isLoggedIn && <LoginLightbox />}
        <DashboardHero activeCount={filteredAndSortedWarranties.length} />
        <GridContainer
          managedCount={managedWarranties}
          expiringSoonCount={expiringSoonCount}
          remainingCount={remainingCount}
          isLoadingCounts={loadingWarranties}
        />
        <DashboardTools
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOptions={sortOptions}
          selectedSort={sortOption}
          isSortOpen={isSortOpen}
          onToggleSort={toggleSortDropdown}
          onSelectSort={handleSortSelection}
          activeFilters={activeFilters}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        <DashboardTable warranties={filteredAndSortedWarranties} />
        {loadingWarranties && <p className="loading-state">Loading your warranties...</p>}
        {warrantyError && <p className="error-state">{warrantyError}</p>}
      </div>
    );
  };

  export default Dashboard;
