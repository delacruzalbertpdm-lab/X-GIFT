import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Dice5, Gift, Sparkles, ExternalLink, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';

export default function LuckyDrawView({
  drawStatus,
  wishlistCount,
  onPickDraw,
  onGoToWishlist
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [spinningNumber, setSpinningNumber] = useState(888);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    } catch (e) {
      // safe fallback
    }
  };

  const handleDrawClick = async () => {
    setErrorMsg('');
    setIsDrawing(true);

    // Run roulette spinning effect
    const spinInterval = setInterval(() => {
      setSpinningNumber(Math.floor(100 + Math.random() * 9000));
    }, 80);

    try {
      // Call backend
      const result = await onPickDraw();

      // Let animation spin for 1.2s for excitement
      setTimeout(() => {
        clearInterval(spinInterval);
        setIsDrawing(false);
        triggerConfetti();
      }, 1200);
    } catch (err) {
      clearInterval(spinInterval);
      setIsDrawing(false);
      setErrorMsg(err.message || 'Failed to draw a number. Please try again.');
    }
  };

  const handleCopyWishlist = (recipient) => {
    if (!recipient || !recipient.wishlist) return;
    const text = `🎁 Recipient #${recipient.assigned_number} Wishlist:\n` +
      recipient.wishlist.map((w, i) => `${i + 1}. ${w.title} [${w.price_range || 'Flexible'}] ${w.item_url ? '- ' + w.item_url : ''}`).join('\n');
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If user has already drawn someone
  if (drawStatus?.has_drawn && drawStatus?.recipient) {
    const recipient = drawStatus.recipient;
    return (
      <div className="draw-container">
        <div className="result-card">
          <div className="result-header">
            <div className="result-number-highlight">
              <div className="result-number-badge">
                #{recipient.assigned_number}
              </div>
              <div>
                <span className="result-name-label">You Picked / Drawn Recipient</span>
                <h2 className="result-name">Lucky Number #{recipient.assigned_number}</h2>
              </div>
            </div>

            <button
              className="btn-secondary"
              onClick={() => handleCopyWishlist(recipient)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Wishlist'}</span>
            </button>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gift size={20} color="var(--primary-emerald)" />
              <span>Their Wishlist ({recipient.wishlist?.length || 0} items)</span>
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Here are the items requested by Participant #{recipient.assigned_number}. Choose any of these to make their holiday special!
            </p>
          </div>

          {!recipient.wishlist || recipient.wishlist.length === 0 ? (
            <div className="empty-box" style={{ padding: '32px 20px' }}>
              <AlertCircle size={32} color="var(--accent-gold)" />
              <p style={{ color: 'var(--text-muted)' }}>
                This user has not listed detailed wishlist items yet. Check back soon or surprise them!
              </p>
            </div>
          ) : (
            <div className="wishlist-grid">
              {recipient.wishlist.map((item) => (
                <div
                  key={item.id}
                  className="wish-card"
                  style={{
                    border: '1px solid var(--border-subtle)',
                    background: '#ffffff',
                    boxShadow: '0 8px 24px rgba(58, 38, 30, 0.07)'
                  }}
                >
                  <div>
                    <div className="wish-card-top">
                      <span className={`priority-tag priority-${item.priority}`}>
                        {item.priority === 1 && '🌟 Top Priority'}
                        {item.priority === 2 && '✨ Nice to Have'}
                        {item.priority === 3 && '🎁 Great Alternative'}
                      </span>
                      {item.price_range && (
                        <span className="wish-price">{item.price_range}</span>
                      )}
                    </div>

                    <h4 className="wish-title">{item.title}</h4>

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
                        className="btn-emerald"
                        style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                      >
                        <ExternalLink size={15} />
                        <span>Open Store / Item Link</span>
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>
                        No link provided
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // If user hasn't drawn yet
  const needsWishlist = wishlistCount < (drawStatus?.min_required || 1);

  return (
    <div className="draw-container">
      <div className="draw-interactive-card">
        <div className="draw-icon-halo">
          <Dice5 size={40} />
        </div>

        <h1 className="draw-title">Pick Your Lucky Match</h1>
        <p className="draw-subtitle">
          Ready to discover who you are giving gifts to? Once you draw, the system will randomly select
          another registered participant and reveal their unique number & wishlist!
        </p>

        {errorMsg && (
          <div className="toast-banner toast-error" style={{ maxWidth: '500px', margin: '0 auto 20px' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {isDrawing ? (
          <div className="spinner-box">
            <span style={{ fontSize: '0.85rem', color: 'var(--primary-rose)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Shuffling Participant Numbers...
            </span>
            <div className="spinning-number-display">#{spinningNumber}</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Selecting your lucky recipient...
            </p>
          </div>
        ) : needsWishlist ? (
          <div
            style={{
              background: 'var(--accent-gold-light)',
              border: '1px solid var(--accent-gold-border)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              maxWidth: '520px',
              margin: '0 auto',
              textAlign: 'center'
            }}
          >
            <AlertCircle size={32} color="var(--accent-gold)" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '6px' }}>
              Wishlist Required Before Drawing
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '18px' }}>
              Please add at least {drawStatus?.min_required || 1} item to your wishlist first so your secret Santa can also buy gifts for you!
            </p>
            <button className="btn-primary" onClick={onGoToWishlist}>
              <Gift size={18} />
              <span>Add Items to My Wishlist</span>
            </button>
          </div>
        ) : (
          <div>
            <button
              className="btn-big-draw"
              onClick={handleDrawClick}
              disabled={isDrawing}
            >
              <Dice5 size={26} />
              <span>🎲 DRAW A RANDOM NUMBER NOW</span>
            </button>
            <p style={{ marginTop: '16px', color: 'var(--text-faint)', fontSize: '0.85rem' }}>
              Fair & secret selection guaranteed. You cannot draw yourself.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
