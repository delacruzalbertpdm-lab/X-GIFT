import React from 'react';
import { ListChecks, Dice5, LogOut } from 'lucide-react';

export default function Navbar({ user, activeTab, setActiveTab, onLogout }) {
  return (
    <header className="navbar">
      <div className="brand" onClick={() => setActiveTab(user?.is_staff ? 'admin' : 'wishlist')}>
        <div className="brand-icon">
          <img src="/hamster_hero.png" alt="Hamster Logo" className="brand-logo-img" />
        </div>
        <div className="brand-text-wrap">
          <span className="brand-title">LA Familia De Hamster Corporation</span>
        </div>
      </div>

      <nav className="nav-center">
        {!user?.is_staff && (
          <>
            <button
              className={`nav-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              <ListChecks size={18} />
              <span>My Wishlist</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'draw' ? 'active' : ''}`}
              onClick={() => setActiveTab('draw')}
            >
              <Dice5 size={18} />
              <span>Lucky Draw</span>
            </button>
          </>
        )}

      </nav>

      <div className="nav-right">
        {user && !user.is_staff && (
          <div className="user-badge-chip">
            <span className="user-lucky-tag">#{user.assigned_number}</span>
            <span className="user-name-text">{user.display_name || user.username}</span>
            {user.quiz_completed && (
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: user.is_verified_true_hamster ? '#ecfdf5' : '#fef2f2',
                  color: user.is_verified_true_hamster ? '#065f46' : '#991b1b',
                  border: `1px solid ${user.is_verified_true_hamster ? '#a7f3d0' : '#fecdd3'}`,
                }}
              >
                {user.is_verified_true_hamster ? '👑 True Hamster' : '❌ Not True Hamster'}
              </span>
            )}
          </div>
        )}

        <button className="btn-ghost-logout" onClick={onLogout} title="Log Out">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
