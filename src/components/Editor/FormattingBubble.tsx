import React from 'react';
import type { AppLanguage } from '../../types';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code, 
  Highlighter 
} from 'lucide-react';

export type FormatType = 
  | 'bold' 
  | 'italic' 
  | 'underline' 
  | 'strike' 
  | 'code' 
  | 'hl-yellow' 
  | 'hl-green' 
  | 'hl-blue' 
  | 'hl-purple' 
  | 'hl-pink' 
  | 'hl-orange';

interface FormattingBubbleProps {
  position: { top: number; left: number };
  lang?: AppLanguage;
  onApplyFormat: (format: FormatType) => void;
  onClose?: () => void;
}

export const FormattingBubble: React.FC<FormattingBubbleProps> = ({
  position,
  lang = 'vi',
  onApplyFormat,
}) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const isEn = lang === 'en';

  const HIGHLIGHT_COLORS: { id: FormatType; name: string; bg: string; border: string }[] = [
    { id: 'hl-yellow', name: isEn ? 'Yellow' : 'Vàng', bg: '#eab308', border: '#ca8a04' },
    { id: 'hl-green', name: isEn ? 'Green' : 'Xanh lá', bg: '#10b981', border: '#059669' },
    { id: 'hl-blue', name: isEn ? 'Blue' : 'Xanh biển', bg: '#0ea5e9', border: '#0284c7' },
    { id: 'hl-purple', name: isEn ? 'Purple' : 'Tím', bg: '#a855f7', border: '#9333ea' },
    { id: 'hl-pink', name: isEn ? 'Pink' : 'Hồng', bg: '#f43f5e', border: '#e11d48' },
    { id: 'hl-orange', name: isEn ? 'Orange' : 'Cam', bg: '#f97316', border: '#ea580c' },
  ];

  return (
    <div 
      className="formatting-bubble-toolbar"
      style={{
        top: position.top,
        left: position.left,
      }}
      onMouseDown={(e) => {
        // Crucial: prevents blurring input/textarea so selection is retained
        e.preventDefault();
      }}
    >
      {/* Bold */}
      <button
        type="button"
        className="fmt-bubble-btn"
        onClick={() => onApplyFormat('bold')}
        title={isEn ? "Bold (Ctrl+B / ⌘B)" : "In đậm (Ctrl+B / ⌘B)"}
      >
        <Bold size={14} strokeWidth={2.8} />
      </button>

      {/* Italic */}
      <button
        type="button"
        className="fmt-bubble-btn"
        onClick={() => onApplyFormat('italic')}
        title={isEn ? "Italic (Ctrl+I / ⌘I)" : "In nghiêng (Ctrl+I / ⌘I)"}
      >
        <Italic size={14} strokeWidth={2.4} />
      </button>

      {/* Underline */}
      <button
        type="button"
        className="fmt-bubble-btn"
        onClick={() => onApplyFormat('underline')}
        title={isEn ? "Underline (Ctrl+U / ⌘U)" : "Gạch chân (Ctrl+U / ⌘U)"}
      >
        <UnderlineIcon size={14} strokeWidth={2.4} />
      </button>

      {/* Strikethrough */}
      <button
        type="button"
        className="fmt-bubble-btn"
        onClick={() => onApplyFormat('strike')}
        title={isEn ? "Strikethrough (Ctrl+Shift+X / ⌘Shift+X)" : "Gạch ngang (Ctrl+Shift+X / ⌘Shift+X)"}
      >
        <Strikethrough size={14} strokeWidth={2.4} />
      </button>

      {/* Inline Code */}
      <button
        type="button"
        className="fmt-bubble-btn"
        onClick={() => onApplyFormat('code')}
        title={isEn ? "Inline Code (Ctrl+E / ⌘E)" : "Code nội dòng (Ctrl+E / ⌘E)"}
      >
        <Code size={14} strokeWidth={2.4} />
      </button>

      <div className="fmt-bubble-divider" />

      {/* Highlight Toggle Button */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          className={`fmt-bubble-btn ${showColorPicker ? 'active' : ''}`}
          onClick={() => setShowColorPicker(!showColorPicker)}
          title={isEn ? "Highlight Color (Ctrl+Shift+H)" : "Đánh dấu màu highlight (Ctrl+Shift+H)"}
        >
          <Highlighter size={14} strokeWidth={2.4} color="#eab308" />
        </button>

        {showColorPicker && (
          <div 
            className="fmt-bubble-colors-popover"
            onMouseDown={(e) => e.preventDefault()}
          >
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                className="fmt-color-dot-btn"
                style={{ backgroundColor: c.bg, borderColor: c.border }}
                onClick={() => {
                  onApplyFormat(c.id);
                  setShowColorPicker(false);
                }}
                title={c.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
