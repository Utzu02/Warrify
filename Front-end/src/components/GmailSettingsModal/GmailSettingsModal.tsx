import { useState, useEffect } from 'react';
import { GmailSettings, updateGmailSettings } from '../../api/gmailSettings';
import './GmailSettingsModal.css';

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

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="gmail-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Gmail Scan Preferences</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Configure your default settings for scanning Gmail for warranty documents.
          </p>

          <div className="form-group">
            <label htmlFor="modal-max-results">
              Number of documents
              <span className="tooltip" title="Maximum number of emails with PDF attachments to scan (1-100)">
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
          </div>

          <div className="form-group">
            <label htmlFor="modal-start-date">Start Date (optional)</label>
            <input
              type="date"
              id="modal-start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-end-date">End Date (optional)</label>
            <input
              type="date"
              id="modal-end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <div className="form-error">{error}</div>}
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="button button-ghost" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="button button-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GmailSettingsModal;
