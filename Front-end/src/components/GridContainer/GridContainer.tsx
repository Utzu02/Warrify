import './GridContainer.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import GmailButton from '../GmailLogin/GmailLogin';
import GmailConfigModal from '../GmailConfigModal/GmailConfigModal';
import FileImport from '../ImportFile/ImportFile';
import { fetchScanInfo } from '../../api/users';

type GridContainerProps = {
  managedCount?: number;
  expiringSoonCount?: number;
  remainingCount?: number;
  isLoadingCounts?: boolean;
};

type RelativeTime = {
  value: string;
  label: string;
};

const DEFAULT_RELATIVE_TIME: RelativeTime = { value: '—', label: 'No scans yet' };

const formatRelativeTime = (timestamp?: string | null): RelativeTime => {
  if (!timestamp) {
    return DEFAULT_RELATIVE_TIME;
  }

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return DEFAULT_RELATIVE_TIME;
  }

  const diffMs = Date.now() - parsed.getTime();
  if (diffMs < 60000) {
    return { value: '<1', label: 'Minutes since last check' };
  }

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) {
    return { value: minutes.toString(), label: 'Minutes since last check' };
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return { value: hours.toString(), label: 'Hours since last check' };
  }

  const days = Math.floor(hours / 24);
  return { value: days.toString(), label: 'Days since last check' };
};

function GridContainer({
  managedCount = 0,
  expiringSoonCount = 0,
  remainingCount = 0,
  isLoadingCounts = false
}: GridContainerProps) {
  const { user } = useAuth();
  const [showImportModal, setShowImportModal] = useState(false);
  const [showGmailConfigModal, setShowGmailConfigModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [lastCheckInfo, setLastCheckInfo] = useState<RelativeTime>(DEFAULT_RELATIVE_TIME);
  const managedDisplay = isLoadingCounts ? '—' : managedCount.toString();
  const expiringDisplay = isLoadingCounts ? '—' : expiringSoonCount.toString();
  const remainingDisplay = isLoadingCounts ? '—' : Math.max(remainingCount, 0).toString();
  const hasDanger = !isLoadingCounts && expiringSoonCount > 0;

  const fetchLastScan = useCallback(async () => {
    if (!user) {
      setLastCheckInfo({ ...DEFAULT_RELATIVE_TIME });
      return;
    }

    try {
      const payload = await fetchScanInfo(user.id);
      setLastCheckInfo(formatRelativeTime(payload.lastScanAt));
    } catch (error) {
      console.error('Failed to load scan info', error);
      setLastCheckInfo({ ...DEFAULT_RELATIVE_TIME });
    }
  }, [user]);

  useEffect(() => {
    fetchLastScan();
    const intervalId = window.setInterval(fetchLastScan, 60 * 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchLastScan]);

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setShowImportModal(false);
    }
  };

  useEffect(() => {
    if (showImportModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showImportModal]);

  return (
    <div className="grid-container">
      <div className="grid-item grid-item-1 flex">
        <div className="item-1">
          <div className="big-number">{lastCheckInfo.value}</div>
          <div className="item-1-text">{lastCheckInfo.label}</div>
        </div>
      </div>
      <div className="grid-item grid-item-2">
        <div className="item-2-row-1 flex">
          <div className="big-number">{managedDisplay}</div>
          <div className="item-1-text">Managed warranties</div>
          <button onClick={() => setShowImportModal(true)} className="button buttoninvert grid">
            Import
          </button>
        </div>
      </div>
      <div className="grid-item grid-item-2">
        <div className="item-2-row-1 flex">
          <div className="big-number">{remainingDisplay}</div>
          <div className="item-1-text">Remaining warranties</div>
        </div>
      </div>
      <div className="grid-item grid-item-3">
        <div className={`item-2-row-2 flex ${hasDanger ? 'pericol' : ''}`}>
          <div className={`big-number`}>{expiringDisplay}</div>
          <div className="item-1-text">Warranties with less than 7 days before expiring</div>
          {hasDanger && (
            <svg fill="#FF0000" className="danger-symbol" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30.334 30.334">
              <g>
                <rect width="100%" height="100%" fill="white" />
                <path
                  d="M15.167,0C6.805,0,0.001,6.804,0.001,15.167c0,8.362,6.804,15.167,15.166,15.167c8.361,0,15.166-6.805,15.166-15.167
                               C30.333,6.804,23.528,0,15.167,0z M17.167,25.667h-4v-4.5h4V25.667z M17.167,19.542h-4V5.167h4V19.542z"
                />
              </g>
            </svg>
          )}
        </div>
      </div>
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h2>Import Warranties</h2>
              <button onClick={() => setShowImportModal(false)} className="modal-close">
                &times;
              </button>
            </div>
            <div className="modal-body">
              <GmailButton onClick={() => {
                setShowImportModal(false);
                setShowGmailConfigModal(true);
              }} />
              <FileImport />
            </div>
          </div>
        </div>
      )}
      <GmailConfigModal 
        isOpen={showGmailConfigModal} 
        onClose={() => setShowGmailConfigModal(false)} 
      />
    </div>
  );
}
export default GridContainer;
