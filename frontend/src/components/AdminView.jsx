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
  RefreshCw,
  Layers,
  Tag,
  Calendar,
  Sparkles,
  Filter
} from 'lucide-react';
import { api } from '../api';
import UserWishlistInspectModal from './UserWishlistInspectModal';
import AdminQuestionsModule from './AdminQuestionsModule';
import AdminBatchModule from './AdminBatchModule';
import ConfirmModal from './ConfirmModal';

export default function AdminView({ currentTab = 'admin_batches' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [toastMsg, setToastMsg] = useState({ text: '', type: '' });

  // Event Batch Filtering Dropdown State
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [batches, setBatches] = useState([]);

  // Custom Confirm/Alert Modal State
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'primary',
    isAlert: false,
    onConfirm: () => {},
  });

  const loadAdminData = async (targetBatchId = undefined) => {
    try {
      setLoading(true);
      const batchToQuery = targetBatchId !== undefined ? targetBatchId : selectedBatchId;
      const res = await api.getAdminOverview(batchToQuery);
      setData(res);
      const batchList = res.batches || [];
      setBatches(batchList);

      // Auto-select first batch if none was selected
      if (targetBatchId === undefined && selectedBatchId === '' && batchList.length > 0) {
        setSelectedBatchId(batchList[0].id);
        const scopedRes = await api.getAdminOverview(batchList[0].id);
        setData(scopedRes);
      }
    } catch (err) {
      setToastMsg({ text: err.message || 'Failed to load admin data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleBatchChange = async (batchId) => {
    setSelectedBatchId(batchId);
    await loadAdminData(batchId);
  };

  const showToast = (text, type = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg({ text: '', type: '' }), 4000);
  };

  const handleAutoMatch = () => {
    const isBatch = Boolean(selectedBatchId && selectedBatchId !== 'all');
    const currentBatch = batches.find((b) => String(b.id) === String(selectedBatchId));
    const title = isBatch && currentBatch
      ? `Auto-Match Event: "${currentBatch.title}"?`
      : 'Auto-Match All Participants?';
    const message = isBatch && currentBatch
      ? `Are you sure you want to automatically shuffle and match all participants in "${currentBatch.title}"?`
      : 'Are you sure you want to automatically shuffle and match all participants in a fair Secret Santa circle?';
    const confirmText = isBatch ? 'Yes, Match Event' : 'Yes, Auto-Match All';

    setConfirmState({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText: 'Cancel',
      type: 'match',
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        try {
          setActionLoading(true);
          const res = isBatch
            ? await api.adminMatchBatch(selectedBatchId)
            : await api.adminAutoMatchAll();
          showToast(res.message);
          await loadAdminData(selectedBatchId);
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleResetMatches = (userId = null) => {
    const isSingle = Boolean(userId);
    const isBatch = Boolean(!isSingle && selectedBatchId && selectedBatchId !== 'all');
    const currentBatch = batches.find((b) => String(b.id) === String(selectedBatchId));

    let title = 'Reset All Matches?';
    let message = 'Are you sure you want to reset ALL gift matches for every participant in the pool?';
    if (isSingle) {
      title = 'Reset Participant Match?';
      message = 'Reset the drawn match for this participant?';
    } else if (isBatch && currentBatch) {
      title = `Reset Matches for "${currentBatch.title}"?`;
      message = `Are you sure you want to reset all gift matches for participants in "${currentBatch.title}"?`;
    }

    setConfirmState({
      isOpen: true,
      title,
      message,
      confirmText: 'Yes, Reset',
      cancelText: 'Cancel',
      type: 'reset',
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        try {
          setActionLoading(true);
          let res;
          if (isSingle) {
            res = await api.adminResetMatches(userId);
          } else if (isBatch) {
            res = await api.adminResetBatchMatches(selectedBatchId);
          } else {
            res = await api.adminResetMatches(null);
          }
          showToast(res.message);
          await loadAdminData(selectedBatchId);
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleDeleteUser = (userId, name) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Participant?',
      message: `Are you sure you want to permanently delete participant "${name}"?\n\nThis will remove their profile, wishlist items, and any draw connections.`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        try {
          setActionLoading(true);
          const res = await api.adminDeleteUser(userId);
          showToast(res.message);
          await loadAdminData(selectedBatchId);
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleResetQuiz = (userId, name) => {
    setConfirmState({
      isOpen: true,
      title: 'Reset Quiz Verification?',
      message: `Reset quiz verification for "${name}"?\n\nThe user will be prompted to retake the verification test upon their next access.`,
      confirmText: 'Yes, Reset Quiz',
      cancelText: 'Cancel',
      type: 'warning',
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        try {
          setActionLoading(true);
          const res = await api.adminResetUserQuiz(userId);
          showToast(res.message);
          await loadAdminData(selectedBatchId);
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          setActionLoading(false);
        }
      },
    });
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
  const selectedBatch = data?.selected_batch || null;
  const isBatchMode = Boolean(selectedBatchId && selectedBatchId !== 'all');

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
          <button
            className="btn-secondary"
            onClick={() => loadAdminData(selectedBatchId)}
            disabled={actionLoading}
            title="Refresh Data"
          >
            <RefreshCw size={16} />
            <span className="btn-text-desktop">Refresh</span>
          </button>
          <button
            className="btn-primary"
            onClick={handleAutoMatch}
            disabled={actionLoading}
            title={isBatchMode && selectedBatch ? `Auto-Match ${selectedBatch.title}` : "Auto-Match All Participants"}
          >
            <Shuffle size={16} />
            <span className="btn-text-desktop">
              {isBatchMode && selectedBatch ? `Auto-Match (${selectedBatch.title})` : 'Auto-Match All'}
            </span>
          </button>
          <button
            className="btn-secondary"
            onClick={() => handleResetMatches(null)}
            disabled={actionLoading}
            style={{ color: '#b91c1c' }}
            title={isBatchMode ? "Reset Matches for this Event" : "Reset All Matches"}
          >
            <RotateCcw size={16} />
            <span className="btn-text-desktop">
              {isBatchMode ? 'Reset Event Matches' : 'Reset'}
            </span>
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
          {/* Active Event Dropdown Filter Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '16px 20px',
              marginBottom: '20px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              border: '1.5px solid var(--border-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--primary-rose-light)',
                  color: 'var(--primary-rose)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Layers size={22} />
              </div>
              <div>
                <label
                  htmlFor="admin-event-filter-select"
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                    marginBottom: '4px',
                  }}
                >
                  Viewing Event / Batch:
                </label>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <select
                    id="admin-event-filter-select"
                    value={selectedBatchId || 'all'}
                    onChange={(e) => handleBatchChange(e.target.value)}
                    style={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      padding: '8px 36px 8px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--primary-rose)',
                      background: '#ffffff',
                      color: 'var(--text-main)',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      outline: 'none',
                      minWidth: '240px',
                      boxShadow: '0 2px 6px rgba(181, 70, 90, 0.08)',
                    }}
                  >
                    <option value="all">🌐 All Participants (Global Directory)</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        🎁 {b.title} ({b.status === 'matched' ? 'Matched' : 'Open'})
                      </option>
                    ))}
                  </select>
                  <Filter
                    size={16}
                    color="var(--primary-rose)"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Event Meta Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {selectedBatch ? (
                <>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      padding: '5px 12px',
                      borderRadius: '999px',
                      background: selectedBatch.status === 'matched' ? 'var(--primary-emerald-light)' : 'var(--accent-gold-light)',
                      color: selectedBatch.status === 'matched' ? 'var(--primary-emerald)' : 'var(--accent-gold)',
                      border: `1px solid ${selectedBatch.status === 'matched' ? 'var(--primary-emerald)' : 'var(--accent-gold)'}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Sparkles size={13} />
                    {selectedBatch.status === 'matched' ? 'Circle Matched' : 'Open for Joining'}
                  </span>

                  {selectedBatch.budget_range && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        padding: '5px 12px',
                        borderRadius: '999px',
                        background: '#f8fafc',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-soft)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <Tag size={13} />
                      Budget: {selectedBatch.budget_range}
                    </span>
                  )}

                  {selectedBatch.target_date && (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        padding: '5px 12px',
                        borderRadius: '999px',
                        background: '#f8fafc',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-soft)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <Calendar size={13} />
                      Date: {selectedBatch.target_date}
                    </span>
                  )}
                </>
              ) : (
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: 'var(--text-muted)',
                    background: '#f8fafc',
                    border: '1px solid var(--border-soft)',
                    padding: '5px 12px',
                    borderRadius: '999px',
                  }}
                >
                  Showing all registered system users
                </span>
              )}
            </div>
          </div>

          {/* Stat Cards */}
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-icon" style={{ background: 'var(--primary-rose-light)', color: 'var(--primary-rose)' }}>
                <Users size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.total_users}</div>
                <div className="stat-label">
                  {isBatchMode ? 'Participants in Event' : 'Total Participants (Pool)'}
                </div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon" style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}>
                <Gift size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.total_wishlists}</div>
                <div className="stat-label">
                  {isBatchMode ? 'Wishlist Items (This Event)' : 'Total Wishlist Items'}
                </div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon" style={{ background: 'var(--primary-emerald-light)', color: 'var(--primary-emerald)' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.matched_count}</div>
                <div className="stat-label">
                  {isBatchMode ? 'Matched in Event' : 'Matched / Drawn'}
                </div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon" style={{ background: 'var(--accent-purple-light)', color: 'var(--accent-purple)' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.unmatched_count}</div>
                <div className="stat-label">
                  {isBatchMode ? 'Pending in Event' : 'Pending / Unmatched'}
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="admin-search-wrap">
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                className="admin-search-input"
                placeholder={
                  isBatchMode && selectedBatch
                    ? `Search participants in "${selectedBatch.title}"...`
                    : "Search by name, @username, or #number..."
                }
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
                      {searchQuery
                        ? `No participants matched "${searchQuery}".`
                        : isBatchMode && selectedBatch
                        ? `No participants have joined "${selectedBatch.title}" yet.`
                        : 'No participants registered in the system.'}
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

      {/* Reusable Confirmation Modal */}
      <ConfirmModal
        {...confirmState}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
