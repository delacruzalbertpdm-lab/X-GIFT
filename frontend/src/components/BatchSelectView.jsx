import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Tag,
  Users,
  Gift,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function BatchSelectView({
  batches = [],
  currentBatch,
  onSelectBatch,
  onJoinBatch,
  onRefresh,
}) {
  const [joiningId, setJoiningId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleJoin = async (batchId) => {
    try {
      setErrorMsg('');
      setJoiningId(batchId);
      await onJoinBatch(batchId);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to join this event.');
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--primary-rose)',
                background: 'var(--primary-rose-light)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              Batch Module
            </span>
          </div>
          <h1 className="section-title">
            <Layers className="text-rose-400" size={26} style={{ color: 'var(--primary-rose)' }} />
            Exchange Gift Events
          </h1>
          <p className="section-desc">
            Select an event to submit your wishlist. Once registration wraps up, the admin will match everyone at once!
          </p>
        </div>

        {onRefresh && (
          <button
            className="btn-secondary"
            onClick={onRefresh}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={15} />
            <span>Refresh Events</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div
          className="toast-banner toast-error"
          style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span>{errorMsg}</span>
        </div>
      )}

      {batches.length === 0 ? (
        <div className="empty-box" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div className="empty-icon" style={{ margin: '0 auto 16px' }}>
            <Layers size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>
            No Active Events Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto' }}>
            The system administrator hasn't launched any gift exchange batches yet. Check back soon or contact your event organizer!
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {batches.map((batch) => {
            const isSelected = currentBatch && currentBatch.id === batch.id;
            const isJoined = batch.is_joined;
            const isMatched = batch.status === 'matched';
            const isCompleted = batch.status === 'completed';

            return (
              <div
                key={batch.id}
                style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  border: isSelected
                    ? '2px solid var(--primary-rose)'
                    : '1px solid var(--border-subtle)',
                  padding: '24px',
                  boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Top Badge Banner */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      background: 'var(--primary-rose)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      padding: '4px 14px',
                      borderBottomLeftRadius: 'var(--radius-sm)',
                      letterSpacing: '0.04em'
                    }}
                  >
                    Active Selection
                  </div>
                )}

                <div>
                  {/* Status row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    {isMatched ? (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--accent-purple-light)',
                          color: 'var(--accent-purple-text)',
                          border: '1px solid var(--accent-purple-border)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <Sparkles size={13} />
                        Matched / Closed
                      </span>
                    ) : isCompleted ? (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: '#f3f4f6',
                          color: '#4b5563',
                          border: '1px solid #e5e7eb',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <CheckCircle2 size={13} />
                        Completed
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--primary-emerald-light)',
                          color: 'var(--primary-emerald-text)',
                          border: '1px solid var(--primary-emerald-border)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span className="status-dot green" />
                        Open for Joining
                      </span>
                    )}

                    {isJoined && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <CheckCircle2 size={12} />
                        Joined
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '800',
                      color: 'var(--text-main)',
                      marginBottom: '8px',
                      lineHeight: '1.3'
                    }}
                  >
                    {batch.title}
                  </h3>

                  {batch.description && (
                    <p
                      style={{
                        color: 'var(--text-body)',
                        fontSize: '0.88rem',
                        marginBottom: '16px',
                        lineHeight: '1.45'
                      }}
                    >
                      {batch.description}
                    </p>
                  )}

                  {/* Meta Pills */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '14px 0 20px' }}>
                    {batch.budget_range && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        <Tag size={15} color="var(--primary-rose)" />
                        <span>Budget Range: <strong style={{ color: 'var(--text-main)' }}>{batch.budget_range}</strong></span>
                      </div>
                    )}

                    {batch.target_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        <Calendar size={15} color="var(--accent-gold)" />
                        <span>Target Date: <strong style={{ color: 'var(--text-main)' }}>{batch.target_date}</strong></span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      <Users size={15} color="var(--primary-emerald)" />
                      <span>
                        Participants: <strong style={{ color: 'var(--text-main)' }}>{batch.participants_count || 0}</strong> registered
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '12px' }}>
                  {isJoined ? (
                    <button
                      className="btn-primary"
                      onClick={() => onSelectBatch(batch)}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <Gift size={16} />
                      <span>View Wishlist & Match</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : batch.status === 'open' ? (
                    <button
                      className="btn-emerald"
                      onClick={() => handleJoin(batch.id)}
                      disabled={joiningId === batch.id}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      {joiningId === batch.id ? (
                        <>
                          <RefreshCw className="animate-spin" size={16} />
                          <span>Joining...</span>
                        </>
                      ) : (
                        <>
                          <Gift size={16} />
                          <span>Join This Event Now</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className="btn-secondary"
                      disabled
                      style={{ width: '100%', justifyContent: 'center', opacity: 0.65, cursor: 'not-allowed' }}
                    >
                      <span>Registration Closed</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
