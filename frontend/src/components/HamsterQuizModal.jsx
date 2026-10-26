import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, AlertCircle, CheckCircle2, ShieldAlert, ArrowRight, HelpCircle } from 'lucide-react';
import { api } from '../api';
import SmoothLoader from './SmoothLoader';

export default function HamsterQuizModal({ user, onQuizComplete }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.getQuizQuestions();
      const qList = res.questions || [];
      setQuestions(qList);

      // If no questions exist or already completed, skip directly
      if (qList.length === 0 || res.quiz_completed) {
        onQuizComplete();
      }
    } catch (err) {
      console.error('Error loading verification questions:', err);
      // Fallback: let user into dashboard if quiz fails to load
      onQuizComplete();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    if (result) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Ensure all questions are answered
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`Please answer all ${questions.length} questions to continue!`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitQuiz(answers);
      setResult(res);

      if (res.is_verified_true_hamster) {
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to submit verification.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-dialog" style={{ textAlign: 'center', padding: '36px', maxWidth: '440px' }}>
          <SmoothLoader
            transparent
            message="Preparing Hamster Verification"
            subtext="Loading official questions from La Familia Hamster Corp..."
          />
        </div>
      </div>
    );
  }

  // If already revealed results
  if (result) {
    return (
      <div className="modal-overlay">
        <div className="modal-dialog" style={{ maxWidth: '520px', textAlign: 'center', padding: '36px 26px' }}>
          <div
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              margin: '0 auto 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.4rem',
              background: result.is_verified_true_hamster ? '#ecfdf5' : '#fef2f2',
              border: `2px solid ${result.is_verified_true_hamster ? '#10b981' : '#ef4444'}`,
            }}
          >
            {result.is_verified_true_hamster ? '👑' : '❌'}
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.65rem',
              fontWeight: '900',
              color: result.is_verified_true_hamster ? '#065f46' : '#991b1b',
              marginBottom: '10px',
              lineHeight: 1.25,
            }}
          >
            {result.message}
          </h2>

          <div
            style={{
              display: 'inline-block',
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '9999px',
              padding: '6px 18px',
              fontWeight: '800',
              fontSize: '0.92rem',
              color: 'var(--text-main)',
              marginBottom: '16px',
            }}
          >
            Score: {result.quiz_score} / {result.quiz_total}
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', lineHeight: '1.6', marginBottom: '28px' }}>
            {result.is_verified_true_hamster ? (
              <span>You proved your 100% authentic Hamster spirit! Welcome to the official gift exchange pool! 🎉</span>
            ) : (
              <span>
                You did not pass verification, but because it's the season of giving,
                <strong> you can still access the gift exchange dashboard! 🎁</strong>
              </span>
            )}
          </p>

          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%', padding: '14px 22px', fontSize: '1.05rem', justifyContent: 'center' }}
            onClick={onQuizComplete}
          >
            <span>Enter Dashboard</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog" style={{ maxWidth: '600px', maxHeight: '90dvh', overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--primary-rose-light)',
              color: 'var(--primary-rose-text)',
              border: '1px solid var(--primary-rose-border)',
              padding: '5px 14px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: '800',
              marginBottom: '10px',
            }}
          >
            <span>🐹 SECURITY CLEARANCE</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)' }}>
            Verify Your Hamster Identity!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
            Before accessing the dashboard, answer these questions to verify your membership in La Familia Hamster Corp.
          </p>
          <div style={{ marginTop: '10px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-rose)' }}>
            Answered: {answeredCount} / {questions.length} Questions
          </div>
        </div>

        {error && (
          <div className="toast-banner toast-error" style={{ marginBottom: '18px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
            {questions.map((q, qIndex) => {
              const currentAns = answers[q.id];
              return (
                <div
                  key={q.id}
                  style={{
                    background: '#fdfbf9',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '18px 16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                    <span
                      style={{
                        background: 'var(--primary-rose)',
                        color: '#fff',
                        fontWeight: '800',
                        fontSize: '0.8rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        flexShrink: 0,
                      }}
                    >
                      Q{qIndex + 1}
                    </span>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.4' }}>
                      {q.question_text}
                    </h3>
                  </div>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { key: 'A', text: q.option_a },
                      { key: 'B', text: q.option_b },
                      q.option_c ? { key: 'C', text: q.option_c } : null,
                      q.option_d ? { key: 'D', text: q.option_d } : null,
                    ]
                      .filter(Boolean)
                      .map((opt) => {
                        const isSelected = currentAns === opt.key;
                        return (
                          <div
                            key={opt.key}
                            onClick={() => handleSelectOption(q.id, opt.key)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 14px',
                              borderRadius: '12px',
                              border: `2px solid ${isSelected ? 'var(--primary-rose)' : 'var(--border-subtle)'}`,
                              background: isSelected ? 'var(--primary-rose-light)' : '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 0.18s ease',
                            }}
                          >
                            <span
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '800',
                                fontSize: '0.84rem',
                                background: isSelected ? 'var(--primary-rose)' : '#f1f5f9',
                                color: isSelected ? '#ffffff' : '#64748b',
                                flexShrink: 0,
                              }}
                            >
                              {opt.key}
                            </span>
                            <span
                              style={{
                                fontSize: '0.92rem',
                                fontWeight: isSelected ? '700' : '500',
                                color: isSelected ? 'var(--primary-rose-text)' : 'var(--text-main)',
                              }}
                            >
                              {opt.text}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '14px 22px', fontSize: '1rem', justifyContent: 'center' }}
            disabled={submitting}
          >
            {submitting ? 'Evaluating your answers...' : 'Submit My Answers 🐹✨'}
          </button>
        </form>
      </div>
    </div>
  );
}
