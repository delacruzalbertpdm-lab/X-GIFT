import React, { useEffect } from 'react';
import {
  AlertTriangle,
  Trash2,
  Shuffle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  X,
  RefreshCw
} from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'primary', // 'danger' | 'warning' | 'match' | 'primary' | 'info' | 'success'
  isAlert = false, // If true, only shows 1 button (OK)
  loading = false,
}) {
  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  // Determine Icon & Colors based on type
  let iconComponent = <HelpCircle size={28} />;
  let iconBg = 'var(--primary-rose-light)';
  let iconBorder = 'var(--primary-rose-border)';
  let iconColor = 'var(--primary-rose)';
  let confirmBtnClass = 'btn-primary';

  if (type === 'danger') {
    iconComponent = <Trash2 size={28} />;
    iconBg = '#fee2e2';
    iconBorder = '#fecaca';
    iconColor = '#dc2626';
    confirmBtnClass = 'btn-danger';
  } else if (type === 'warning') {
    iconComponent = <AlertTriangle size={28} />;
    iconBg = 'var(--accent-gold-light)';
    iconBorder = 'var(--accent-gold-border)';
    iconColor = 'var(--accent-gold)';
    confirmBtnClass = 'btn-primary';
  } else if (type === 'match') {
    iconComponent = <Shuffle size={28} />;
    iconBg = 'var(--accent-purple-light)';
    iconBorder = 'var(--accent-purple-border)';
    iconColor = 'var(--accent-purple-text)';
    confirmBtnClass = 'btn-emerald';
  } else if (type === 'reset') {
    iconComponent = <RotateCcw size={28} />;
    iconBg = '#fee2e2';
    iconBorder = '#fecaca';
    iconColor = '#dc2626';
    confirmBtnClass = 'btn-danger';
  } else if (type === 'success') {
    iconComponent = <CheckCircle2 size={28} />;
    iconBg = 'var(--primary-emerald-light)';
    iconBorder = 'var(--primary-emerald-border)';
    iconColor = 'var(--primary-emerald)';
    confirmBtnClass = 'btn-emerald';
  }

  return (
    <div className="modal-overlay" onClick={loading ? undefined : onClose}>
      <div
        className="modal-dialog"
        style={{
          maxWidth: '460px',
          padding: '32px 28px 24px',
          textAlign: 'center',
          animation: 'modalPopIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button on Top-Right */}
        {!loading && (
          <button
            className="btn-icon"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: '#f5ebe6',
              borderRadius: '50%',
              padding: '6px',
              color: 'var(--text-muted)'
            }}
          >
            <X size={18} />
          </button>
        )}

        {/* Big Icon Emblem */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: iconBg,
            border: `2px solid ${iconBorder}`,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
          }}
        >
          {iconComponent}
        </div>

        {/* Modal Title */}
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.3rem',
            fontWeight: '800',
            color: 'var(--text-main)',
            marginBottom: '10px',
            lineHeight: 1.3
          }}
        >
          {title}
        </h3>

        {/* Modal Message */}
        <div
          style={{
            color: 'var(--text-body)',
            fontSize: '0.92rem',
            lineHeight: 1.55,
            marginBottom: '26px',
            whiteSpace: 'pre-line'
          }}
        >
          {message}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {!isAlert && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
              style={{ flex: 1, justifyContent: 'center', padding: '11px 18px' }}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            className={confirmBtnClass}
            onClick={isAlert ? onClose : onConfirm}
            disabled={loading}
            style={{ flex: 1, justifyContent: 'center', padding: '11px 18px' }}
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
