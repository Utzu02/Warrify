import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BASE_URL } from '../config';
import { getGmailSettings } from '../api/gmailSettings';
import { useGmailScan } from '../hooks/useGmailScan';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import './GmailStatus.css';

interface Attachment {
  filename: string;
  size: number;
  attachmentId?: string;
}

const GmailStatus = () => {
  const { user } = useAuth();
  const {
    documents,
    loading,
    error,
    statusMessage,
    progress,
    lastUpdated,
    totalAttachments
  } = useGmailScan(user?.id);

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleRetry = async () => {
    try {
      // Check if Gmail is already connected
      const settings = await getGmailSettings();
      
      if (settings.isConnected) {
        // Already connected, reload the page to restart the scan
        window.location.reload();
      } else {
        // Not connected, redirect to Google OAuth
        window.location.href = `${BASE_URL}/auth/google`;
      }
    } catch (err) {
      console.error('Failed to check Gmail connection:', err);
      // If check fails, assume need to reconnect
      window.location.href = `${BASE_URL}/auth/google`;
    }
  };

  const buildDownloadUrl = (messageId: string, attachment: Attachment) => {
    if (!attachment.attachmentId) return null;
    const safeName = encodeURIComponent(attachment.filename || 'document.pdf');
    return `${BASE_URL}/api/emails/${messageId}/attachments/${attachment.attachmentId}?filename=${safeName}`;
  };

  return (
    <div className="gmail-status-page">
      <div className="status-card">
        <h1>Gmail import status</h1>
        <p className="status-subtitle">
          We pull the most recent warranty PDFs directly from your inbox and analyze them for you.
        </p>

        {loading && (
          <div className="status-loading">
            <LoadingSpinner message={statusMessage} size="large" />
            {progress && progress.total > 0 && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <p className="progress-text">
                  {progress.current} / {progress.total} emails processed
                </p>
              </div>
            )}
          </div>
        )}

        {!loading && error && (
          <div className="status-error">
            <p>{error}</p>
            <button className="button buttoninvert" onClick={handleRetry}>
              Connect Gmail again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="status-summary">
            <div>
              <span className="status-number">{documents.length}</span>
              <span className="status-label">emails with warranties</span>
            </div>
            <div>
              <span className="status-number">{totalAttachments}</span>
              <span className="status-label">PDF attachments</span>
            </div>
            <div>
              <span className="status-number">
                {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
              </span>
              <span className="status-label">Last updated</span>
            </div>
          </div>
        )}

        <div className="status-actions">
          <button className="button" onClick={handleRetry}>
            Re-run Gmail scan
          </button>
          <Link to="/dashboard" className="button buttoninvert">
            Back to dashboard
          </Link>
        </div>
      </div>

      {!loading && !error && (
        <div className="documents-area">
          {documents.length === 0 && (
            <div className="empty-state">
              <p>No warranties detected in the last scan.</p>
              <p>Try uploading a PDF manually or run Gmail sync again.</p>
            </div>
          )}

          {documents.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="document-header">
                <div>
                  <p className="document-subject">{doc.subject || 'Unknown subject'}</p>
                  <p className="document-meta">
                    <span>{doc.from || 'Unknown sender'}</span> · <span>{doc.date || 'Unknown date'}</span>
                  </p>
                </div>
                <span className="chip">{doc.attachments.length} attachments</span>
              </div>
              <ul className="attachment-list">
                {doc.attachments.map((attachment, index) => (
                  <li key={`${doc.id}-${attachment.filename}-${index}`}>
                    <div className="attachment-info">
                      <span className="attachment-name">{attachment.filename}</span>
                      <span className="attachment-size">{formatSize(attachment.size)}</span>
                    </div>
                    {attachment.attachmentId ? (
                      <a
                        className="attachment-download"
                        href={buildDownloadUrl(doc.id, attachment) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download PDF
                      </a>
                    ) : (
                      <span className="attachment-download disabled">Unavailable</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GmailStatus;
