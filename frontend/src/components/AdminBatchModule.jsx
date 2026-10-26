import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Shuffle,
  RotateCcw,
  Users,
  Calendar,
  Tag,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Clock,
  Gift,
  X,
  ExternalLink,
  Eye,
  RefreshCw
} from 'lucide-react';
import { api } from '../api';
import ConfirmModal from './ConfirmModal';

export default function AdminBatchModule({ onShowToast }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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

  // Create / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget_range: '₱500 - ₱1000',
    target_date: '',
    min_wishlist_items: 1,
    status: 'open',
  });

  // Inspect Participants Modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectingBatch, setInspectingBatch] = useState(null);
  const [participantsList, setParticipantsList] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const res = await api.getBatches();
      setBatches(res || []);
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to load batches.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const openCreateModal = () => {
    setEditingBatch(null);
    setFormData({
      title: '',
      description: '',
      budget_range: '₱500 - ₱1000',
      target_date: '',
      min_wishlist_items: 1,
      status: 'open',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (batch) => {
    setEditingBatch(batch);
    setFormData({
      title: batch.title,
      description: batch.description || '',
      budget_range: batch.budget_range || '₱500 - ₱1000',
      target_date: batch.target_date || '',
      min_wishlist_items: batch.min_wishlist_items || 1,
      status: batch.status || 'open',
    });
    setIsModalOpen(true);
  };

  const handleSaveBatch = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setConfirmState({
        isOpen: true,
        title: 'Title Required',
        message: 'Please provide a title for this gift exchange batch event.',
        confirmText: 'Got It',
        isAlert: true,
        type: 'warning',
      });
      return;
    }

    try {
      setActionLoading(true);
      if (editingBatch) {
        await api.adminUpdateBatch(editingBatch.id, formData);
        if (onShowToast) onShowToast('Batch successfully updated!');
      } else {
        await api.adminCreateBatch(formData);
        if (onShowToast) onShowToast('New batch successfully created!');
      }
      setIsModalOpen(false);
      await loadBatches();
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to save batch.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBatch = (batch) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Event Batch?',
      message: `Are you sure you want to delete "${batch.title}"?\n\nAll participant registrations in this batch will be permanently removed.`,
      confirmText: 'Yes, Delete Batch',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        try {
          setActionLoading(true);
          await api.adminDeleteBatch(batch.id);
          if (onShowToast) onShowToast(`Batch "${batch.title}" deleted.`);
          await loadBatches();
        } catch (err) {
          if (onShowToast) onShowToast(err.message || 'Failed to delete batch.', 'error');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Bulk matching triggered by admin for a specific batch
  const handleMatchBatch = (batch) => {
    setConfirmState({
      isOpen: true,
      title: '🎲 Run Simultaneous Auto-Match?',
      message: `Are you ready to auto-match all ${batch.participants_count} registered participants in "${batch.title}"?\n\nEveryone will be paired simultaneously in a fair Secret Santa loop with zero self-picks!`,
      confirmText: 'Yes, Auto-Match Now',
      cancelText: 'Cancel',
      type: 'match',
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        try {
          setActionLoading(true);
          const res = await api.adminMatchBatch(batch.id);
          if (onShowToast) onShowToast(res.message);
          await loadBatches();
        } catch (err) {
          if (onShowToast) onShowToast(err.message || 'Failed to match participants.', 'error');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleResetBatchMatches = (batch) => {
    setConfirmState({
      isOpen: true,
      title: 'Reset Batch Matches?',
      message: `Reset matches for "${batch.title}"?\n\nParticipants will return to the waiting state until you auto-match again.`,
      confirmText: 'Yes, Reset Matches',
      cancelText: 'Cancel',
      type: 'reset',
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        try {
          setActionLoading(true);
          const res = await api.adminResetBatchMatches(batch.id);
          if (onShowToast) onShowToast(res.message);
          await loadBatches();
        } catch (err) {
          if (onShowToast) onShowToast(err.message || 'Failed to reset matches.', 'error');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Inspect participants modal
  const handleInspectParticipants = async (batch) => {
    setInspectingBatch(batch);
    setInspectModalOpen(true);
    try {
      setParticipantsLoading(true);
      const data = await api.adminGetBatchParticipants(batch.id);
      setParticipantsList(data || []);
    } catch (err) {
      if (onShowToast) onShowToast(err.message || 'Failed to load participants.', 'error');
    } finally {
      setParticipantsLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <RefreshCw className="animate-spin" size={32} color="var(--primary-rose)" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading Event Batches...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header */}
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="section-title">
            <Layers className="text-rose-400" size={24} style={{ color: 'var(--primary-rose)' }} />
            Event Batches Management
          </h1>
          <p className="section-desc">
            Create events for users to join, monitor wishlist participation, and trigger simultaneous gift matching with one click.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={loadBatches} disabled={actionLoading}>
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          <button className="btn-primary" onClick={openCreateModal} disabled={actionLoading}>
            <Plus size={17} />
            <span>Create New Batch</span>
          </button>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="empty-box" style={{ padding: '50px 20px', textAlign: 'center' }}>
          <div className="empty-icon" style={{ margin: '0 auto 12px' }}>
            <Layers size={28} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '6px' }}>
            No Batches Created Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 18px' }}>
            Get started by creating your first gift exchange batch event (e.g. Christmas 2026, Office Party).
          </p>
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            <span>Create First Batch</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {batches.map((batch) => {
            const isMatched = batch.status === 'matched';
            const participantCount = batch.participants_count || 0;
            const matchedCount = batch.matched_count || 0;

            return (
              <div
                key={batch.id}
                style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px'
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)' }}>
                        {batch.title}
                      </h3>

                      {isMatched ? (
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--accent-purple-light)',
                            color: 'var(--accent-purple-text)',
                            border: '1px solid var(--accent-purple-border)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Sparkles size={12} />
                          Matched / Closed
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--primary-emerald-light)',
                            color: 'var(--primary-emerald-text)',
                            border: '1px solid var(--primary-emerald-border)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span className="status-dot green" />
                          Open for Registration
                        </span>
                      )}
                    </div>

                    {batch.description && (
                      <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', maxWidth: '650px' }}>
                        {batch.description}
                      </p>
                    )}
                  </div>

                  {/* Actions for editing / deleting */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.84rem' }}
                      onClick={() => openEditModal(batch)}
                      title="Edit Batch Info"
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      className="btn-icon-danger"
                      onClick={() => handleDeleteBatch(batch)}
                      title="Delete Batch"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Details & Statistics Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    background: 'var(--bg-card-subtle)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={18} color="var(--primary-rose)" />
                    <div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                        Participants
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                        {participantCount} registered
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Gift size={18} color="var(--primary-emerald)" />
                    <div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                        Wishlists
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                        {batch.wishlists_count || 0} items listed
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Tag size={18} color="var(--accent-gold)" />
                    <div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                        Budget Range
                      </div>
                      <div style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        {batch.budget_range || 'Flexible'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={18} color="var(--accent-purple)" />
                    <div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
                        Match Status
                      </div>
                      <div style={{ fontSize: '0.98rem', fontWeight: '700', color: isMatched ? 'var(--accent-purple-text)' : 'var(--text-muted)' }}>
                        {isMatched ? `${matchedCount}/${participantCount} Matched` : 'Pending Match'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Batch Action Center (Simultaneous Matching) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingTop: '6px'
                  }}
                >
                  <button
                    className="btn-secondary"
                    onClick={() => handleInspectParticipants(batch)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Eye size={16} />
                    <span>Inspect Participants & Pairs ({participantCount})</span>
                  </button>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {isMatched ? (
                      <>
                        <button
                          className="btn-secondary"
                          onClick={() => handleResetBatchMatches(batch)}
                          disabled={actionLoading}
                          style={{ color: '#dc2626' }}
                        >
                          <RotateCcw size={15} />
                          <span>Reset Matches</span>
                        </button>

                        <button
                          className="btn-emerald"
                          onClick={() => handleMatchBatch(batch)}
                          disabled={actionLoading}
                        >
                          <Shuffle size={15} />
                          <span>Re-Match All Participants</span>
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => handleMatchBatch(batch)}
                        disabled={actionLoading || participantCount < 2}
                        title={participantCount < 2 ? 'Need at least 2 participants to match' : 'Run simultaneous matching'}
                        style={{
                          background: participantCount < 2 ? '#a8a29e' : 'var(--primary-rose)',
                          cursor: participantCount < 2 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <Shuffle size={16} />
                        <span>🎲 Auto-Match All Now ({participantCount} Participants)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingBatch ? 'Edit Event Batch' : 'Create New Event Batch'}
              </h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">Batch / Event Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Christmas Party 2026 - Main Event"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Notes, theme instructions, or guidelines for participants..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Budget Range</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ₱500 - ₱1000"
                    value={formData.budget_range}
                    onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Batch Status</label>
                <select
                  className="form-input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="open">Open for Registration & Wishlists</option>
                  <option value="matched">Matched / Draw Completed</option>
                  <option value="completed">Event Completed</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : editingBatch ? 'Update Batch' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT PARTICIPANTS MODAL */}
      {inspectModalOpen && (
        <div className="modal-overlay" onClick={() => setInspectModalOpen(false)}>
          <div
            className="modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '750px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="modal-header">
              <div>
                <h2 className="modal-title">
                  Participants in {inspectingBatch?.title}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                  {participantsList.length} members joined • Inspect assigned Secret Santa matches
                </p>
              </div>
              <button className="modal-close" onClick={() => setInspectModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', marginTop: '16px', flex: 1 }}>
              {participantsLoading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <RefreshCw className="animate-spin" size={28} color="var(--primary-rose)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading participants...</p>
                </div>
              ) : participantsList.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No participants have joined this batch yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 12px' }}>Participant</th>
                        <th style={{ padding: '10px 12px' }}>Lucky #</th>
                        <th style={{ padding: '10px 12px' }}>Wishlists</th>
                        <th style={{ padding: '10px 12px' }}>Giving Gift To (Match)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participantsList.map((p) => (
                        <tr
                          key={p.id}
                          style={{ borderBottom: '1px solid var(--border-subtle)' }}
                        >
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                              {p.display_name}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                              @{p.username}
                            </div>
                          </td>

                          <td style={{ padding: '12px' }}>
                            <span
                              style={{
                                background: 'var(--primary-rose-light)',
                                color: 'var(--primary-rose-text)',
                                padding: '3px 8px',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: '800',
                                fontSize: '0.8rem'
                              }}
                            >
                              #{p.assigned_number}
                            </span>
                          </td>

                          <td style={{ padding: '12px' }}>
                            <span style={{ fontWeight: '700' }}>
                              {p.wishlist_count || 0} items
                            </span>
                          </td>

                          <td style={{ padding: '12px' }}>
                            {p.has_drawn ? (
                              <span
                                style={{
                                  background: 'var(--primary-emerald-light)',
                                  color: 'var(--primary-emerald-text)',
                                  padding: '4px 10px',
                                  borderRadius: 'var(--radius-full)',
                                  fontWeight: '700',
                                  fontSize: '0.82rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                🎁 #{p.drawn_user_assigned_number} ({p.drawn_user_name})
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>
                                Waiting for match
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '14px', textAlign: 'right' }}>
              <button className="btn-secondary" onClick={() => setInspectModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRM / ALERT MODAL */}
      <ConfirmModal
        {...confirmState}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
