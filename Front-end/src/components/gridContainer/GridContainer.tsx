import './GridContainer.css';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchScanInfo } from '../../api/users';
import ImportOptionsModal from '../importOptionsModal/ImportOptionsModal';
import Button from '../button';
import useSubscriptionLimits from '../../hooks/useSubscriptionLimits';

type GridContainerProps = {
  managedCount?: number;
  expiringSoonCount?: number;
  remainingCount?: number;
  isLoadingCounts?: boolean;
  onManualUploadComplete?: () => void;
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
  isLoadingCounts = false,
  onManualUploadComplete
}: GridContainerProps) {
  const { user } = useAuth();
  const [showImportModal, setShowImportModal] = useState(false);
  const [lastCheckInfo, setLastCheckInfo] = useState<RelativeTime>(DEFAULT_RELATIVE_TIME);
  const { maxWarranties, currentWarranties, remaining, loading: limitsLoading, overLimit, exceedsBy } = useSubscriptionLimits();
  const managedDisplay = limitsLoading ? (isLoadingCounts ? '—' : managedCount.toString()) : String(currentWarranties ?? managedCount);
  const expiringDisplay = isLoadingCounts ? '—' : expiringSoonCount.toString();
  const remainingDisplay = limitsLoading ? '—' : (remaining !== null ? String(remaining) : Math.max(remainingCount, 0).toString());

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

  const handleUploadSuccess = () => {
    setShowImportModal(false);
    onManualUploadComplete?.();
  };

  return (
    <div className="grid-container">
      <div className="grid-item grid-item-1 flex">
        <div className="item-1">
          <div className="big-number">{lastCheckInfo.value}</div>
          <div className="item-1-text">{lastCheckInfo.label}</div>
        </div>
      </div>
      <div className="grid-item grid-item-1 flex">
        <div className="item-1">
          <div className="big-number">{managedDisplay}{maxWarranties ? ` / ${maxWarranties}` : ''}</div>
          <div className="item-1-text">Warranties tracked</div>
          <div style={{ marginTop: 8 }}>
            <Button
              variant="primary"
              size="medium"
              className="grid-button"
              onClick={() => setShowImportModal(true)}
              disabled={typeof maxWarranties === 'number' && Number(currentWarranties) >= maxWarranties}
            >
              Import
            </Button>
          </div>
        </div>
      </div>
      <div className="grid-item grid-item-1 flex">
        <div className="item-1">
          <div className="big-number">{(typeof remaining === 'number' && Number(remaining) <= 0) || overLimit ? (
            <span style={{ color: '#b91c1c' }}>{overLimit ? `${exceedsBy} over` : remainingDisplay}</span>
          ) : (
            remainingDisplay
          )}</div>
          <div className="item-1-text">Remaining warranties</div>
        </div>
      </div>
      <div className="grid-item pericol grid-item-1">
        <div className='item-1'>
          <div className={`big-number`}>{expiringDisplay}</div>
          <div className="item-1-text">Warranties with less than 7 days before expiring</div>
        </div>
      </div>
      <ImportOptionsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
export default GridContainer;
