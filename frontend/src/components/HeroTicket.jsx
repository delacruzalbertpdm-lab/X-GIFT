import React from 'react';
import { Ticket, Sparkles } from 'lucide-react';

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
      </div>

      <div className="ticket-badge-box">
        <span className="ticket-label">Your Lucky Draw Number</span>
        <span className="ticket-number">#{user.assigned_number}</span>
        <span className="ticket-sublabel">LA Familia De Hamster • 2026</span>
      </div>
    </div>
  );
}
