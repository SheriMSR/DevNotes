import React, { useState } from 'react';
import type { AccentColor, BackgroundTheme, AppLanguage } from '../../types';
import { t } from '../../i18n/translations';
import { X, Palette, Check, Monitor, Sparkles } from 'lucide-react';

interface ThemePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccent: AccentColor;
  onSelectAccent: (accent: AccentColor) => void;
  currentBg: BackgroundTheme;
  onSelectBg: (bg: BackgroundTheme) => void;
  lang: AppLanguage;
}

interface BackgroundOption {
  id: BackgroundTheme;
  name: string;
  bgHex: string;
  borderHex: string;
  textHex: string;
  descVi: string;
  descEn: string;
}

interface AccentOption {
  id: AccentColor;
  name: string;
  color: string;
  descVi: string;
  descEn: string;
}

export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({
  isOpen,
  onClose,
  currentAccent,
  onSelectAccent,
  currentBg,
  onSelectBg,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'background' | 'accent'>('background');

  if (!isOpen) return null;

  const isVi = lang === 'vi';

  const bgOptions: BackgroundOption[] = [
    {
      id: 'midnight',
      name: 'Deep Midnight',
      bgHex: '#090d16',
      borderHex: '#1c263c',
      textHex: '#f8fafc',
      descVi: 'Đen xanh công nghệ sâu lắng (Mặc định)',
      descEn: 'Deep cyber dark blue (Default)',
    },
    {
      id: 'black',
      name: 'Pitch Black OLED',
      bgHex: '#000000',
      borderHex: '#27272a',
      textHex: '#ffffff',
      descVi: 'Đen tuyết đối 100%, tiết kiệm pin và tương phản cao',
      descEn: 'Pure black, ultra high contrast, battery saving',
    },
    {
      id: 'charcoal',
      name: 'Obsidian Charcoal',
      bgHex: '#121316',
      borderHex: '#262930',
      textHex: '#f4f4f5',
      descVi: 'Xám than sang trọng theo phong cách Linear & Cursor',
      descEn: 'Sleek carbon charcoal style of Linear & Cursor',
    },
    {
      id: 'navy',
      name: 'Dracula Navy',
      bgHex: '#070c18',
      borderHex: '#18284c',
      textHex: '#f0f6fc',
      descVi: 'Sắc xanh đêm thẫm phong cách Dracula & GitHub Dark',
      descEn: 'Deep ocean dark navy inspired by Dracula & GitHub',
    },
    {
      id: 'nord',
      name: 'Nordic Polar',
      bgHex: '#242933',
      borderHex: '#434c5e',
      textHex: '#eceff4',
      descVi: 'Tông xanh tuyết Bắc Âu êm dịu, không mỏi mắt',
      descEn: 'Cool Arctic frost palette from the Nord theme',
    },
    {
      id: 'light',
      name: 'Paper Light',
      bgHex: '#f8fafc',
      borderHex: '#e2e8f0',
      textHex: '#0f172a',
      descVi: 'Nền sáng tối giản, thanh lịch cho ban ngày',
      descEn: 'Clean minimalist bright theme for daytime reading',
    },
    {
      id: 'sepia',
      name: 'Warm Sepia',
      bgHex: '#fbf7ee',
      borderHex: '#ede3c8',
      textHex: '#3d3222',
      descVi: 'Sắc giấy vàng cổ điển ấm áp, chống mỏi mắt khi đọc lâu',
      descEn: 'Warm vintage parchment paper, cozy for extended study',
    },
  ];

  const accentOptions: AccentOption[] = [
    { id: 'indigo', name: 'Cyber Indigo', color: '#6366f1', descVi: 'Sắc tím công nghệ hiện đại (Mặc định)', descEn: 'Modern cyber purple (Default)' },
    { id: 'emerald', name: 'Emerald Terminal', color: '#10b981', descVi: 'Xanh ngọc ma trận lập trình viên', descEn: 'Developer terminal matrix green' },
    { id: 'sky', name: 'Midnight Sky', color: '#0ea5e9', descVi: 'Xanh dương sáng tạo, thanh lịch', descEn: 'Elegant creative sky blue' },
    { id: 'rose', name: 'Neon Rose', color: '#f43f5e', descVi: 'Đỏ hồng nổi bật, cá tính', descEn: 'Vibrant neon red accent' },
    { id: 'amber', name: 'Sunset Amber', color: '#f59e0b', descVi: 'Cam vàng ấm áp, tràn đầy năng lượng', descEn: 'Warm energetic amber gold' },
    { id: 'violet', name: 'Ultra Violet', color: '#a855f7', descVi: 'Tím mộng mơ, chiều sâu thị giác', descEn: 'Dreamy deep purple' },
    { id: 'mono', name: 'Monochrome Jet', color: '#94a3b8', descVi: 'Xám đen tối giản', descEn: 'Minimalist sleek grayscale' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Palette size={20} color="var(--primary)" />
              <span>{isVi ? 'Tùy Chỉnh Toàn Diện Giao Diện' : 'Theme & Palette Customization'}</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: 4 }}>
              {isVi ? 'Thay đổi linh hoạt cả Màu Nền (Background) và Màu Nhấn (Accent Color) theo sở thích.' : 'Customize both your Background Theme and Accent Color.'}
            </p>
          </div>
          <button className="icon-btn-ghost" onClick={onClose} title="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* Tabs Bar */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10, marginBottom: 16 }}>
          <button
            className={`btn-secondary ${activeTab === 'background' ? 'active' : ''}`}
            onClick={() => setActiveTab('background')}
            style={{
              background: activeTab === 'background' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'background' ? 'var(--primary)' : 'var(--text-secondary)',
              borderColor: activeTab === 'background' ? 'var(--primary)' : 'transparent',
              fontWeight: 600,
            }}
          >
            <Monitor size={14} />
            <span>{isVi ? '1. Màu Nền (Background)' : '1. Background Themes'}</span>
          </button>

          <button
            className={`btn-secondary ${activeTab === 'accent' ? 'active' : ''}`}
            onClick={() => setActiveTab('accent')}
            style={{
              background: activeTab === 'accent' ? 'var(--primary-light)' : 'transparent',
              color: activeTab === 'accent' ? 'var(--primary)' : 'var(--text-secondary)',
              borderColor: activeTab === 'accent' ? 'var(--primary)' : 'transparent',
              fontWeight: 600,
            }}
          >
            <Sparkles size={14} />
            <span>{isVi ? '2. Màu Nhấn (Accent Tint)' : '2. Accent Color'}</span>
          </button>
        </div>

        {/* Tab 1: Background Themes */}
        {activeTab === 'background' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {bgOptions.map((bg) => {
              const isSelected = currentBg === bg.id;
              return (
                <div
                  key={bg.id}
                  onClick={() => onSelectBg(bg.id)}
                  style={{
                    background: bg.bgHex,
                    color: bg.textHex,
                    border: `2px solid ${isSelected ? 'var(--primary)' : bg.borderHex}`,
                    borderRadius: 12,
                    padding: 14,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 14px var(--primary-light)' : 'var(--shadow-sm)',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{bg.name}</span>
                    {isSelected && (
                      <span style={{ background: 'var(--primary)', color: 'white', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.74rem', opacity: 0.75, lineHeight: 1.4 }}>
                    {isVi ? bg.descVi : bg.descEn}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Accent Colors */}
        {activeTab === 'accent' && (
          <div className="theme-palette-grid">
            {accentOptions.map((p) => {
              const isSelected = currentAccent === p.id;
              return (
                <div
                  key={p.id}
                  className={`theme-swatch-card ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelectAccent(p.id)}
                >
                  <div
                    className="color-dot-preview"
                    style={{
                      backgroundColor: p.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: isSelected ? `0 0 12px ${p.color}` : 'none',
                    }}
                  >
                    {isSelected && <Check size={16} strokeWidth={3} />}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {isVi ? p.descVi : p.descEn}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="btn-primary" onClick={onClose}>
            <span>{t(lang, 'applyColorBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
