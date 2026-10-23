import React, { useState, useEffect } from 'react';
import { X, Plus, Save, ExternalLink } from 'lucide-react';

export default function WishlistModal({ isOpen, onClose, onSave, editingItem }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_range: '',
    item_url: '',
    priority: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || '',
        description: editingItem.description || '',
        price_range: editingItem.price_range || '',
        item_url: editingItem.item_url || '',
        priority: editingItem.priority || 1,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        price_range: '',
        item_url: '',
        priority: 1,
      });
    }
    setError('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide an item title.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {editingItem ? 'Edit Wishlist Item' : 'Add Item to Wishlist'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="toast-banner toast-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item Name / Wish Title *</label>
            <input
              type="text"
              className="modal-clean-input"
              placeholder="e.g. Scented Candle, AquaFlask, Mechanical Keyboard"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Priority Level</label>
            <select
              className="modal-clean-input"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            >
              <option value={1}>🌟 Top Priority (Most Wanted)</option>
              <option value={2}>✨ Nice to Have</option>
              <option value={3}>🎁 Great Alternative</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Online Link / Reference URL (Optional)</label>
            <input
              type="url"
              className="modal-clean-input"
              placeholder="https://shopee.ph/... or Lazada / Amazon link"
              value={formData.item_url}
              onChange={(e) => setFormData({ ...formData, item_url: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Specific Details / Color / Preferences</label>
            <textarea
              rows={3}
              className="modal-clean-input"
              placeholder="e.g. Size M, color black or forest green, prefer vanilla scent..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingItem ? 'Update Wish' : 'Add to Wishlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
