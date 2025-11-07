import { useMemo, useState } from 'react';
import './styles/Profile.css';
import { Link } from 'react-router-dom';

type UserProfile = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  registrationDate: string;
  subscription: {
    type: 'Gratuit' | 'Premium' | 'Enterprise';
    expires: string;
  };
};

const Profile = () => {
  const [userData] = useState<UserProfile>({
    id: 12345,
    username: 'andrei.popescu',
    fullName: 'Andrei Popescu',
    email: 'andrei.popescu@example.com',
    registrationDate: '15 Martie 2023',
    subscription: {
      type: 'Premium',
      expires: '15 Decembrie 2024',
    },
  });

  const quickStats = useMemo(
    () => [
      { label: 'Warranties tracked', value: '248', hint: '+12 this week' },
      { label: 'Expiring soon', value: '8', hint: 'Reminders scheduled' },
      { label: 'Storage used', value: '3.2 GB', hint: 'of 10 GB included' },
    ],
    []
  );

  return (
    <div className="profile-page">
      <section className="profile-hero card">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Hello, @{userData.username}!</h1>
          <p className="hero-copy">You’re in control of your workspace details, security, and subscription.</p>
        </div>
        <div className="avatar-circle">{userData.fullName.charAt(0)}</div>
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
              <span className="value">@{userData.username}</span>
            </div>
            <div className="info-item">
              <span className="label">Full name</span>
              <span className="value">{userData.fullName}</span>
            </div>
            <div className="info-item">
              <span className="label">Email</span>
              <span className="value">{userData.email}</span>
            </div>
            <div className="info-item">
              <span className="label">User ID</span>
              <span className="value">#{userData.id}</span>
            </div>
            <div className="info-item">
              <span className="label">Member since</span>
              <span className="value">{userData.registrationDate}</span>
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
              <p className="pill">Active</p>
              <h3>{userData.subscription.type} plan</h3>
              <p className="expiry-date">Expiră: {userData.subscription.expires}</p>
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
