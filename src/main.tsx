import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global macOS Native Window Drag Handler for WKWebView & Cocoa
if (typeof window !== 'undefined') {
  window.addEventListener(
    'mousedown',
    (e: MouseEvent) => {
      // Only handle left mouse button
      if (e.button !== 0) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Skip interactive controls
      if (
        target.closest(
          'button, input, textarea, select, a, [data-no-drag], .cm-editor, .studio-lang-dropdown-menu, .studio-lang-selector-btn, .modal-content, .slash-menu-container'
        )
      ) {
        return;
      }

      // Check if clicked in a titlebar or drag region
      const dragArea = target.closest(
        '.top-navbar, .sidebar-header, .macos-titlebar, .macos-traffic-light-spacer, .macos-address-capsule, [data-drag-region]'
      );
      if (dragArea) {
        const webkit = (window as unknown as { webkit?: { messageHandlers?: { performWindowDrag?: { postMessage: (msg: string) => void } } } }).webkit;
        if (webkit?.messageHandlers?.performWindowDrag) {
          webkit.messageHandlers.performWindowDrag.postMessage('drag');
        }
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
