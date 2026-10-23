import React from 'react';
import { Gift, Sparkles, ListChecks, Dice5, ShieldCheck, LogOut } from 'lucide-react';

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

        {user?.is_staff && (
          <button
            className={`nav-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <ShieldCheck size={18} />
            <span>Admin Monitoring Center</span>
          </button>
        )}
      </nav>

      <div className="nav-right">
        {user && (
          <div className="user-badge-chip">
            {user.is_staff ? (
              <>
                <span className="user-lucky-tag admin-tag">👑 Admin</span>
                <span className="user-name-text">{user.display_name || user.username} (Monitoring)</span>
              </>
            ) : (
              <>
                <span className="user-lucky-tag">#{user.assigned_number}</span>
                <span className="user-name-text">{user.display_name || user.username}</span>
              </>
            )}
          </div>
        )}

        <button className="btn-ghost-logout" onClick={onLogout} title="Log Out">
          <LogOut size={16} />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
}
