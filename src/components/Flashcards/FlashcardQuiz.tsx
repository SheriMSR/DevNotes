import React, { useState } from 'react';
import type { FlashcardItem } from '../../types';
import confetti from 'canvas-confetti';
import { 
  BrainCircuit, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Plus
} from 'lucide-react';

interface FlashcardQuizProps {
  cards: FlashcardItem[];
  onUpdateCards: (cards: FlashcardItem[]) => void;
}

export const FlashcardQuiz: React.FC<FlashcardQuizProps> = ({
  cards,
  onUpdateCards,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  // New card form
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed all cards!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRate = (difficulty: 'easy' | 'medium' | 'hard') => {
    setReviewedCount((prev) => prev + 1);
    const updated = [...cards];
    updated[currentIndex] = {
      ...updated[currentIndex],
      difficulty,
      lastReviewed: Date.now(),
    };
    onUpdateCards(updated);
    handleNext();
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    const newCard: FlashcardItem = {
      id: 'fc-' + Math.random().toString(36).substring(2, 9),
      question,
      answer,
      category: category || 'General',
      codeSnippet: codeSnippet || undefined,
      difficulty: 'medium',
    };

    onUpdateCards([...cards, newCard]);
    setIsAdding(false);
    setQuestion('');
    setAnswer('');
    setCategory('');
    setCodeSnippet('');
  };

  if (!currentCard) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Chưa có Flashcard nào. Hãy tạo thêm flashcard để ôn tập!</p>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="flashcards-container">
      {/* Header */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BrainCircuit size={24} color="#a855f7" />
            <span>Ôn Tập Spaced Repetition</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Rèn luyện phản xạ cú pháp và suy luận output trước khi chạy code.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={14} />
          <span>Thêm Flashcard</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
          <span>Thẻ {currentIndex + 1} / {cards.length} {reviewedCount > 0 && `(Đã lật: ${reviewedCount} lượt)`}</span>
          <span>{progressPercent}% hoàn thành</span>
        </div>
        <div style={{ width: '100%', height: 6, background: 'var(--bg-surface-active)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* 3D Flip Card */}
      <div className="flashcard-wrapper" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="flashcard-front">
            <span className="tag-pill" style={{ position: 'absolute', top: 16, left: 16 }}>
              {currentCard.category}
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: 540, lineHeight: 1.5 }}>
              {currentCard.question}
            </div>

            {currentCard.codeSnippet && (
              <pre style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-code)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#38bdf8', maxWidth: '100%', overflowX: 'auto', textAlign: 'left' }}>
                {currentCard.codeSnippet}
              </pre>
            )}

            <div style={{ position: 'absolute', bottom: 16, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <RotateCw size={14} />
              <span>Bấm vào thẻ để lật xem đáp án</span>
            </div>
          </div>

          {/* Back */}
          <div className="flashcard-back">
            <span className="tag-pill" style={{ position: 'absolute', top: 16, left: 16, borderColor: '#10b981', color: '#10b981' }}>
              Đáp án & Giải thích
            </span>

            <div style={{ fontSize: '1.15rem', color: '#f8fafc', maxWidth: 540, lineHeight: 1.6, textAlign: 'center' }}>
              {currentCard.answer}
            </div>

            <div style={{ position: 'absolute', bottom: 16, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <RotateCw size={14} />
              <span>Bấm để quay lại mặt trước</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating & Actions Bar */}
      {isFlipped && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Mức độ tự đánh giá:</span>
          <button 
            className="btn-secondary" 
            onClick={(e) => { e.stopPropagation(); handleRate('hard'); }}
            style={{ color: '#f43f5e' }}
          >
            😰 Cần ôn lại
          </button>
          <button 
            className="btn-secondary" 
            onClick={(e) => { e.stopPropagation(); handleRate('medium'); }}
            style={{ color: '#f59e0b' }}
          >
            🤔 Vừa phải
          </button>
          <button 
            className="btn-secondary" 
            onClick={(e) => { e.stopPropagation(); handleRate('easy'); }}
            style={{ color: '#10b981' }}
          >
            😎 Đã nắm chắc
          </button>
        </div>
      )}

      {/* Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn-secondary" onClick={handlePrev} disabled={currentIndex === 0}>
          <ChevronLeft size={16} />
          <span>Thẻ trước</span>
        </button>

        <button className="btn-primary" onClick={handleNext}>
          <span>{currentIndex === cards.length - 1 ? 'Hoàn thành 🎉' : 'Thẻ tiếp theo'}</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Modal Add Flashcard */}
      {isAdding && (
        <form onSubmit={handleCreateCard} style={{ marginTop: 24, width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>Tạo Flashcard Ôn Tập Mới</h3>
          <input
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Câu hỏi kiểm tra kiến thức..."
            style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: 6, fontSize: '0.86rem', marginBottom: 12 }}
          />
          <textarea
            required
            rows={3}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Câu trả lời chi tiết..."
            style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: 6, fontSize: '0.86rem', marginBottom: 12 }}
          />
          <input
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            placeholder="Đoạn code ví dụ nếu có (tuỳ chọn)..."
            style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: 6, fontSize: '0.84rem', fontFamily: 'var(--font-mono)', marginBottom: 12 }}
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Chủ đề (ví dụ: JavaScript, SQL, Algorithms)..."
            style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', padding: '8px 12px', borderRadius: 6, fontSize: '0.86rem', marginBottom: 16 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>Hủy</button>
            <button type="submit" className="btn-primary">Lưu thẻ</button>
          </div>
        </form>
      )}
    </div>
  );
};
