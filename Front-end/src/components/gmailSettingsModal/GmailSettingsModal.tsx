import { useState, useEffect } from 'react';
import { GmailSettings, updateGmailSettings } from '../../api/gmailSettings';
import Button from '../button';
import BaseModal from '../modal/BaseModal';
import '../gmailConfigModal/GmailConfigModal.css';

interface GmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSettings: GmailSettings | null;
  onSave: (settings: GmailSettings) => void;
}

const GmailSettingsModal = ({ isOpen, onClose, initialSettings, onSave }: GmailSettingsModalProps) => {
  const [maxResults, setMaxResults] = useState(50);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSettings && isOpen) {
      setMaxResults(initialSettings.defaultSettings.maxResults);
      setStartDate(initialSettings.defaultSettings.startDate || '');
      setEndDate(initialSettings.defaultSettings.endDate || '');
      setError(null);
      setDateError(null);
    }
  }, [initialSettings, isOpen]);

  const getTodayString = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const validateDates = (s: string, e: string) => {
    const today = getTodayString();
    if (s && s > today) return 'Start date cannot be later than today.';
    if (e && e > today) return 'End date cannot be later than today.';
    if (s && e && s > e) return 'Start date cannot be after end date.';
    return null;
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateGmailSettings({
        maxResults,
        startDate: startDate || null,
        endDate: endDate || null
      });

      onSave({
        ...initialSettings!,
        defaultSettings: response.settings
      });
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateDates(startDate, endDate);
    if (validation) {
      setDateError(validation);
      return;
    }

    await handleSave();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Gmail scan preferences"
      description={<p className="gmail-modal-description">Configure your default settings for scanning Gmail for warranty documents.</p>}
      backdropClassName="gmail-modal-backdrop"
      contentClassName="gmail-modal-content"
    >
      <form className="gmail-modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="modal-max-results">
              Number of documents
              <span
                className="tooltip-icon"
                title="Maximum number of emails with PDF attachments to scan (1-100)"
              >
                ⓘ
              </span>
            </label>
            <input
              type="number"
              id="modal-max-results"
              min="1"
              max="100"
              value={maxResults}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= 100) {
                  setMaxResults(value);
                }
              }}
              disabled={loading}
            />
            <span className="form-hint">Choose up to 100 documents per scan.</span>
          </div>

          <div className="date-row">
            <div className="form-group">
              <label htmlFor="modal-start-date">Start date (optional)</label>
              <input
                type="date"
                id="modal-start-date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateError(validateDates(e.target.value, endDate));
                }}
                disabled={loading}
                max={getTodayString()}
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-end-date">End date (optional)</label>
              <input
                type="date"
                id="modal-end-date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDateError(validateDates(startDate, e.target.value));
                }}
                disabled={loading}
                max={getTodayString()}
              />
            </div>
          </div>

          {dateError && <div className="form-error">{dateError}</div>}

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <div className="action-buttons">
              <Button
                type="button"
                variant="ghost"
                size="medium"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="medium"
                disabled={loading || Boolean(dateError)}
                loading={loading}
              >
                {loading ? 'Saving...' : 'Save preferences'}
              </Button>
            </div>
          </div>
      </form>
    </BaseModal>
  );
};

export default GmailSettingsModal;
