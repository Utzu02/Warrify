import { useEffect, useMemo, useState } from 'react';
import './styles/Profile.css';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { fetchUserProfile, fetchUserWarranties } from '../api/users';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';

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
  const [userData, setUserData] = useState<ApiUser | null>(null);
  const [stats, setStats] = useState<ProfileStats>({ total: 0, expiringSoon: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = Cookies.get('UID');
    if (!userId) {
      setError('Please log in to view your profile.');
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadProfile = async () => {
      try {
        setError(null);
        const [userPayload, warrantiesPayload] = await Promise.all([
          fetchUserProfile(userId, { signal: controller.signal }),
          fetchUserWarranties(userId, { signal: controller.signal })
        ]);

        setUserData(userPayload as ApiUser);
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
  }, []);

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
    <div className="profile-page">
      <section className="profile-hero card">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Hello, {userData?.username || 'there'}!</h1>
          <p className="hero-copy">You’re in control of your workspace details, security, and subscription.</p>
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
            <h2>Subscription</h2>
            <Link to="/pricing" className="button buttoninvert">
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
    </div>
  );
};

export default Profile;
