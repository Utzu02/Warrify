import { useMemo, useState } from 'react';
import Warranties from '../Warranties/Warranties';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import type { Warranty } from '../../types/dashboard';
import './DashboardTable.css';

type DashboardTableProps = {
  warranties: Warranty[];
  isLoading?: boolean;
};

const MAX_VISIBLE = 10;

const DashboardTable = ({ warranties, isLoading = false }: DashboardTableProps) => {
  const [visibleCount, setVisibleCount] = useState(MAX_VISIBLE);

  const canShowMore = useMemo(() => warranties.length > visibleCount, [warranties.length, visibleCount]);

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + MAX_VISIBLE, warranties.length));
  };

  return (
    <section id="warranties" className="table-card card">
      <div className="table-header">
        <div>
          <p className="eyebrow">Documents</p>
          <h2>Your warranties</h2>
        </div>
        <span className="pill">{warranties.length} active</span>
      </div>
      {isLoading ? (
        <div className="loading-inline">
          <LoadingSpinner message="Loading your warranties..." size="medium" />
        </div>
      ) : (
        <>
          <Warranties warranties={warranties} limit={visibleCount} />
          {canShowMore && (
            <div className="table-footer">
              <button className="view-more-btn" onClick={handleShowMore}>
                View more
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default DashboardTable;
