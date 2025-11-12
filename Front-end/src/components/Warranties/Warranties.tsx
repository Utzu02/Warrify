import './Warranties.css';
import { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ModalWarranty from '../ModalWarranty/ModalWarranty';
import type { Warranty } from '../../types/dashboard';
import { BASE_URL } from '../../config';
import * as XLSX from 'xlsx';
import { apiFetch } from '../../api/client';

interface WarrantiesProps {
  warranties: Warranty[];
  limit?: number;
}

const formatDate = (value: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }
  return parsed.toLocaleDateString('ro-RO');
};

  const isExpired = (warranty: Warranty): boolean => {
    if (!warranty.expirationDate) return false;
    return new Date(warranty.expirationDate) < new Date();
  };

const useDownloadUrl = (warrantyId?: string) => {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!warrantyId || !user) {
      return null;
    }
    return `${BASE_URL}/api/warranties/${warrantyId}/download?userId=${user.id}`;
  }, [warrantyId, user]);
};

function Warranties({ warranties, limit = warranties.length }: WarrantiesProps) {
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [warrantyToDelete, setWarrantyToDelete] = useState<Warranty | null>(null);
  const itemsToRender = warranties.slice(0, limit);
  const downloadUrl = useDownloadUrl(selectedWarranty?.id);

  // Select/Deselect all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(itemsToRender.map(w => w.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  // Toggle individual checkbox
  const handleToggleSelect = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Export selected warranties to Excel
  const handleExportToExcel = () => {
    const selectedWarranties = warranties.filter(w => selectedIds.has(w.id));
    
    if (selectedWarranties.length === 0) {
      alert('Please select at least one warranty to export');
      return;
    }

    // Prepare data for Excel
    const excelData = selectedWarranties.map(w => ({
      'PDF Name': w.productName || w.filename,
      'Provider': w.provider || 'Unknown',
      'Purchase Date': formatDate(w.purchaseDate),
      'Expiration Date': formatDate(w.expirationDate),
      'Is Expired': isExpired(w) ? 'Yes' : 'No',
      'Filename': w.filename
    }));

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Warranties');

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `warranties_export_${date}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);
  };

  const allSelected = itemsToRender.length > 0 && itemsToRender.every(w => selectedIds.has(w.id));
  const someSelected = selectedIds.size > 0;

  const handleViewPdf = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDeleteWarranty = async (warrantyId: string) => {
    setDeletingId(warrantyId);
    try {
      await apiFetch(`/api/warranties/${warrantyId}`, {
        method: 'DELETE'
      });
      
      // Remove from selected if it was selected
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(warrantyId);
        return newSet;
      });
      
      // Close the modal
      setWarrantyToDelete(null);
      
      // Refresh the page or update parent state
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete warranty:', error);
      alert('Failed to delete warranty. Please try again.');
      setWarrantyToDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="warr-container">
      {/* Header with selection info and export */}
      <div className="warranties-header">
        <div className="header-left">
          <h2 className="warranties-title">
            Recent Warranties
            <span className="active-pill">{warranties.length} active</span>
          </h2>
          <p className="warranties-subtitle">
            {someSelected ? `${selectedIds.size} warranty${selectedIds.size !== 1 ? 's' : ''} selected` : 'No warranties selected'}
          </p>
        </div>
        <button 
          onClick={handleExportToExcel} 
          className="export-btn"
          title={selectedIds.size === 0 ? "Select warranties to export" : "Export selected warranties to Excel"}
          disabled={selectedIds.size === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Export XLS ({selectedIds.size})
        </button>
      </div>
      
      {/* Table header with Select All checkbox */}
      <ul className="warr-header">
        <li className="checkbox-cell">
          <div className="checkbox-wrapper" title={allSelected ? 'Deselect all warranties' : 'Select all warranties'}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              aria-label="Select all warranties"
            />
          </div>
        </li>
        <li>Date/Time</li>
        <li>Provider</li>
        <li>Purchased</li>
        <li>Expires</li>
        <li>Is Expired</li>
        <li className="actions-header">Actions</li>
      </ul>
      
      {/* Warranty rows */}
      {itemsToRender.map((warranty) => {
        const expired = isExpired(warranty);
        
        return (
          <div
            key={warranty.id}
            className={`warr-entry ${selectedIds.has(warranty.id) ? 'selected' : ''}`}
          >
            <ul className="warr-line">
              <li className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                <div className="checkbox-wrapper" title={`Select ${warranty.productName || warranty.filename}`}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(warranty.id)}
                    onChange={(e) => handleToggleSelect(warranty.id, e as any)}
                    aria-label={`Select ${warranty.productName || warranty.filename}`}
                  />
                </div>
              </li>
              <li className="warr-element-prdName" title={warranty.filename || warranty.productName}>
                {warranty.filename || warranty.productName}
              </li>
              <li className="warr-element-com" title={warranty.provider || 'Unknown'}>
                {warranty.provider || 'Unknown'}
              </li>
              <li className="warr-element-dataCump" title={`Purchased: ${formatDate(warranty.purchaseDate)}`}>
                {formatDate(warranty.purchaseDate)}
              </li>
              <li className="warr-element-dataExp" title={`Expires: ${formatDate(warranty.expirationDate)}`}>
                {formatDate(warranty.expirationDate)}
              </li>
              <li className={`warr-element-expired ${expired ? 'expired' : 'valid'}`} title={expired ? 'This warranty has expired' : 'This warranty is active'}>
                {expired ? 'Yes' : 'No'}
              </li>
              <li className="action-cell">
                <button
                  onClick={() => setSelectedWarranty(warranty)}
                  className="action-btn action-btn-view"
                  aria-label="View warranty details"
                  title="View warranty details"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
                <button
                  onClick={() => setWarrantyToDelete(warranty)}
                  className="action-btn action-btn-delete"
                  aria-label="Delete warranty"
                  title="Delete warranty"
                  disabled={deletingId === warranty.id}
                >
                  {deletingId === warranty.id ? (
                    <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  )}
                </button>
              </li>
            </ul>
          </div>
        );
      })}
      
      {selectedWarranty && (
        <ModalWarranty onClose={() => setSelectedWarranty(null)}>
          <h2>{selectedWarranty.productName || selectedWarranty.filename} Details</h2>
          <div className="modal-details">
            <p><strong>Purchase Date:</strong> {formatDate(selectedWarranty.purchaseDate)}</p>
            <p><strong>Expiration Date:</strong> {formatDate(selectedWarranty.expirationDate)}</p>
            <p><strong>Provider:</strong> {selectedWarranty.provider || 'Unknown'}</p>
            <p><strong>File name:</strong> {selectedWarranty.filename}</p>
          </div>
          <div className='modal-previewdownload'>
            <button className='button buttoninvert modal-war-2' onClick={handleViewPdf} disabled={!downloadUrl}>
              View PDF
            </button>
            {downloadUrl ? (
              <a className='button modal-war' href={downloadUrl} target="_blank" rel="noopener noreferrer">
                Download PDF
              </a>
            ) : (
              <button className='button modal-war' disabled>
                Download unavailable
              </button>
            )}
          </div>
        </ModalWarranty>
      )}

      {/* Delete Confirmation Modal */}
      {warrantyToDelete && (
        <div className="delete-modal-overlay" onClick={() => setWarrantyToDelete(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <div className="delete-modal-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3>Delete Warranty</h3>
            </div>
            <div className="delete-modal-body">
              <p>Are you sure you want to delete this warranty?</p>
              <div className="delete-warranty-info">
                <strong>{warrantyToDelete.filename || warrantyToDelete.productName}</strong>
                <span>{warrantyToDelete.provider || 'Unknown Provider'}</span>
              </div>
              <p className="delete-warning">This action cannot be undone.</p>
            </div>
            <div className="delete-modal-actions">
              <button 
                className="delete-modal-btn delete-modal-btn-cancel"
                onClick={() => setWarrantyToDelete(null)}
                disabled={deletingId === warrantyToDelete.id}
              >
                Cancel
              </button>
              <button 
                className="delete-modal-btn delete-modal-btn-delete"
                onClick={() => handleDeleteWarranty(warrantyToDelete.id)}
                disabled={deletingId === warrantyToDelete.id}
              >
                {deletingId === warrantyToDelete.id ? (
                  <>
                    <svg className="spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="2" x2="12" y2="6"></line>
                      <line x1="12" y1="18" x2="12" y2="22"></line>
                      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                      <line x1="2" y1="12" x2="6" y2="12"></line>
                      <line x1="18" y1="12" x2="22" y2="12"></line>
                      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Warranty'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Warranties;
