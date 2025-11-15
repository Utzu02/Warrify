import { useEffect, useMemo, useState } from 'react';
import './Profile.css';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchUserProfile, fetchUserWarranties } from '../api/users';
import { getGmailSettings, connectGmail, disconnectGmail, GmailSettings } from '../api/gmailSettings';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/loadingSpinner/LoadingSpinner';
import GmailSettingsModal from '../components/gmailSettingsModal/GmailSettingsModal';
import Footer from '../components/footer/Footer';

type ApiUser = {
  _id: string;
  username: string;
  email: string;
  terms?: boolean;
  createdAt?: string;
  account_created_at?: string;
};

type WarrantySummary = {
  expirationDate?: string | null;
};

type ProfileStats = {
  total: number;
  expiringSoon: number;
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const formatDate = (value?: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatFullName = (username?: string) => {
  if (!username) return '—';
  return username
    .replace(/[._-]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const Profile = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useState<ApiUser | null>(null);
  const [stats, setStats] = useState<ProfileStats>({ total: 0, expiringSoon: 0 });
  const [gmailSettings, setGmailSettings] = useState<GmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGmailSuccess, setShowGmailSuccess] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Check if redirected from Gmail OAuth
  useEffect(() => {
    if (searchParams.get('gmail') === 'connected') {
      setShowGmailSuccess(true);
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      // Hide success message after 5 seconds
      setTimeout(() => setShowGmailSuccess(false), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    // Get user from AuthContext
    if (!user) {
      setError('Please log in to view your profile.');
      setLoading(false);
      return;
    }

    const userId = user.id;

    const controller = new AbortController();

    const loadProfile = async () => {
      try {
        setError(null);
        const [userPayload, warrantiesPayload, gmailPayload] = await Promise.all([
          fetchUserProfile(userId, { signal: controller.signal }),
          fetchUserWarranties(userId, { signal: controller.signal }),
          getGmailSettings()
        ]);

        setUserData(userPayload as ApiUser);
        setGmailSettings(gmailPayload);
        
        const items: WarrantySummary[] = (warrantiesPayload.items as WarrantySummary[]) || [];
        const total = items.length;
        const now = Date.now();
        const expiringSoon = items.reduce((count, item) => {
          if (!item.expirationDate) {
            return count;
          }
          const expDate = new Date(item.expirationDate);
          if (Number.isNaN(expDate.getTime())) {
            return count;
          }
          const diff = expDate.getTime() - now;
          return diff <= SEVEN_DAYS_MS ? count + 1 : count;
        }, 0);

        setStats({ total, expiringSoon });
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unexpected error.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => controller.abort();
  }, [user]);

  const quickStats = useMemo(
    () => [
      {
        label: 'Warranties tracked',
        value: stats.total.toString(),
        hint: stats.total === 1 ? 'Warranty saved' : 'Warranties saved'
      },
      {
        label: 'Expiring soon',
        value: stats.expiringSoon.toString(),
        hint: 'Due within 7 days or already expired'
      }
    ],
    [stats]
  );

  const avatarInitial = userData?.username?.charAt(0)?.toUpperCase() || 'A';
  const friendlyName = formatFullName(userData?.username);
  const memberSince = formatDate(userData?.account_created_at || userData?.createdAt);
  const subscriptionType = userData?.terms ? 'Premium' : 'Free';
  const subscriptionStatus = userData?.terms ? 'Active' : 'Trial';

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." size="large" fullPage />;
  }

  return (
    <>
    <div className="profile-page">
      {showGmailSuccess && (
        <div className="gmail-success-banner">
          ✅ Gmail connected successfully! Your default settings are ready to use.
        </div>
      )}
      
      <section className="profile-hero card">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Hello, {userData?.username || 'there'}!</h1>
          <p className="hero-copy">You're in control of your workspace details, security, and subscription.</p>
          {error && <p className="error-state">{error}</p>}
        </div>
        <div className="avatar-circle">{avatarInitial}</div>
      </section>

      <section className="profile-stats">
        {quickStats.map((stat) => (
          <div key={stat.label} className="stat-pill">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
            <span className="stat-hint">{stat.hint}</span>
          </div>
        ))}
      </section>

      <section className="profile-sections">
        <div className="card">
          <header className="section-header">
            <h2>Personal details</h2>
            <Link to="/change-password" className="ghost-button">
              Update password
            </Link>
          </header>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Username</span>
              <span className="value">{userData?.username || '—'}</span>
            </div>
            <div className="info-item">
              <span className="label">Full name</span>
              <span className="value">{friendlyName}</span>
            </div>
            <div className="info-item">
              <span className="label">Email</span>
              <span className="value">{userData?.email || '—'}</span>
            </div>
            <div className="info-item">
              <span className="label">Member since</span>
              <span className="value">{memberSince}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <header className="section-header">
            <h2>Gmail Integration</h2>
            {gmailSettings?.isConnected ? (
              <div className="header-actions">
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="icon-button"
                  title="Configure settings"
                  aria-label="Configure Gmail settings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </button>
                <button
                  onClick={async () => {
                    try {
                      await disconnectGmail();
                      setGmailSettings(prev => prev ? { ...prev, isConnected: false, connectedAt: null } : null);
                    } catch (error) {
                      alert('Failed to disconnect Gmail');
                    }
                  }}
                  className="ghost-button"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button onClick={connectGmail} className="button button-invert">
                Connect Gmail
              </button>
            )}
          </header>
          {gmailSettings?.isConnected ? (
            <div className="gmail-settings">
              <div className="connection-status">
                <p className="pill-profile">Connected</p>
                <p className="connection-info">
                  Connected on {formatDate(gmailSettings.connectedAt || undefined)}
                </p>
              </div>
              <div className="settings-summary">
                <h3>Current Preferences</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Max Results</span>
                    <span className="value">{gmailSettings.defaultSettings.maxResults}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Start Date</span>
                    <span className="value">{gmailSettings.defaultSettings.startDate ? formatDate(gmailSettings.defaultSettings.startDate) : 'Not set'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">End Date</span>
                    <span className="value">{gmailSettings.defaultSettings.endDate ? formatDate(gmailSettings.defaultSettings.endDate) : 'Not set'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="gmail-disconnected">
              <p>Connect your Gmail account to automatically scan for warranty documents.</p>
              <ul className="feature-list">
                <li>Automatic warranty detection from emails</li>
                <li>Secure OAuth2 authentication</li>
                <li>Read-only access to attachments</li>
              </ul>
            </div>
          )}
        </div>

        <div className="card">
          <header className="section-header">
            <h2>Subscription</h2>
            <Link to="/pricing" className="button button-invert">
              Manage plan
            </Link>
          </header>
          <div className="subscription-card">
            <div>
              <p className="pill-profile">{subscriptionStatus}</p>
              <h3>{subscriptionType} plan</h3>
              <p className="expiry-date">Member since: {memberSince}</p>
            </div>
            <ul className="feature-list">
              <li>AI-powered warranty parsing</li>
              <li>Priority support</li>
              <li>10 GB secure storage</li>
            </ul>
          </div>
        </div>
      </section>

      <GmailSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        initialSettings={gmailSettings}
        onSave={(updatedSettings) => {
          setGmailSettings(updatedSettings);
          setShowGmailSuccess(true);
          setTimeout(() => setShowGmailSuccess(false), 3000);
        }}
      />
    </div>
    <Footer />
    </>
  );
};

export default Profile;
