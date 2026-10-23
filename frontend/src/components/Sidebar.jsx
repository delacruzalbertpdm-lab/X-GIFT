import React from 'react';
import {
  ListChecks,
  Dice5,
  LogOut,
  Users,
  HelpCircle,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function Sidebar({
  user,
  activeTab,
  setActiveTab,
  wishlistCount = 0,
  onLogout,
  mobileOpen,
  setMobileOpen,
}) {
  const handleNavClick = (tab) => {
    setActiveTab(tab);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Top Header Bar (Shown only on small screens) */}
      <header className="mobile-header-bar">
        <button
          className="btn-mobile-menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="mobile-header-brand" onClick={() => handleNavClick(user?.is_staff ? 'admin_participants' : 'wishlist')}>
          <div className="brand-icon" style={{ width: '32px', height: '32px' }}>
            <img src="/hamster_hero.png" alt="Hamster Logo" className="brand-logo-img" />
          </div>
          <span className="brand-title" style={{ fontSize: '0.98rem' }}>LA Familia De Hamster</span>
        </div>

        {user && (
          <div className="mobile-header-badge">
            {user.is_staff ? (
              <span className="user-lucky-tag" style={{ background: 'var(--primary-rose)', fontSize: '0.74rem', padding: '3px 8px' }}>
                👑 Admin
              </span>
            ) : (
              <span className="user-lucky-tag" style={{ fontSize: '0.74rem', padding: '3px 8px' }}>
                #{user.assigned_number}
              </span>
            )}
          </div>
        )}
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Sidebar (Desktop fixed left / Mobile slide-out drawer) */}
      <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Top: Brand info & Close button */}
        <div className="sidebar-top">
          <div className="sidebar-brand" onClick={() => handleNavClick(user?.is_staff ? 'admin_participants' : 'wishlist')}>
            <div className="brand-icon">
              <img src="/hamster_hero.png" alt="Hamster Logo" className="brand-logo-img" />
            </div>
            <div className="sidebar-brand-text">
              <div className="brand-title">LA Familia De Hamster</div>
              <div className="brand-subtitle">Corporate Gift Exchange</div>
            </div>
          </div>

          <button
            className="btn-sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="sidebar-user-card">
            <div className="sidebar-user-header">
              {user.is_staff ? (
                <div className="sidebar-avatar-circle admin-avatar">👑</div>
              ) : (
                <div className="sidebar-avatar-circle">
                  #{user.assigned_number}
                </div>
              )}
              <div className="sidebar-user-details">
                <div className="sidebar-user-name">
                  {user.display_name || user.first_name || user.username}
                </div>
                <div className="sidebar-user-handle">
                  @{user.username} {user.is_staff && '• Admin'}
                </div>
              </div>
            </div>

            {/* Verification status pill */}
            {!user.is_staff && user.quiz_completed && (
              <div style={{ marginTop: '10px' }}>
                {user.is_verified_true_hamster ? (
                  <span className="sidebar-status-tag verified">
                    <CheckCircle2 size={13} />
                    <span>👑 True Hamster ({user.quiz_score}/{user.quiz_total})</span>
                  </span>
                ) : (
                  <span className="sidebar-status-tag unverified">
                    <AlertTriangle size={13} />
                    <span>❌ Not True Hamster ({user.quiz_score}/{user.quiz_total})</span>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-section-title">
            {user?.is_staff ? 'ADMIN MONITORING' : 'MAIN NAVIGATION'}
          </div>

          {!user?.is_staff ? (
            <>
              <button
                className={`sidebar-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => handleNavClick('wishlist')}
              >
                <div className="sidebar-nav-item-icon">
                  <ListChecks size={19} />
                </div>
                <span className="sidebar-nav-item-label">My Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="sidebar-nav-count-badge">{wishlistCount}</span>
                )}
              </button>

              <button
                className={`sidebar-nav-item ${activeTab === 'draw' ? 'active' : ''}`}
                onClick={() => handleNavClick('draw')}
              >
                <div className="sidebar-nav-item-icon">
                  <Dice5 size={19} />
                </div>
                <span className="sidebar-nav-item-label">Lucky Draw</span>
                <span className="sidebar-nav-sparkle-pill">🎡 Spin</span>
              </button>
            </>
          ) : (
            <>
              <button
                className={`sidebar-nav-item ${activeTab === 'admin_participants' || activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin_participants')}
              >
                <div className="sidebar-nav-item-icon">
                  <Users size={19} />
                </div>
                <span className="sidebar-nav-item-label">Participants & Matches</span>
              </button>

              <button
                className={`sidebar-nav-item ${activeTab === 'admin_questions' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin_questions')}
              >
                <div className="sidebar-nav-item-icon">
                  <HelpCircle size={19} />
                </div>
                <span className="sidebar-nav-item-label">Hamster Verification Questions</span>
                <span className="sidebar-nav-sparkle-pill">🐹 Quiz</span>
              </button>
            </>
          )}
        </nav>

        {/* Bottom: Logout */}
        <div className="sidebar-bottom">
          <button className="btn-sidebar-logout" onClick={onLogout} title="Sign Out">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
