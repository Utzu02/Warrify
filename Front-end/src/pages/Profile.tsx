import { useEffect, useMemo, useState } from 'react';
import './Profile.css';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchUserProfile, fetchUserWarranties, type UserProfile } from '../api/users';
import { getGmailSettings, connectGmail, disconnectGmail, GmailSettings } from '../api/gmailSettings';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/loadingSpinner/LoadingSpinner';
import GmailSettingsModal from '../components/gmailSettingsModal/GmailSettingsModal';
import Footer from '../components/footer/Footer';
import Button from '../components/button';
import { createBillingPortalSession } from '../api/billing';
import type { SubscriptionStatus } from '../types/billing';

type WarrantySummary = {
  expirationDate?: string | null;
};

type ProfileStats = {
  total: number;
  expiringSoon: number;
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const formatDate = (value?: string | Date | null) => {
  if (!value) return '—';
  const parsed = value instanceof Date ? value : new Date(value);
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

const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  free: 'Free',
  trialing: 'Trialing',
  active: 'Active',
  past_due: 'Past due',
  canceled: 'Canceled',
  incomplete: 'Pending'
};

const getStatusPillModifier = (status: SubscriptionStatus) => {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'profile-status-pill--success';
    case 'past_due':
      return 'profile-status-pill--warning';
    case 'canceled':
    case 'incomplete':
      return 'profile-status-pill--danger';
    default:
      return 'profile-status-pill--neutral';
  }
};

const getIntervalCopy = (interval?: string) => {
  if (interval === 'monthly') return 'Billed monthly';
  if (interval === 'yearly') return 'Billed yearly';
  return 'Free forever';
};

const getRenewalCopy = (billing?: UserProfile['billing']) => {
  if (!billing || billing.planKey === 'free') {
    return 'Free forever—no renewal needed.';
  }

  if (billing.currentPeriodEnd) {
    const prefix = billing.cancelAtPeriodEnd ? 'Cancels' : 'Renews';
    return `${prefix} on ${formatDate(billing.currentPeriodEnd)}`;
  }

  return 'Next renewal will appear once Stripe confirms payment.';
};

const canManageBilling = (billing?: UserProfile['billing'], status?: SubscriptionStatus) => {
  if (!billing || billing.planKey === 'free') return false;
  if (!status || status === 'free' || status === 'canceled') return false;
  return true;
};

const clearQueryParam = (param: string) => {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  params.delete(param);
  const nextQuery = params.toString();
  const nextUrl = nextQuery ? `${window.location.pathname}?${nextQuery}` : window.location.pathname;
  window.history.replaceState({}, document.title, nextUrl);
};

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({ total: 0, expiringSoon: 0 });
  const [gmailSettings, setGmailSettings] = useState<GmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const { showToast } = useToast();

  // Check if redirected from Gmail OAuth
  useEffect(() => {
    if (searchParams.get('gmail') === 'connected') {
      showToast({
        variant: 'success',
        title: 'You are connected',
        message: 'Gmail is linked successfully. You can sync warranties anytime.'
      });
      clearQueryParam('gmail');
    }
  }, [searchParams, showToast]);

  useEffect(() => {
    const checkoutState = searchParams.get('checkout');
    if (!checkoutState) {
      return;
    }

    if (checkoutState === 'success') {
      showToast({
        variant: 'success',
        title: 'Subscription updated',
        message: 'Stripe confirmed your plan is active.'
      });
    } else if (checkoutState === 'cancel') {
      showToast({
        variant: 'info',
        title: 'Checkout canceled',
        message: 'Resume from Pricing whenever you are ready.'
      });
    }

    clearQueryParam('checkout');
  }, [searchParams, showToast]);

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

        setUserData(userPayload);
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

  const friendlyName = formatFullName(userData?.username);
  const memberSince = formatDate(userData?.account_created_at || userData?.createdAt);
  const billing = userData?.billing;
  const subscriptionStatusValue: SubscriptionStatus = billing?.status ?? 'free';
  const subscriptionStatusLabel = SUBSCRIPTION_STATUS_LABELS[subscriptionStatusValue] ?? 'Free';
  const statusPillClass = getStatusPillModifier(subscriptionStatusValue);
  const subscriptionPlanName = billing?.planName || 'Free';
  const subscriptionInterval = getIntervalCopy(billing?.interval);
  const renewalCopy = getRenewalCopy(billing);
  const nextCycleStartRaw = billing?.upcomingPeriodStart || billing?.currentPeriodEnd;
  const upcomingPeriodStart = nextCycleStartRaw ? formatDate(nextCycleStartRaw) : null;
  const currentPeriodStart = billing?.currentPeriodStart ? formatDate(billing.currentPeriodStart) : null;
  const currentPeriodEnd = billing?.currentPeriodEnd ? formatDate(billing.currentPeriodEnd) : null;
  const planStartedAt = billing?.planStartedAt ? formatDate(billing.planStartedAt) : null;
  const heroName = friendlyName === '—' ? userData?.username || 'there' : friendlyName;
  const isGmailConnected = Boolean(gmailSettings?.isConnected);
  const gmailConnectedDate = gmailSettings?.connectedAt ? formatDate(gmailSettings.connectedAt) : null;
  const manageBillingAvailable = canManageBilling(billing, subscriptionStatusValue);

  const handleManagePlan = async () => {
    if (!manageBillingAvailable) {
      navigate('/pricing');
      return;
    }

    try {
      setPortalLoading(true);
      const { url } = await createBillingPortalSession();
      showToast({
        variant: 'info',
        title: 'Opening billing portal',
        message: 'Managing your subscription securely via Stripe.'
      });
      window.location.href = url;
    } catch (portalError) {
      showToast({
        variant: 'error',
        title: 'Unable to open billing portal',
        message:
          portalError instanceof Error
            ? portalError.message
            : 'Please try again or refresh the page.'
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectGmail();
      setGmailSettings((prev) => (prev ? { ...prev, isConnected: false, connectedAt: null } : null));
      showToast({
        variant: 'info',
        title: 'Disconnected',
        message: 'Gmail has been disconnected from your account.'
      });
    } catch (disconnectError) {
      showToast({
        variant: 'error',
        title: 'Disconnect failed',
        message: disconnectError instanceof Error ? disconnectError.message : 'Failed to disconnect Gmail.'
      });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." size="large" fullPage />;
  }

  return (
    <>
      <div className="profile-page">
        <div className="profile-page__inner">
          <div className='profile-page-title'>
            <h1>
              Welcome back, <span className="profile-hero__highlight">{heroName}</span>
            </h1>
            <p className="profile-hero__copy">
              Manage your workspace details, automations, and subscription from one calm, structured view.
            </p>
          </div>

          {error && <div className="profile-error" role="alert">{error}</div>}

          <section className="profile-stats-grid">
            {quickStats.map((stat, index) => (
              <article key={stat.label} className="profile-stat-card">
                <div
                  className={`profile-stat-icon ${index === 0 ? 'profile-stat-icon--indigo' : 'profile-stat-icon--amber'}`}
                  aria-hidden="true"
                >
                  {index === 0 ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  )}
                </div>
                <p className="profile-stat-value">{stat.value}</p>
                <p className="profile-stat-label">{stat.label}</p>
                <p className="profile-stat-hint">{stat.hint}</p>
              </article>
            ))}
            <article className="profile-stat-card">
              <div className="profile-stat-icon profile-stat-icon--hero" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <h3>Start tracking now</h3>
              <p>Upload invoices or add warranties from the dashboard whenever you need.</p>
              <Button to="/dashboard" variant="primary" size="medium">
                Add a warranty
              </Button>
            </article>
          </section>

          <section className="profile-main-grid">
            <article className="profile-card profile-details-card">
              <header className="profile-card__header">
                <div>
                  <p className="profile-eyebrow">Account</p>
                  <h2>Personal details</h2>
                </div>
                <Button to="/change-password" variant="ghost" size="small">
                  Update password
                </Button>
              </header>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span className="profile-info-label">Username</span>
                  <span className="profile-info-value">{userData?.username || '—'}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Full name</span>
                  <span className="profile-info-value">{friendlyName}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Email</span>
                  <span className="profile-info-value">{userData?.email || '—'}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Member since</span>
                  <span className="profile-info-value">{memberSince}</span>
                </div>
              </div>
              <div className="profile-card__footer">
                <p>
                  Need to update ownership or company data?{' '}
                  <Link to="/contact" className="profile-inline-link">
                    Reach our team
                  </Link>
                  .
                </p>
              </div>
            </article>

            <article className="profile-card profile-subscription-card">
              <header className="profile-card__header">
                <div>
                  <p className="profile-eyebrow">Billing</p>
                  <h2>Subscription</h2>
                </div>
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleManagePlan}
                  loading={portalLoading}
                >
                  {manageBillingAvailable ? 'Manage billing' : 'Choose plan'}
                </Button>
              </header>
              <div className="profile-subscription-highlight">
                <div className="profile-subscription-status">
                  <span className={`profile-status-pill ${statusPillClass}`}>
                    {subscriptionStatusLabel}
                  </span>
                  <p className="profile-subscription-interval">{subscriptionInterval}</p>
                </div>
                <h3>{subscriptionPlanName} plan</h3>
                <p className="profile-subscription-renewal">{renewalCopy}</p>
                {currentPeriodStart && currentPeriodEnd && (
                  <p className="profile-subscription-cycle">
                    Current cycle: {currentPeriodStart} → {currentPeriodEnd}
                  </p>
                )}
                {planStartedAt && (
                  <p className="profile-subscription-start">Plan started: {planStartedAt}</p>
                )}
                {upcomingPeriodStart && (
                  <p className="profile-subscription-upcoming">Next cycle starts: {upcomingPeriodStart}</p>
                )}
                <p className="profile-subscription-meta">Member since: {memberSince}</p>
              </div>
              <p className="profile-card__subtitle">What's included</p>
              <ul className="profile-feature-list">
                <li>AI-powered warranty parsing</li>
                <li>Priority support</li>
                <li>10 GB secure storage</li>
                <li>Automated expiry reminders</li>
              </ul>
            </article>

            <article className="profile-card profile-gmail-card">
              <header className="profile-card__header">
                <div>
                  <p className="profile-eyebrow">Automations</p>
                  <h2>Gmail integration</h2>
                </div>
                {isGmailConnected ? (
                  <div className="profile-card__actions">
                    <Button variant="secondary" size="small" onClick={() => setShowSettingsModal(true)}>
                      Configure
                    </Button>
                    <Button variant="ghost" size="small" onClick={handleDisconnect}>
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button variant="primary" size="small" onClick={() => connectGmail()}>
                    Connect Gmail
                  </Button>
                )}
              </header>
              {isGmailConnected ? (
                <>
                  <div className="profile-gmail-status">
                    <span className="profile-status-pill profile-status-pill--success">Connected</span>
                    <p>{gmailConnectedDate ? `Connected on ${gmailConnectedDate}` : 'Ready to fetch warranties.'}</p>
                  </div>
                  <div className="profile-info-grid profile-info-grid--tertiary">
                    <div className="profile-info-item">
                      <span className="profile-info-label">Max results</span>
                      <span className="profile-info-value">{gmailSettings?.defaultSettings?.maxResults ?? '—'}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Start date</span>
                      <span className="profile-info-value">
                        {gmailSettings?.defaultSettings?.startDate
                          ? formatDate(gmailSettings.defaultSettings.startDate)
                          : 'Not set'}
                      </span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">End date</span>
                      <span className="profile-info-value">
                        {gmailSettings?.defaultSettings?.endDate
                          ? formatDate(gmailSettings.defaultSettings.endDate)
                          : 'Not set'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="profile-gmail-empty">
                  <p>Connect your Gmail account to automatically scan for warranty documents.</p>
                  <ul className="profile-feature-list">
                    <li>Automatic warranty detection from emails</li>
                    <li>Secure OAuth2 authentication</li>
                    <li>Read-only access to attachments</li>
                  </ul>
                </div>
              )}
            </article>
          </section>
        </div>

        <GmailSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          initialSettings={gmailSettings}
          onSave={(updatedSettings) => {
            setGmailSettings(updatedSettings);
            showToast({
              variant: 'success',
              title: 'Settings saved',
              message: 'Gmail preferences updated successfully.'
            });
          }}
        />
      </div>
      <Footer />
    </>
  );
};

export default Profile;
