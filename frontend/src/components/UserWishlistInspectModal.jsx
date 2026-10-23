import React from 'react';
import { X, Gift, ExternalLink, Sparkles } from 'lucide-react';

export default function UserWishlistInspectModal({ isOpen, onClose, participant }) {
  if (!isOpen || !participant) return null;

  const wishlist = participant.wishlist || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-number">#{participant.assigned_number}</span>
              <h3 className="modal-title">{participant.display_name}</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              @{participant.username} • {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in wishlist
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-box" style={{ padding: '32px' }}>
            <Gift size={32} color="var(--text-muted)" />
            <p style={{ color: 'var(--text-muted)' }}>This participant hasn't added any wishlist items yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
            {wishlist.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#fbf8f5',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className={`priority-tag priority-${item.priority}`}>
                      {item.priority === 1 && '🌟 Most Wanted'}
                      {item.priority === 2 && '✨ Nice to Have'}
                      {item.priority === 3 && '🎁 Alternative'}
                    </span>
                    {item.price_range && (
                      <span className="wish-price" style={{ fontSize: '0.8rem' }}>
                        {item.price_range}
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>{item.title}</h4>
                  {item.description && (
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.5' }}>
                      {item.description}
                    </p>
                  )}
                </div>

                {item.item_url && (
                  <a
                    href={item.item_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.8rem', flexShrink: 0 }}
                  >
                    <ExternalLink size={14} />
                    <span>Link</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
