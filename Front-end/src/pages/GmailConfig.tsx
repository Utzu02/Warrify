import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveGmailOptions } from '../api/gmail';
import { BASE_URL } from '../config';
import Button from '../components/button';
import './GmailConfig.css';

const MIN_RESULTS = 1;
const MAX_RESULTS = 100;

const GmailConfig = () => {
  const navigate = useNavigate();
  const [maxResults, setMaxResults] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      window.location.href = `${BASE_URL}/auth/google`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gmail-config-page">
      <div className="gmail-config-card">
        <h1>Import warranties from Gmail</h1>
        <p>Tell us how many documents you want to scan and the date range you care about.</p>
        <form onSubmit={handleSubmit} className="gmail-config-form">
          <label>
            Number of documents to scan
            <input
              type="number"
              min={MIN_RESULTS}
              max={MAX_RESULTS}
              value={maxResults}
              onChange={(event) => setMaxResults(Number(event.target.value))}
            />
          </label>
          <div className="date-row">
            <label>
              Start date
              <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </label>
            <label>
              End date
              <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </label>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <Button type="button" variant="secondary" size="medium" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="medium" disabled={loading} loading={loading}>
              {loading ? 'Starting…' : 'Start Gmail import'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GmailConfig;
