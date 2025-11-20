import React, { useEffect, useRef, useState } from 'react';
import './Notifications.css';
import { useNotifications } from '../../contexts/NotificationContext';
import { timeAgo } from '../../utils/timeAgo';

const BellIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 17H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2C9.23858 2 7 4.23858 7 7V10C7 11.0609 6.57857 12.0783 5.82843 12.8284L5 13.6569V15H19V13.6569L18.1716 12.8284C17.4214 12.0783 17 11.0609 17 10V7C17 4.23858 14.7614 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NotificationsBell: React.FC = () => {
  const { notifications, deleteNotification, clearAllNotifications, loading } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="notifications-root" ref={ref}>
      <button type="button" className="notifications-bell" onClick={() => setOpen((s) => !s)} aria-label="Notifications">
        <BellIcon />
        {unreadCount > 0 && <span className="notifications-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notifications-card">
          <div className="notifications-card__header">
            <div>
              <div className="notifications-card__title">Notifications</div>
              <div className="notifications-card__subtitle">{notifications.length} total</div>
            </div>
            <button className="notifications-clear" onClick={() => clearAllNotifications()}>Clear All</button>
          </div>

          <div className="notifications-card__body">
            {loading && <div className="notifications-empty">Loading...</div>}
            {!loading && notifications.length === 0 && (
              <div className="notifications-empty">
                <div className="notifications-empty__icon"><BellIcon /></div>
                <div className="notifications-empty__title">No notifications yet</div>
              </div>
            )}

            {!loading && notifications.length > 0 && (
              <ul className="notifications-list">
                {notifications.map((n) => (
                  <li key={n._id} className={`notifications-item ${n.isRead ? 'read' : 'unread'}`}>
                    <div className="notifications-item__left">
                      <div className="notifications-item__icon" aria-hidden>
                        {/* simple type-based tint */}
                        <span className={`dot ${n.type === 'WARRANTY_EXPIRED' ? 'dot--danger' : n.type === 'GMAIL_DISCONNECTED' ? 'dot--warning' : 'dot--info'}`} />
                      </div>
                    </div>
                    <div className="notifications-item__content">
                      <div className="notifications-item__title">{n.title}</div>
                      {n.message && <div className="notifications-item__message">{n.message}</div>}
                    </div>
                    <div className="notifications-item__right">
                      <div className="notifications-item__time">{timeAgo(n.createdAt)}</div>
                      <button className="notifications-item__close" onClick={() => deleteNotification(n._id)} aria-label="Delete">×</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
