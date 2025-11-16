import { useState, useEffect } from 'react';
import { GmailSettings, updateGmailSettings } from '../../api/gmailSettings';
import Button from '../button';
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

  useEffect(() => {
    if (initialSettings && isOpen) {
      setMaxResults(initialSettings.defaultSettings.maxResults);
      setStartDate(initialSettings.defaultSettings.startDate || '');
      setEndDate(initialSettings.defaultSettings.endDate || '');
      setError(null);
    }
  }, [initialSettings, isOpen]);

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

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleSave();
  };

  if (!isOpen) return null;

  return (
    <div className="gmail-modal-backdrop" onClick={handleBackdropClick}>
      <div className="gmail-modal-content">
        <button className="gmail-modal-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>

        <h2>Gmail scan preferences</h2>
        <p className="gmail-modal-description">
          Configure your default settings for scanning Gmail for warranty documents.
        </p>

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
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-end-date">End date (optional)</label>
              <input
                type="date"
                id="modal-end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

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
                disabled={loading}
                loading={loading}
              >
                {loading ? 'Saving...' : 'Save preferences'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GmailSettingsModal;
