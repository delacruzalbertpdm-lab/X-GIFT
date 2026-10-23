import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ExternalLink, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import WishlistModal from './WishlistModal';

export default function WishlistView({ items, onAddItem, onUpdateItem, onDeleteItem, onGoToDraw }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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
      await onAddItem(formData);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">
            <Sparkles className="text-rose-400" size={24} style={{ color: 'var(--primary-rose)' }} />
            My Wishlist ({items.length})
          </h1>
          <p className="section-desc">
            Add items you'd love to receive! You can add as many items as you like.
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
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '400px' }}>
              Add at least 1 wishlist item to unlock the Lucky Draw and get paired with another participant.
            </p>
          </div>
          <button className="btn-primary" onClick={handleAddNewClick} style={{ marginTop: '10px' }}>
            <Plus size={18} />
            <span>Add My First Wish</span>
          </button>
        </div>
      ) : (
        <>
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
                      <span className="wish-price">
                        {item.price_range}
                      </span>
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
                      onClick={() => onDeleteItem(item.id)}
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '32px',
              padding: '20px 24px',
              background: 'var(--primary-emerald-light)',
              border: '1px solid var(--primary-emerald-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--primary-emerald)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800'
                }}
              >
                ✓
              </div>
              <div>
                <h4 style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--primary-emerald-text)' }}>Wishlist Ready!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  You have listed {items.length} item{items.length > 1 ? 's' : ''}. Head to the Lucky Draw to pick your exchange partner!
                </p>
              </div>
            </div>

            <button className="btn-emerald" onClick={onGoToDraw}>
              <span>Go to Lucky Draw</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </>
      )}

      <WishlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        editingItem={editingItem}
      />
    </div>
  );
}
