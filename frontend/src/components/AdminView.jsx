import React, { useState, useEffect } from 'react';
import {
  Users,
  Gift,
  CheckCircle2,
  AlertCircle,
  Search,
  Shuffle,
  RotateCcw,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { api } from '../api';
import UserWishlistInspectModal from './UserWishlistInspectModal';
import AdminQuestionsModule from './AdminQuestionsModule';
import AdminBatchModule from './AdminBatchModule';

export default function AdminView({ currentTab = 'admin_batches' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [toastMsg, setToastMsg] = useState({ text: '', type: '' });

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminOverview();
      setData(res);
    } catch (err) {
      setToastMsg({ text: err.message || 'Failed to load admin data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const showToast = (text, type = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg({ text: '', type: '' }), 4000);
  };

  const handleAutoMatch = async () => {
    if (!window.confirm('Are you sure you want to automatically shuffle and match all participants in a fair Secret Santa circle?')) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.adminAutoMatchAll();
      showToast(res.message);
      await loadAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetMatches = async (userId = null) => {
    const confirmText = userId
      ? 'Reset the drawn match for this participant?'
      : 'Reset ALL gift matches for every participant?';
    if (!window.confirm(confirmText)) return;

    try {
      setActionLoading(true);
      const res = await api.adminResetMatches(userId);
      showToast(res.message);
      await loadAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete participant ${name}?`)) return;

    try {
      setActionLoading(true);
      const res = await api.adminDeleteUser(userId);
      showToast(res.message);
      await loadAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetQuiz = async (userId, name) => {
    if (!window.confirm(`Reset quiz verification for ${name}? The user will be asked to answer the questions again.`)) return;

    try {
      setActionLoading(true);
      const res = await api.adminResetUserQuiz(userId);
      showToast(res.message);
      await loadAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <RefreshCw className="animate-spin" size={36} color="var(--primary-rose)" />
        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading Admin Monitoring Portal...</p>
      </div>
    );
  }

  const stats = data?.stats || { total_users: 0, total_wishlists: 0, matched_count: 0, unmatched_count: 0 };
  const participants = data?.users || [];

  const filteredUsers = participants.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.display_name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      String(u.assigned_number).includes(q) ||
      (u.drawn_user_number && String(u.drawn_user_number).includes(q))
    );
  });

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">
            <Users size={26} color="var(--primary-rose)" />
            <span>Admin Monitoring Center</span>
          </h1>
        </div>

        <div className="admin-actions-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={loadAdminData} disabled={actionLoading} title="Refresh Data">
            <RefreshCw size={16} />
            <span className="btn-text-desktop">Refresh</span>
          </button>
          <button className="btn-primary" onClick={handleAutoMatch} disabled={actionLoading} title="Auto-Match All Participants">
            <Shuffle size={16} />
            <span className="btn-text-desktop">Auto-Match All</span>
          </button>
          <button
            className="btn-secondary"
            onClick={() => handleResetMatches(null)}
            disabled={actionLoading}
            style={{ color: '#b91c1c' }}
            title="Reset All Matches"
          >
            <RotateCcw size={16} />
            <span className="btn-text-desktop">Reset</span>
          </button>
        </div>
      </div>

      {toastMsg.text && (
        <div className={`toast-banner ${toastMsg.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toastMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {currentTab === 'admin_batches' ? (
        <AdminBatchModule onShowToast={showToast} />
      ) : currentTab === 'admin_questions' ? (
        <AdminQuestionsModule />
      ) : (
        <>
          {/* Stat Cards */}
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-icon" style={{ background: 'var(--primary-rose-light)', color: 'var(--primary-rose)' }}>
                <Users size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.total_users}</div>
                <div className="stat-label">Total Participants (Pool)</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon" style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}>
                <Gift size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.total_wishlists}</div>
                <div className="stat-label">Total Wishlist Items</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon" style={{ background: 'var(--primary-emerald-light)', color: 'var(--primary-emerald)' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.matched_count}</div>
                <div className="stat-label">Matched / Drawn</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon" style={{ background: 'var(--accent-purple-light)', color: 'var(--accent-purple)' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.unmatched_count}</div>
                <div className="stat-label">Pending / Unmatched</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="admin-search-wrap">
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search by name, @username, or #number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={18} className="admin-search-icon" />
            </div>
          </div>

          {/* Participants Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Lucky #</th>
                  <th>Participant</th>
                  <th>Username</th>
                  <th>Hamster Status</th>
                  <th>Wishlist Items</th>
                  <th>Giving Gift To (Drawn)</th>
                  <th>Receiving From</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No participants matched your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className="badge-number">#{p.assigned_number}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                          {p.display_name || p.username}
                          {p.is_staff && (
                            <span style={{ marginLeft: '6px', fontSize: '0.7rem', background: 'var(--primary-rose-light)', color: 'var(--primary-rose-text)', border: '1px solid var(--primary-rose-border)', padding: '2px 6px', borderRadius: '4px' }}>
                              ADMIN
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>@{p.username}</td>
                      <td>
                        {p.is_staff ? (
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary-rose)' }}>ADMIN</span>
                        ) : p.quiz_completed ? (
                          p.is_verified_true_hamster ? (
                            <span className="badge-drawn" title={`Score: ${p.quiz_score}/${p.quiz_total}`}>
                              👑 True Hamster ({p.quiz_score}/{p.quiz_total})
                            </span>
                          ) : (
                            <span
                              style={{
                                background: '#fef2f2',
                                color: '#991b1b',
                                border: '1px solid #fecdd3',
                                fontWeight: '800',
                                padding: '3px 9px',
                                borderRadius: '9999px',
                                fontSize: '0.8rem',
                              }}
                              title={`Score: ${p.quiz_score}/${p.quiz_total}`}
                            >
                              ❌ Not True ({p.quiz_score}/{p.quiz_total})
                            </span>
                          )
                        ) : (
                          <span className="badge-unpaired">⏳ Pending Quiz</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.8rem', gap: '6px' }}
                          onClick={() => setSelectedParticipant(p)}
                        >
                          <Eye size={14} />
                          <span>{p.wishlist?.length || 0} wish{(p.wishlist?.length || 0) !== 1 ? 'es' : ''}</span>
                        </button>
                      </td>
                      <td>
                        {p.drawn_user_number ? (
                          <span className="badge-drawn">
                            🎁 #{p.drawn_user_number} ({p.drawn_user_name})
                          </span>
                        ) : (
                          <span className="badge-unpaired">Not drawn yet</span>
                        )}
                      </td>
                      <td>
                        {p.drawn_by_user_number ? (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-body)', fontWeight: '600' }}>
                            #{p.drawn_by_user_number} ({p.drawn_by_user_name})
                          </span>
                        ) : (
                          <span className="badge-unpaired">No giver yet</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          {!p.is_staff && p.quiz_completed && (
                            <button
                              className="btn-secondary"
                              style={{ padding: '6px 8px', fontSize: '0.72rem', color: 'var(--primary-rose)' }}
                              title="Reset Hamster Quiz Verification (let user retake test)"
                              onClick={() => handleResetQuiz(p.id, p.display_name || p.username)}
                            >
                              Reset Quiz
                            </button>
                          )}
                          {p.drawn_user_number && (
                            <button
                              className="btn-secondary"
                              style={{ padding: '6px', fontSize: '0.75rem' }}
                              title="Reset Match for this participant"
                              onClick={() => handleResetMatches(p.id)}
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                          {!p.is_staff && (
                            <button
                              className="btn-icon-danger"
                              title="Delete participant"
                              onClick={() => handleDeleteUser(p.id, p.display_name)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Inspect Wishlist Modal */}
      <UserWishlistInspectModal
        isOpen={Boolean(selectedParticipant)}
        onClose={() => setSelectedParticipant(null)}
        participant={selectedParticipant}
      />
    </div>
  );
}
