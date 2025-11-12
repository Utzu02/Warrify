import GridContainer from "../components/GridContainer/GridContainer";
import LoginLightbox from "../components/LoginLightbox/LoginLightbox";
import DashboardHero from "../components/dashboard/DashboardHero";
import DashboardTools from "../components/dashboard/DashboardTools";
import DashboardTable from "../components/dashboard/DashboardTable";
import GmailConfigModal from "../components/GmailConfigModal/GmailConfigModal";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./styles/Dashboard.css";
import type { Warranty } from "../types/dashboard";
import { fetchUserWarranties } from "../api/users";
  
  interface DashProps {
    isLoggedIn?: boolean;
  }
  
  const Dashboard = ({ isLoggedIn }: DashProps) => {
    const { user } = useAuth();
    const [warranties, setWarranties] = useState<Warranty[]>([]);
    const [loadingWarranties, setLoadingWarranties] = useState(true);
    const [warrantyError, setWarrantyError] = useState<string | null>(null);
    const [showGmailConfigModal, setShowGmailConfigModal] = useState(false);
  
    useEffect(() => {
      let isMounted = true;
      const controller = new AbortController();
  
      const loadWarranties = async () => {
        try {
          if (!user) {
            setWarrantyError('Please log in to view your warranties.');
            setWarranties([]);
            setLoadingWarranties(false);
            return;
          }
  
          const payload = await fetchUserWarranties(user.id, { signal: controller.signal });
  
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
    }, [user]);
  
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

      // Filter by Is Expired
      const isExpiredFilters = activeFilters.isExpired ?? [];
      if (isExpiredFilters.length > 0) {
        const now = Date.now();
        result = result.filter((w) => {
          const expDate = w.expirationDate ? new Date(w.expirationDate).getTime() : null;
          if (!expDate) return false;
          const isExpired = expDate < now;
          
          // Check if warranty matches any selected filter
          return isExpiredFilters.some((filter) => {
            if (filter === 'yes') return isExpired;
            if (filter === 'no') return !isExpired;
            return false;
          });
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
    }, [warranties, searchQuery, sortOption, activeFilters]);

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

    const filters = [
      {
        key: 'productName',
        label: 'Product name',
        options: uniqueValues((w) => w.productName).map((value) => ({ 
          label: value, 
          value,
          count: getWarrantyCount('productName', value)
        }))
      },
      {
        key: 'provider',
        label: 'Provider',
        options: uniqueValues((w) => w.provider).map((value) => ({ 
          label: value, 
          value,
          count: getWarrantyCount('provider', value)
        }))
      },
      {
        key: 'purchaseDate',
        label: 'Purchase date',
        options: [
          { label: 'Last 7 days', value: 7, count: getWarrantyCount('purchaseDate', 7) },
          { label: 'Last 30 days', value: 30, count: getWarrantyCount('purchaseDate', 30) },
          { label: 'Last 90 days', value: 90, count: getWarrantyCount('purchaseDate', 90) }
        ]
      },
      {
        key: 'expirationDate',
        label: 'Expiration date',
        options: [
          { label: 'Next 7 days', value: 7, count: getWarrantyCount('expirationDate', 7) },
          { label: 'Next 30 days', value: 30, count: getWarrantyCount('expirationDate', 30) },
          { label: 'Next 90 days', value: 90, count: getWarrantyCount('expirationDate', 90) }
        ]
      },
      {
        key: 'isExpired',
        label: 'Is Expired',
        options: [
          { label: 'Yes', value: 'yes', count: getWarrantyCount('isExpired', 'yes') },
          { label: 'No', value: 'no', count: getWarrantyCount('isExpired', 'no') }
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
        <DashboardHero 
          activeCount={filteredAndSortedWarranties.length} 
          onSyncGmail={() => setShowGmailConfigModal(true)}
        />
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
        <DashboardTable 
          warranties={filteredAndSortedWarranties} 
          isLoading={loadingWarranties} 
        />
        {warrantyError && <p className="error-state">{warrantyError}</p>}
        <GmailConfigModal 
          isOpen={showGmailConfigModal} 
          onClose={() => setShowGmailConfigModal(false)} 
        />
      </div>
    );
  };

  export default Dashboard;
