import React from 'react';
import {
  Gift,
  Dice5,
  LogOut,
  Users,
  HelpCircle,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronRight
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
      {/* Mobile Minimalist Header Bar */}
      <header className="mobile-header-bar">
        <button
          className="btn-mobile-menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        <div
          className="mobile-header-brand"
          onClick={() => handleNavClick(user?.is_staff ? 'admin_participants' : 'wishlist')}
        >
          <img src="/hamster_hero.png" alt="Hamster" className="mobile-brand-avatar" />
          <div className="mobile-brand-title">
            <span>La Familia</span>
            <span className="mobile-brand-sub">Gift Exchange</span>
          </div>
        </div>

        {user && (
          <div className="mobile-header-badge">
            {user.is_staff ? (
              <span className="apple-badge admin-badge">Admin</span>
            ) : (
              <span className="apple-badge lucky-badge">#{user.assigned_number}</span>
            )}
          </div>
        )}
      </header>

      {/* Mobile Backdrop Overlay with Apple-style blur */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Apple-style Minimalist Sidebar */}
      <aside className={`apple-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="apple-sidebar-header">
          <div
            className="apple-brand-row"
            onClick={() => handleNavClick(user?.is_staff ? 'admin_participants' : 'wishlist')}
          >
            <div className="apple-brand-avatar-box">
              <img src="/hamster_hero.png" alt="Hamster Logo" className="apple-brand-img" />
            </div>
            <div className="apple-brand-meta">
              <span className="apple-brand-name">La Familia</span>
              <span className="apple-brand-tagline">Hamster Corp 2026</span>
            </div>
          </div>

          <button
            className="btn-sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* User Card (Apple Integrated Style) */}
        {user && (
          <div className="apple-user-section">
            <div className="apple-user-row">
              <div className={`apple-avatar ${user.is_staff ? 'is-admin' : ''}`}>
                {user.is_staff ? '👑' : `#${user.assigned_number}`}
              </div>
              <div className="apple-user-info">
                <span className="apple-user-display-name">
                  {user.display_name || user.first_name || user.username}
                </span>
                <span className="apple-user-role">
                  {user.is_staff ? 'System Administrator' : `@${user.username}`}
                </span>
              </div>
            </div>

            {/* Verification status pill */}
            {!user.is_staff && user.quiz_completed && (
              <div className="apple-status-row">
                {user.is_verified_true_hamster ? (
                  <div className="apple-status-pill verified">
                    <span className="status-dot green" />
                    <span>True Hamster ({user.quiz_score}/{user.quiz_total})</span>
                  </div>
                ) : (
                  <div className="apple-status-pill unverified">
                    <span className="status-dot amber" />
                    <span>Hamster Guest ({user.quiz_score}/{user.quiz_total})</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="apple-sidebar-divider" />

        {/* Navigation Section */}
        <nav className="apple-nav-group">
          <span className="apple-nav-caption">
            {user?.is_staff ? 'Admin Portal' : 'Workspace'}
          </span>

          {!user?.is_staff ? (
            <>
              <button
                className={`apple-nav-link ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => handleNavClick('wishlist')}
              >
                <div className="apple-nav-indicator" />
                <div className="apple-nav-icon">
                  <Gift size={17} strokeWidth={2} />
                </div>
                <span className="apple-nav-text">Wishlist</span>
                {wishlistCount > 0 && (
                  <span className="apple-nav-badge">{wishlistCount}</span>
                )}
              </button>

              <button
                className={`apple-nav-link ${activeTab === 'draw' ? 'active' : ''}`}
                onClick={() => handleNavClick('draw')}
              >
                <div className="apple-nav-indicator" />
                <div className="apple-nav-icon">
                  <Dice5 size={17} strokeWidth={2} />
                </div>
                <span className="apple-nav-text">Lucky Draw</span>
                <span className="apple-nav-badge-pill">Spin</span>
              </button>
            </>
          ) : (
            <>
              <button
                className={`apple-nav-link ${activeTab === 'admin_participants' || activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin_participants')}
              >
                <div className="apple-nav-indicator" />
                <div className="apple-nav-icon">
                  <Users size={17} strokeWidth={2} />
                </div>
                <span className="apple-nav-text">Participants</span>
              </button>

              <button
                className={`apple-nav-link ${activeTab === 'admin_questions' ? 'active' : ''}`}
                onClick={() => handleNavClick('admin_questions')}
              >
                <div className="apple-nav-indicator" />
                <div className="apple-nav-icon">
                  <HelpCircle size={17} strokeWidth={2} />
                </div>
                <span className="apple-nav-text">Quiz Questions</span>
                <span className="apple-nav-badge-pill">Verify</span>
              </button>
            </>
          )}
        </nav>

        {/* Footer / Sign Out */}
        <div className="apple-sidebar-footer">
          <div className="apple-sidebar-divider" />
          <button className="apple-btn-logout" onClick={onLogout} title="Sign Out">
            <LogOut size={16} strokeWidth={2} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
