import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getGmailSettings } from '../../api/gmailSettings';
import { saveGmailOptions } from '../../api/gmail';
import { BASE_URL } from '../../config';
import Button from '../button';
import './GmailConfigModal.css';

interface GmailConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MIN_RESULTS = 1;
const MAX_RESULTS = 100;

const GmailConfigModal = ({ isOpen, onClose }: GmailConfigModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [maxResults, setMaxResults] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDefaults, setLoadingDefaults] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);

  // Check Gmail connection status when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadDefaultSettings();
    }
  }, [isOpen, user]);

  // Set default dates: today → 1 week from now
  useEffect(() => {
    if (isOpen && !startDate && !endDate) {
      const today = new Date();
      const oneWeekLater = new Date(today);
      oneWeekLater.setDate(today.getDate() + 7);
      
      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(oneWeekLater.toISOString().split('T')[0]);
    }
  }, [isOpen, startDate, endDate]);

  const loadDefaultSettings = async () => {
    if (!user) return;
    
    try {
      setLoadingDefaults(true);
      const settings = await getGmailSettings();
      
      // Check if Gmail is connected
      setIsGmailConnected(settings.isConnected || false);
      
      if (settings.defaultSettings) {
        setMaxResults(settings.defaultSettings.maxResults || 10);
        setStartDate(settings.defaultSettings.startDate || '');
        setEndDate(settings.defaultSettings.endDate || '');
      }
    } catch (err) {
      console.error('Failed to load default settings:', err);
    } finally {
      setLoadingDefaults(false);
    }
  };

  const validate = () => {
    if (Number.isNaN(maxResults) || maxResults < MIN_RESULTS || maxResults > MAX_RESULTS) {
      return `Please choose between ${MIN_RESULTS} and ${MAX_RESULTS} documents to scan.`;
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        return 'Start date must be before end date.';
      }
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setError(null);
      setLoading(true);
      await saveGmailOptions({
        maxResults,
        startDate: startDate || null,
        endDate: endDate || null
      });
      
      // If already connected to Gmail, go directly to scanning page
      if (isGmailConnected) {
        onClose();
        navigate('/gmail-status');
      } else {
        // Otherwise, redirect to Google OAuth login
        window.location.href = `${BASE_URL}/auth/google`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="gmail-modal-backdrop" onClick={handleBackdropClick}>
      <div className="gmail-modal-content">
        <button className="gmail-modal-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>
        
        <h2>Import warranties from Gmail</h2>
        <p className="gmail-modal-description">
          Configure how many documents you want to scan and the date range.
        </p>

        <form onSubmit={handleSubmit} className="gmail-modal-form">
          <div className="form-group">
            <label htmlFor="max-results">
              Number of documents to scan
              <span 
                className="tooltip-icon" 
                title="Maximum number of emails with PDF attachments to scan. Higher numbers may take longer to process."
              >
                ⓘ
              </span>
            </label>
            <input
              id="max-results"
              type="number"
              min={MIN_RESULTS}
              max={MAX_RESULTS}
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
            />
            <span className="form-hint">Max {MAX_RESULTS} PDFs per scan</span>
          </div>

          <div className="date-row">
            <div className="form-group">
              <label htmlFor="start-date">Start date (optional)</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="end-date">End date (optional)</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <Button
              type="button" 
              variant="secondary"
              size="medium"
              onClick={loadDefaultSettings}
              disabled={loading || loadingDefaults}
              loading={loadingDefaults}
            >
              {loadingDefaults ? 'Loading...' : 'Apply preferences'}
            </Button>
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
              <Button type="submit" variant="primary" size="medium" disabled={loading} loading={loading}>
                {loading ? 'Starting…' : 'Start Gmail import'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GmailConfigModal;
