import { useMemo, useState, useEffect } from 'react';
import Warranties from '../warranties/Warranties';
import LoadingSpinner from '../loadingSpinner/LoadingSpinner';
import type { Warranty } from '../../types/dashboard';
import './DashboardTable.css';

type DashboardTableProps = {
  warranties: Warranty[];
  isLoading?: boolean;
  onRefresh?: () => void;
};

const DEFAULT_PAGE_SIZE = 10;

const DashboardTable = ({ warranties, isLoading = false, onRefresh }: DashboardTableProps) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  // Reset to page 1 whenever the incoming warranties change (filters/sort applied upstream)
  useEffect(() => {
    setCurrentPage(1);
  }, [warranties]);

  // If pageSize changes, reset to page 1 as well
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(warranties.length / pageSize)), [warranties.length, pageSize]);

  const startIndex = useMemo(() => (currentPage - 1) * pageSize, [currentPage, pageSize]);
  const endIndex = useMemo(() => Math.min(startIndex + pageSize, warranties.length), [startIndex, pageSize, warranties.length]);

  const paginated = useMemo(() => warranties.slice(startIndex, endIndex), [warranties, startIndex, endIndex]);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handleGoTo = (page: number) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  // Build a compact, ellipsed page list: show first, last, and current +/- 2
  const pageNumbers = useMemo(() => {
    const pages: Array<number | string> = [];
    const delta = 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);

    if (left > 2) {
      pages.push('...');
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) {
      pages.push('...');
    }

    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  return (
    <section id="warranties" className="table-card card">
      {isLoading ? (
        <div className="loading-inline">
          <LoadingSpinner message="Loading your warranties..." size="medium" />
        </div>
      ) : (
        <>
          <Warranties
            warranties={paginated}
            onRefresh={onRefresh}
            pagination={{
              currentPage,
              pageSize,
              setPageSize,
              totalPages,
              pageNumbers,
              handlePrev,
              handleNext,
              handleGoTo,
              startIndex,
              endIndex,
              totalItems: warranties.length
            }}
          />
        </>
      )}
    </section>
  );
};

export default DashboardTable;
