import React from 'react';
import type { AppLanguage } from '../../types';
import { t } from '../../i18n/translations';
import { X, Columns, Code2, BrainCircuit, Sparkles, BookOpen, Layers } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  const isVi = lang === 'vi';

  const steps = [
    {
      num: 1,
      icon: <BookOpen size={18} color="#6366f1" />,
      title: isVi ? '1. Ghi chú Notion & Live Code Runner' : '1. Notion Notes & Executable Code Runners',
      desc: isVi 
        ? 'Viết bài học theo dạng block (tiêu đề, callout ghi nhớ, checklist). Mỗi đoạn code có nút ▶ Run để thực thi trực tiếp trên trình duyệt (JavaScript, Python WASM, SQL SQLite WASM, HTML) với console log tức thì.'
        : 'Take notes in flexible Notion-style blocks (headings, tips, checklists). Every code block features a ▶ Run button to execute client-side (JavaScript, Python WASM, SQLite WASM, HTML/CSS) with instant console output.',
    },
    {
      num: 2,
      icon: <Columns size={18} color="#10b981" />,
      title: isVi ? '2. Màn hình kép Split Studio' : '2. Dual-Pane Split Studio',
      desc: isVi
        ? 'Mở bài học ở cột trái để đọc lý thuyết, đồng thời mở Code Sandbox ở cột phải để thực hành và thử nghiệm ý tưởng mới mà không làm ảnh hưởng bài học gốc.'
        : 'Keep lesson notes on the left for reference while coding freely in the right sandbox playground, complete with multi-language tabs and live preview.',
    },
    {
      num: 3,
      icon: <Layers size={18} color="#0ea5e9" />,
      title: isVi ? '3. Phân loại & Quản lý Tags động trên Dashboard' : '3. Dynamic Categorization & Tag Filtering',
      desc: isVi
        ? 'Tổ chức bài học theo Danh mục (Frontend, Backend, Database) và các Tags linh hoạt. Bạn có thể tạo thêm tag mới bất cứ lúc nào để lọc nhanh chủ đề đang học.'
        : 'Organize lessons by Category and dynamic tags. Create custom tags on the fly to cluster and filter topics quickly.',
    },
    {
      num: 4,
      icon: <Code2 size={18} color="#f59e0b" />,
      title: isVi ? '4. Kho Snippets & Xuất VS Code' : '4. Snippet Vault & Export to VS Code',
      desc: isVi
        ? 'Lưu lại các hàm tiện ích hay dùng. Nhấn "Xuất VS Code Snippets" để tải về file `.code-snippets` đưa thẳng vào thư mục `.vscode/` làm việc hàng ngày.'
        : 'Store frequently used functions. Click "Export VS Code Snippets" to download a ready-to-use `.code-snippets` file for your local IDE.',
    },
    {
      num: 5,
      icon: <BrainCircuit size={18} color="#a855f7" />,
      title: isVi ? '5. Ôn tập Flashcards (Spaced Repetition)' : '5. Spaced Repetition Flashcards',
      desc: isVi
        ? 'Rèn luyện phản xạ cú pháp và suy đoán kết quả chạy code bằng flashcards 3D, đánh giá mức độ ghi nhớ để lặp lại thông minh.'
        : 'Reinforce your syntax memory and predict code outputs with 3D interactive flashcards and difficulty self-grading.',
    },
    {
      num: 6,
      icon: <Sparkles size={18} color="#f43f5e" />,
      title: isVi ? '6. Tùy biến màu sắc & Đóng gói Desktop App' : '6. Accent Colors & Native macOS App',
      desc: isVi
        ? 'Dễ dàng đổi bảng màu chủ đạo của app (Indigo, Emerald, Sky, Rose, Amber...) và chạy `./build_app.sh` để xuất thành file DevNotes.app chạy trực tiếp trên macOS!'
        : 'Personalize with curated accent palettes and run `./build_app.sh` to package a lightweight standalone DevNotes.app for macOS!',
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={20} color="var(--primary)" />
              <span>{t(lang, 'tutorialModalTitle')}</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: 4 }}>
              {t(lang, 'tutorialModalSubtitle')}
            </p>
          </div>
          <button className="icon-btn-ghost" onClick={onClose} title="Đóng">
            <X size={18} />
          </button>
        </div>

        <div>
          {steps.map((step) => (
            <div key={step.num} className="tutorial-step-card">
              <div className="tutorial-step-number">{step.num}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '0.94rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                  {step.icon}
                  <span>{step.title}</span>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn-primary" onClick={onClose}>
            <span>{t(lang, 'gotItBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
