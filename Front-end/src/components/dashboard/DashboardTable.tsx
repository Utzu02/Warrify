import { useMemo, useState } from 'react';
import Warranties from '../warranties/Warranties';
import LoadingSpinner from '../loadingSpinner/LoadingSpinner';
import type { Warranty } from '../../types/dashboard';
import './DashboardTable.css';

type DashboardTableProps = {
  warranties: Warranty[];
  isLoading?: boolean;
  onRefresh?: () => void;
};

const MAX_VISIBLE = 15; // Load 15 warranties at a time

const DashboardTable = ({ warranties, isLoading = false, onRefresh }: DashboardTableProps) => {
  const [visibleCount, setVisibleCount] = useState(MAX_VISIBLE);

  const canShowMore = useMemo(() => warranties.length > visibleCount, [warranties.length, visibleCount]);
  const remainingCount = warranties.length - visibleCount;

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + MAX_VISIBLE, warranties.length));
  };

  return (
    <section id="warranties" className="table-card card">
      {isLoading ? (
        <div className="loading-inline">
          <LoadingSpinner message="Loading your warranties..." size="medium" />
        </div>
      ) : (
        <>
          <Warranties warranties={warranties} limit={visibleCount} onRefresh={onRefresh} />
          {canShowMore && (
            <div className="table-footer">
              <button className="view-more-btn" onClick={handleShowMore}>
                Load more ({Math.min(remainingCount, MAX_VISIBLE)} of {remainingCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default DashboardTable;
