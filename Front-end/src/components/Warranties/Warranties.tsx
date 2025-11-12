import './Warranties.css';
import { useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import ModalWarranty from '../ModalWarranty/ModalWarranty';
import type { Warranty } from '../../types/dashboard';
import { BASE_URL } from '../../config';

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

const useDownloadUrl = (warrantyId?: string) => {
  return useMemo(() => {
    if (!warrantyId) {
      return null;
    }
    const userId = Cookies.get('UID');
    if (!userId) {
      return null;
    }
    return `${BASE_URL}/api/warranties/${warrantyId}/download?userId=${userId}`;
  }, [warrantyId]);
};

function Warranties({ warranties, limit = warranties.length }: WarrantiesProps) {
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const itemsToRender = warranties.slice(0, limit);
  const downloadUrl = useDownloadUrl(selectedWarranty?.id);

  const handleViewPdf = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="warr-container">
      <ul className="warr-header">
        <li>Product Name</li>
        <li>Date bought</li>
        <li>Date of expirance</li>
        <li>Product provider</li>
      </ul>
      {itemsToRender.map((warranty) => (
        <div
          key={warranty.id}
          className="warr-entry"
          onClick={() => setSelectedWarranty(warranty)}
          role="button"
          tabIndex={0}
        >
          <ul className="warr-line">
            <li className="warr-element-prdName">{warranty.productName || warranty.filename}</li>
            <li className="warr-element-dataCump">{formatDate(warranty.purchaseDate)}</li>
            <li className="warr-element-dataExp">{formatDate(warranty.expirationDate)}</li>
            <li className="warr-element-com">{warranty.provider || 'Unknown'}</li>
          </ul>
        </div>
      ))}
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
    </div>
  );
}

export default Warranties;
