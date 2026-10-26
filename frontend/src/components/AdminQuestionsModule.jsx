import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, HelpCircle, X, Check } from 'lucide-react';
import { api } from '../api';
import ConfirmModal from './ConfirmModal';

export default function AdminQuestionsModule() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ text: '', type: '' });

  // Custom Confirm/Alert Modal State
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

  const [formData, setFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    explanation: '',
    is_active: true,
  });

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 4000);
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.adminGetQuestions();
      setQuestions(res.results || res || []);
    } catch (err) {
      showToast(err.message || 'Failed to load verification questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormData({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A',
      explanation: '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setFormData({
      question_text: q.question_text || '',
      option_a: q.option_a || '',
      option_b: q.option_b || '',
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_option: q.correct_option || 'A',
      explanation: q.explanation || '',
      is_active: q.is_active ?? true,
    });
    setModalOpen(true);
  };

  const handleDelete = (id, text) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Question?',
      message: `Sigurado ka bang nais mong tanggalin ang tanong na:\n\n"${text.substring(0, 70)}..."?`,
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        try {
          await api.adminDeleteQuestion(id);
          showToast('Question deleted successfully!');
          loadQuestions();
        } catch (err) {
          showToast(err.message || 'Failed to delete question', 'error');
        }
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question_text.trim() || !formData.option_a.trim() || !formData.option_b.trim()) {
      showToast('Please provide a question and at least Option A and Option B.', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingQuestion) {
        await api.adminUpdateQuestion(editingQuestion.id, formData);
        showToast('Question updated successfully!');
      } else {
        await api.adminCreateQuestion(formData);
        showToast('New question created successfully!');
      }
      setModalOpen(false);
      loadQuestions();
    } catch (err) {
      showToast(err.message || 'Failed to save question', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {toast.text && (
        <div className={`toast-banner ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.text}</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🐹 Hamster Verification Questions ({questions.length})</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
            Ang mga tanong na ito ang sasagutan ng mga participants bago makapasok sa kanilang dashboard.
          </p>
        </div>

        <button className="btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Add New Question</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="empty-box" style={{ padding: '40px 20px' }}>
          <HelpCircle size={36} color="var(--primary-rose)" />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>Walang verification questions pa!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
              Mag-add ng mga tanong para masubok kung sino ang tunay na La Familia Hamster Corp member!
            </p>
          </div>
          <button className="btn-primary" onClick={handleOpenAdd} style={{ marginTop: '8px' }}>
            <Plus size={18} />
            <span>Gumawa ng Unang Tanong</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {questions.map((q, idx) => (
            <div
              key={q.id}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '18px',
                padding: '22px 20px',
                boxShadow: '0 4px 16px rgba(58, 38, 30, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span
                    style={{
                      background: 'var(--primary-rose)',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '0.8rem',
                      padding: '3px 9px',
                      borderRadius: '8px',
                      flexShrink: 0,
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '1.08rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.4' }}>
                      {q.question_text}
                    </h3>
                    {q.explanation && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '4px', fontStyle: 'italic' }}>
                        💡 Note: {q.explanation}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    onClick={() => handleOpenEdit(q)}
                    title="Edit Question"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    className="btn-icon-danger"
                    onClick={() => handleDelete(q.id, q.question_text)}
                    title="Delete Question"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Options Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                {[
                  { key: 'A', text: q.option_a },
                  { key: 'B', text: q.option_b },
                  q.option_c ? { key: 'C', text: q.option_c } : null,
                  q.option_d ? { key: 'D', text: q.option_d } : null,
                ]
                  .filter(Boolean)
                  .map((opt) => {
                    const isCorrect = q.correct_option === opt.key;
                    return (
                      <div
                        key={opt.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          background: isCorrect ? '#ecfdf5' : '#f8fafc',
                          border: `1.5px solid ${isCorrect ? '#10b981' : 'var(--border-subtle)'}`,
                        }}
                      >
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '0.78rem',
                            background: isCorrect ? '#10b981' : '#e2e8f0',
                            color: isCorrect ? '#ffffff' : '#64748b',
                            flexShrink: 0,
                          }}
                        >
                          {opt.key}
                        </span>
                        <span
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: isCorrect ? '800' : '500',
                            color: isCorrect ? '#065f46' : 'var(--text-main)',
                            flex: 1,
                          }}
                        >
                          {opt.text}
                        </span>
                        {isCorrect && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: '800',
                              color: '#059669',
                              background: '#d1fae5',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                            }}
                          >
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Question Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-dialog" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingQuestion ? 'Edit Verification Question' : 'Create New Verification Question'}
              </h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Question Text *</label>
                <textarea
                  className="modal-clean-input"
                  rows={3}
                  placeholder="Halimbawa: Ano ang official snack ng La Familia Hamster Corp?"
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Option A *</label>
                  <input
                    type="text"
                    className="modal-clean-input"
                    placeholder="Choice A"
                    value={formData.option_a}
                    onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Option B *</label>
                  <input
                    type="text"
                    className="modal-clean-input"
                    placeholder="Choice B"
                    value={formData.option_b}
                    onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Option C (optional)</label>
                  <input
                    type="text"
                    className="modal-clean-input"
                    placeholder="Choice C"
                    value={formData.option_c}
                    onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Option D (optional)</label>
                  <input
                    type="text"
                    className="modal-clean-input"
                    placeholder="Choice D"
                    value={formData.option_d}
                    onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tamang Sagot (Correct Option) *</label>
                <select
                  className="modal-clean-input"
                  value={formData.correct_option}
                  onChange={(e) => setFormData({ ...formData, correct_option: e.target.value })}
                  required
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  {formData.option_c && <option value="C">Option C</option>}
                  {formData.option_d && <option value="D">Option D</option>}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Explanation / Fun Note (optional)</label>
                <input
                  type="text"
                  className="modal-clean-input"
                  placeholder="Bakit ito ang tamang sagot?"
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        {...confirmState}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
