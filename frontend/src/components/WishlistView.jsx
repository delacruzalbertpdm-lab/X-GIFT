import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Clock,
  Gift,
  ChevronLeft,
  CheckCircle2,
  Copy,
  Check,
  Tag,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import WishlistModal from './WishlistModal';
import ConfirmModal from './ConfirmModal';

export default function WishlistView({
  items = [],
  currentBatch,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onSwitchEvent,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [copied, setCopied] = useState(false);

  // Custom Confirm Modal State
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

  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleModalSave = async (formData) => {
    if (editingItem) {
      await onUpdateItem(editingItem.id, formData);
    } else {
      await onAddItem({
        ...formData,
        batch: currentBatch?.id || null,
      });
    }
  };

  const handleDeleteItemClick = (item) => {
    setConfirmState({
      isOpen: true,
      title: 'Remove Wishlist Item?',
      message: `Are you sure you want to remove "${item.title}" from your wishlist?`,
      confirmText: 'Yes, Remove',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        await onDeleteItem(item.id);
      },
    });
  };

  const handleCopyPartnerWishlist = (recipient) => {
    if (!recipient || !recipient.wishlist) return;
    const text = `🎁 Recipient #${recipient.assigned_number} Wishlist:\n` +
      recipient.wishlist
        .map((w, i) => `${i + 1}. ${w.title} [${w.price_range || 'Flexible'}] ${w.item_url ? '- ' + w.item_url : ''}`)
        .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const matchedRecipient = currentBatch?.my_matched_recipient;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Top Batch Header Bar */}
      {currentBatch && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '16px 20px',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {onSwitchEvent && (
              <button
                className="btn-secondary"
                onClick={onSwitchEvent}
                style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <ChevronLeft size={16} />
                <span>All Events</span>
              </button>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    color: 'var(--primary-rose)',
                    background: 'var(--primary-rose-light)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  Active Event
                </span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  {currentBatch.title}
                </h2>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {currentBatch.budget_range && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={13} color="var(--primary-rose)" />
                    Budget: <strong>{currentBatch.budget_range}</strong>
                  </span>
                )}
                {currentBatch.target_date && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} color="var(--accent-gold)" />
                    Date: <strong>{currentBatch.target_date}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            {matchedRecipient ? (
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  padding: '4px 12px',
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
                Match Revealed!
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-gold-light)',
                  color: 'var(--accent-gold-text)',
                  border: '1px solid var(--accent-gold-border)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Clock size={13} />
                Waiting for Admin Match
              </span>
            )}
          </div>
        </div>
      )}

      {/* MATCHED RECIPIENT CARD (OR WAITING BANNER) */}
      {matchedRecipient ? (
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fdf8f6 100%)',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--primary-rose)',
            padding: '28px',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top highlight bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '16px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '20px',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-rose)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: '900',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                #{matchedRecipient.assigned_number}
              </div>

              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--primary-rose)'
                  }}
                >
                  🎉 Your Assigned Exchange Gift Partner
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', marginTop: '2px' }}>
                  Lucky Number #{matchedRecipient.assigned_number}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  Secret Match in {currentBatch?.title}
                </p>
              </div>
            </div>

            <button
              className="btn-secondary"
              onClick={() => handleCopyPartnerWishlist(matchedRecipient)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Partner Wishlist'}</span>
            </button>
          </div>

          {/* Partner's Wishlist Items */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Gift size={18} color="var(--primary-emerald)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Their Wishlist ({matchedRecipient.wishlist?.length || 0} items)
              </h3>
            </div>

            {!matchedRecipient.wishlist || matchedRecipient.wishlist.length === 0 ? (
              <div
                style={{
                  background: 'var(--accent-gold-light)',
                  border: '1px solid var(--accent-gold-border)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent-gold-text)',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <AlertCircle size={20} />
                <span>
                  Your partner hasn't added detailed wishlist items yet. You can surprise them with a gift matching the event budget!
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px'
                }}
              >
                {matchedRecipient.wishlist.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-xs)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className={`priority-tag priority-${item.priority}`}>
                          {item.priority === 1 && '🌟 Top Priority'}
                          {item.priority === 2 && '✨ Nice to Have'}
                          {item.priority === 3 && '🎁 Alternative'}
                        </span>
                        {item.price_range && (
                          <span className="wish-price">{item.price_range}</span>
                        )}
                      </div>

                      <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
                        {item.title}
                      </h4>

                      {item.description && (
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-body)', marginBottom: '12px' }}>
                          {item.description}
                        </p>
                      )}
                    </div>

                    {item.item_url && (
                      <div style={{ marginTop: '10px' }}>
                        <a
                          href={item.item_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-emerald"
                          style={{ padding: '6px 12px', fontSize: '0.82rem', width: '100%', justifyContent: 'center' }}
                        >
                          <ExternalLink size={14} />
                          <span>Open Item Link</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* WAITING FOR MATCH BANNER */
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 28px',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-gold-light)',
                border: '1px solid var(--accent-gold-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold)'
              }}
            >
              <Clock size={24} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Waiting for Admin Matching
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '2px', maxWidth: '580px' }}>
                The event organizer will match everyone simultaneously once signups are complete. Add your wishlist items below so your partner knows what to buy!
              </p>
            </div>
          </div>

          <div
            style={{
              background: items.length > 0 ? 'var(--primary-emerald-light)' : 'var(--primary-rose-light)',
              color: items.length > 0 ? 'var(--primary-emerald-text)' : 'var(--primary-rose-text)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.84rem',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {items.length > 0 ? (
              <>
                <CheckCircle2 size={16} />
                <span>{items.length} item(s) ready</span>
              </>
            ) : (
              <>
                <AlertCircle size={16} />
                <span>No items yet — add below!</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* MY WISHLIST SECTION */}
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="section-title">
            <Sparkles className="text-rose-400" size={22} style={{ color: 'var(--primary-rose)' }} />
            My Wishlist ({items.length})
          </h2>
          <p className="section-desc">
            {currentBatch ? `Items you would love to receive for ${currentBatch.title}` : 'Add items you would love to receive!'}
          </p>
        </div>

        <button className="btn-primary" onClick={handleAddNewClick}>
          <Plus size={18} />
          <span>Add Wishlist Item</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-box">
          <div className="empty-icon">
            <Sparkles size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '6px' }}>
              Your wishlist is currently empty!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '420px' }}>
              Add items you'd love to receive so your secret partner can easily find the perfect gift for you.
            </p>
          </div>
          <button className="btn-primary" onClick={handleAddNewClick} style={{ marginTop: '10px' }}>
            <Plus size={18} />
            <span>Add My First Wish</span>
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((item) => (
            <div key={item.id} className="wish-card">
              <div>
                <div className="wish-card-top">
                  <span className={`priority-tag priority-${item.priority}`}>
                    {item.priority === 1 && '🌟 Top Priority'}
                    {item.priority === 2 && '✨ Nice to Have'}
                    {item.priority === 3 && '🎁 Alternative'}
                  </span>

                  {item.price_range && (
                    <span className="wish-price">{item.price_range}</span>
                  )}
                </div>

                <h3 className="wish-title">{item.title}</h3>

                {item.description && (
                  <p className="wish-desc" style={{ marginTop: '8px' }}>
                    {item.description}
                  </p>
                )}
              </div>

              <div className="wish-actions">
                {item.item_url ? (
                  <a
                    href={item.item_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                  >
                    <ExternalLink size={14} />
                    <span>View Link</span>
                  </a>
                ) : (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>
                    No link provided
                  </span>
                )}

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 10px' }}
                    onClick={() => handleEditClick(item)}
                    title="Edit Item"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    className="btn-icon-danger"
                    onClick={() => handleDeleteItemClick(item)}
                    title="Delete Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <WishlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        editingItem={editingItem}
      />

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        {...confirmState}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
