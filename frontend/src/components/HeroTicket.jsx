import React from 'react';
import { Ticket, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function HeroTicket({ user }) {
  if (!user) return null;

  return (
    <div className="ticket-hero">
      <div className="ticket-info">
        <div className="ticket-tag-chip">
          <Sparkles size={14} />
          <span>OFFICIAL PARTICIPANT PASS</span>
        </div>
        <h2 className="ticket-greeting">
          Hello, {user.display_name || user.first_name || user.username}! 👋
        </h2>
        <p className="ticket-desc">
          You are officially registered in the exchange gift pool. Your identity is secretly represented by your lucky number.
          Add your wishlist items so your secret giver knows what to get for you!
        </p>

        {/* Hamster Verification Status Banner */}
        {user.quiz_completed && (
          <div style={{ marginTop: '14px' }}>
            {user.is_verified_true_hamster ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ecfdf5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                  padding: '7px 14px',
                  borderRadius: '12px',
                  fontSize: '0.86rem',
                  fontWeight: '700',
                }}
              >
                <CheckCircle2 size={16} color="#059669" />
                <span>👑 Certified True La Familia Hamster Corp Member! (Score: {user.quiz_score}/{user.quiz_total})</span>
              </div>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fecdd3',
                  padding: '7px 14px',
                  borderRadius: '12px',
                  fontSize: '0.86rem',
                  fontWeight: '700',
                }}
              >
                <AlertTriangle size={16} color="#dc2626" />
                <span>🐹❌ Hamster Guest (Score: {user.quiz_score}/{user.quiz_total}) — but you're warmly welcome to the gift exchange!</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ticket-badge-box">
        <span className="ticket-label">Your Lucky Draw Number</span>
        <span className="ticket-number">#{user.assigned_number}</span>
        <span className="ticket-sublabel">LA Familia De Hamster • 2026</span>
      </div>
    </div>
  );
}
