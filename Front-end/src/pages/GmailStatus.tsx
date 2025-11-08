import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { BASE_URL } from '../config';
import { fetchGmailEmails } from '../api/gmail';
import './styles/GmailStatus.css';

interface Attachment {
  filename: string;
  size: number;
  attachmentId?: string;
}

interface ProcessedEmail {
  id: string;
  subject: string;
  from: string;
  date: string;
  attachments: Attachment[];
}

const statusSteps = [
  'Connecting to Gmail...',
  'Looking for PDF attachments...',
  'Checking if each document is a warranty...',
  'Almost done...'
];

const GmailStatus = () => {
  const [documents, setDocuments] = useState<ProcessedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState(statusSteps[0]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!loading) {
      return;
    }

    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % statusSteps.length;
      setStatusMessage(statusSteps[index]);
    }, 2500);

    return () => clearInterval(intervalId);
  }, [loading]);

  useEffect(() => {
    let isMounted = true;

    async function loadEmails() {
      try {
        setLoading(true);
        setError(null);

        const userId = Cookies.get('UID');
        if (!userId) {
          setError('Please log in to run the Gmail scan.');
          setLoading(false);
          return;
        }

        const payload = await fetchGmailEmails<{ total: number; documents: ProcessedEmail[] }>();

        if (!isMounted) {
          return;
        }

        const now = new Date();
        setDocuments(payload.documents || []);
        setLastUpdated(now);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unexpected error.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEmails();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalAttachments = useMemo(() => {
    return documents.reduce((sum, doc) => sum + doc.attachments.length, 0);
  }, [documents]);

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleRetry = () => {
    window.location.href = `${BASE_URL}/auth/google`;
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
            <span className="spinner" />
            <p>{statusMessage}</p>
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
