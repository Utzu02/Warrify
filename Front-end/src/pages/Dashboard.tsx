import GridContainer from "../components/gridContainer/GridContainer";
import DashboardHero from "../components/dashboard/DashboardHero";
import DashboardTools from "../components/dashboard/DashboardTools";
import DashboardTable from "../components/dashboard/DashboardTable";
import GmailConfigModal from "../components/gmailConfigModal/GmailConfigModal";
import Footer from "../components/footer/Footer";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useWarranties } from "../hooks/useWarranties";
import { useWarrantyFilters } from "../hooks/useWarrantyFilters";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const { warranties, loading: loadingWarranties, error: warrantyError } = useWarranties(user?.id);
  const [showGmailConfigModal, setShowGmailConfigModal] = useState(false);
  const [sortOption, setSortOption] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, Array<string | number>>>({});

  const {
    filteredWarranties,
    managedCount,
    expiringSoonCount,
    remainingCount,
    getWarrantyCount
  } = useWarrantyFilters(warranties, searchQuery, sortOption, activeFilters);

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

  const uniqueValues = <T extends string | null | undefined>(mapFn: (w: any) => T) => {
    return Array.from(new Set(warranties.map(mapFn).filter(Boolean))) as string[];
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
    <>
    <div className="dashboard-page">
      <DashboardHero 
        activeCount={filteredWarranties.length} 
        onSyncGmail={() => setShowGmailConfigModal(true)}
      />
      <GridContainer
        managedCount={managedCount}
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
        warranties={filteredWarranties} 
        isLoading={loadingWarranties} 
      />
      {warrantyError && <p className="error-state">{warrantyError}</p>}
      <GmailConfigModal 
        isOpen={showGmailConfigModal} 
        onClose={() => setShowGmailConfigModal(false)} 
      />
    </div>
    <Footer />
    </>
  );
};

export default Dashboard;
