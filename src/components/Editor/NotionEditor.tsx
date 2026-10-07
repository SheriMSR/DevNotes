import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { Page, Block, BlockType, LanguageId, AppLanguage } from '../../types';
import { BlockItem } from './BlockItem';
import { SlashMenu, type SlashMenuItem, getSlashMenuItems } from './SlashMenu';
import { BlockActionMenu, TURN_OPTIONS } from './BlockActionMenu';
import { t } from '../../i18n/translations';
import { 
  Plus, 
  Tag as TagIcon,
  FolderOpen,
  Check,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  GripVertical,
  Trash2,
  Undo2,
  Redo2,
  Copy,
  Layers,
  Type
} from 'lucide-react';

interface NotionEditorProps {
  page: Page;
  lang?: AppLanguage;
  allAvailableTags?: string[];
  onAddCustomTag?: (newTag: string) => void;
  onDeleteTag?: (tag: string) => void;
  onUpdatePage: (updatedPage: Page) => void;
  onSendToStudio?: (code: string, language: LanguageId) => void;
}

interface SlashMenuState {
  blockId: string;
  query: string;
  position: { top: number; left: number };
}

interface BlockMenuState {
  blockId: string;
  position: { top: number; left: number };
}

// Tree navigation & manipulation helpers
interface BlockLoc {
  block: Block;
  parent: Block | null;
  index: number;
  siblings: Block[];
}

function findBlockLoc(blocks: Block[], targetId: string, parent: Block | null = null): BlockLoc | null {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].id === targetId) {
      return { block: blocks[i], parent, index: i, siblings: blocks };
    }
    if (blocks[i].children && blocks[i].children!.length > 0) {
      const found = findBlockLoc(blocks[i].children!, targetId, blocks[i]);
      if (found) return found;
    }
  }
  return null;
}

function isDescendantOf(blocks: Block[], potentialParentId: string, targetId: string): boolean {
  const parentLoc = findBlockLoc(blocks, potentialParentId);
  if (!parentLoc) return false;
  
  function checkChildren(list?: Block[]): boolean {
    if (!list) return false;
    for (const b of list) {
      if (b.id === targetId) return true;
      if (checkChildren(b.children)) return true;
    }
    return false;
  }
  return checkChildren(parentLoc.block.children);
}

function removeBlockFromTree(blocks: Block[], targetId: string): { newBlocks: Block[]; removed: Block | null } {
  let removed: Block | null = null;
  function traverse(list: Block[]): Block[] {
    const result: Block[] = [];
    for (const item of list) {
      if (item.id === targetId) {
        removed = item;
      } else {
        const cloned = { ...item };
        if (cloned.children && cloned.children.length > 0) {
          cloned.children = traverse(cloned.children);
        }
        result.push(cloned);
      }
    }
    return result;
  }
  return { newBlocks: traverse(blocks), removed };
}

function updateBlockInTree(blocks: Block[], updated: Block): Block[] {
  return blocks.map((b) => {
    if (b.id === updated.id) {
      return { ...updated, children: updated.children || b.children };
    }
    if (b.children && b.children.length > 0) {
      return { ...b, children: updateBlockInTree(b.children, updated) };
    }
    return b;
  });
}

function deleteBlockFromTree(blocks: Block[], targetId: string): Block[] {
  return blocks
    .filter((b) => b.id !== targetId)
    .map((b) => {
      if (b.children && b.children.length > 0) {
        return { ...b, children: deleteBlockFromTree(b.children, targetId) };
      }
      return b;
    });
}

export const NotionEditor: React.FC<NotionEditorProps> = ({
  page,
  lang = 'vi',
  allAvailableTags = [],
  onAddCustomTag,
  onDeleteTag,
  onUpdatePage,
  onSendToStudio,
}) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Undo & Redo History State
  const [undoStack, setUndoStack] = useState<Page[]>([]);
  const [redoStack, setRedoStack] = useState<Page[]>([]);

  const pageRef = useRef<Page>(page);
  pageRef.current = page;

  const undoStackRef = useRef<Page[]>(undoStack);
  undoStackRef.current = undoStack;

  const redoStackRef = useRef<Page[]>(redoStack);
  redoStackRef.current = redoStack;

  const prevPageIdRef = useRef<string>(page.id);

  // Deep clone a Page snapshot for history tracking
  const clonePage = (p: Page): Page => ({
    ...p,
    tags: [...(p.tags || [])],
    blocks: JSON.parse(JSON.stringify(p.blocks || [])),
  });

  // Typing debounce session tracker
  const typingSessionRef = useRef<{
    timer: ReturnType<typeof setTimeout> | null;
    initialSnapshot: Page | null;
    targetId?: string;
  }>({
    timer: null,
    initialSnapshot: null,
  });

  // Flush any pending typing snapshot into undo stack
  const flushPendingTypingSession = useCallback(() => {
    if (typingSessionRef.current.timer) {
      clearTimeout(typingSessionRef.current.timer);
      typingSessionRef.current.timer = null;
    }
    if (typingSessionRef.current.initialSnapshot) {
      const snapshot = typingSessionRef.current.initialSnapshot;
      typingSessionRef.current.initialSnapshot = null;
      setUndoStack((prev) => {
        const next = [...prev, snapshot];
        return next.length > 50 ? next.slice(next.length - 50) : next;
      });
      setRedoStack([]);
    }
  }, []);

  // Record discrete action immediately (add block, delete block, convert, split, paste, tags, etc.)
  const recordDiscreteAction = useCallback(() => {
    flushPendingTypingSession();
    const currentSnapshot = clonePage(pageRef.current);
    setUndoStack((prev) => {
      const next = [...prev, currentSnapshot];
      return next.length > 50 ? next.slice(next.length - 50) : next;
    });
    setRedoStack([]);
  }, [flushPendingTypingSession]);

  // Record continuous typing action with ~750ms debounce session
  const recordTypingAction = useCallback((targetId: string) => {
    if (typingSessionRef.current.initialSnapshot && typingSessionRef.current.targetId !== targetId) {
      flushPendingTypingSession();
    }

    if (!typingSessionRef.current.initialSnapshot) {
      typingSessionRef.current.initialSnapshot = clonePage(pageRef.current);
      typingSessionRef.current.targetId = targetId;
    }

    if (typingSessionRef.current.timer) {
      clearTimeout(typingSessionRef.current.timer);
    }

    typingSessionRef.current.timer = setTimeout(() => {
      flushPendingTypingSession();
    }, 750);
  }, [flushPendingTypingSession]);

  // Reset history when switching to a different note
  useEffect(() => {
    if (prevPageIdRef.current !== page.id) {
      prevPageIdRef.current = page.id;
      setUndoStack([]);
      setRedoStack([]);
      if (typingSessionRef.current.timer) {
        clearTimeout(typingSessionRef.current.timer);
      }
      typingSessionRef.current = { timer: null, initialSnapshot: null };
    }
  }, [page.id]);

  // Undo Handler
  const handleUndo = useCallback(() => {
    flushPendingTypingSession();

    const currentUndo = undoStackRef.current;
    if (currentUndo.length === 0) return;

    const prevSnapshot = currentUndo[currentUndo.length - 1];
    const newUndo = currentUndo.slice(0, currentUndo.length - 1);
    const currentSnapshot = clonePage(pageRef.current);

    setUndoStack(newUndo);
    setRedoStack((prev) => [currentSnapshot, ...prev].slice(0, 50));

    onUpdatePage(prevSnapshot);
  }, [flushPendingTypingSession, onUpdatePage]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    flushPendingTypingSession();

    const currentRedo = redoStackRef.current;
    if (currentRedo.length === 0) return;

    const nextSnapshot = currentRedo[0];
    const newRedo = currentRedo.slice(1);
    const currentSnapshot = clonePage(pageRef.current);

    setRedoStack(newRedo);
    setUndoStack((prev) => [...prev, currentSnapshot].slice(-50));

    onUpdatePage(nextSnapshot);
  }, [flushPendingTypingSession, onUpdatePage]);

  // Global Keyboard Listener for Undo/Redo (Cmd+Z / Ctrl+Z, Cmd+Shift+Z / Ctrl+Shift+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isModifier = isMac ? e.metaKey : e.ctrlKey;
      if (!isModifier) return;

      const activeEl = document.activeElement;
      const container = editorContainerRef.current;
      // Only process if focus is inside this editor or document body
      if (container && activeEl && activeEl !== document.body && !container.contains(activeEl)) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handleUndo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        e.stopPropagation();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleUndo, handleRedo]);

  const [isTagMenuOpen, setIsTagMenuOpen] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const tagMenuRef = useRef<HTMLDivElement>(null);

  const [isAddBlockMenuOpen, setIsAddBlockMenuOpen] = useState(false);
  const addBlockMenuRef = useRef<HTMLDivElement>(null);

  const [slashMenuState, setSlashMenuState] = useState<SlashMenuState | null>(null);
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);
  const [blockMenuState, setBlockMenuState] = useState<BlockMenuState | null>(null);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  const isEn = lang === 'en';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addBlockMenuRef.current && !addBlockMenuRef.current.contains(e.target as Node)) {
        setIsAddBlockMenuOpen(false);
      }
    };
    if (isAddBlockMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAddBlockMenuOpen]);

  const handleUpdateBlock = (updatedBlock: Block) => {
    const loc = findBlockLoc(page.blocks, updatedBlock.id);
    const oldBlock = loc?.block;
    const isStructuralChange = !oldBlock ||
      oldBlock.type !== updatedBlock.type ||
      oldBlock.checked !== updatedBlock.checked ||
      oldBlock.language !== updatedBlock.language ||
      oldBlock.calloutMeta?.variant !== updatedBlock.calloutMeta?.variant ||
      oldBlock.toggleMeta?.isOpen !== updatedBlock.toggleMeta?.isOpen;

    if (isStructuralChange) {
      recordDiscreteAction();
    } else {
      recordTypingAction(updatedBlock.id);
    }

    const newBlocks = updateBlockInTree(page.blocks, updatedBlock);
    onUpdatePage({ ...page, blocks: newBlocks, updatedAt: Date.now() });
  };

  const handleDeleteBlock = (blockId: string) => {
    recordDiscreteAction();
    if (slashMenuState?.blockId === blockId) {
      setSlashMenuState(null);
    }
    if (blockMenuState?.blockId === blockId) {
      setBlockMenuState(null);
    }
    let newBlocks = deleteBlockFromTree(page.blocks, blockId);
    if (newBlocks.length === 0) {
      const defaultBlock = createNewBlock('text');
      newBlocks = [defaultBlock];
      setFocusedBlockId(defaultBlock.id);
    }
    onUpdatePage({ ...page, blocks: newBlocks, updatedAt: Date.now() });
  };

  const handleTurnBlockInto = (blockId: string, newType: BlockType) => {
    const loc = findBlockLoc(page.blocks, blockId);
    if (!loc) return;

    recordDiscreteAction();
    const current = loc.block;
    if (current.type === newType) return;

    // Convert type while strictly preserving content and children
    const updated: Block = {
      ...current,
      type: newType,
    };

    if (newType === 'todo') {
      if (typeof updated.checked !== 'boolean') {
        updated.checked = false;
      }
    } else if (newType === 'callout') {
      if (!updated.calloutMeta) {
        updated.calloutMeta = {
          variant: 'info',
          title: isEn ? 'Info' : 'Thông tin',
        };
      }
    } else if (newType === 'code') {
      if (!updated.language) {
        updated.language = 'javascript';
      }
    } else if (newType === 'flashcard') {
      if (!updated.flashcardMeta) {
        updated.flashcardMeta = {
          question: updated.content || (isEn ? 'Question / Prompt' : 'Khái niệm cần ghi nhớ'),
          answer: isEn ? 'Detailed explanation...' : 'Câu trả lời giải thích chi tiết...',
        };
      }
    } else if (newType === 'table') {
      if (!updated.tableMeta) {
        const col1 = 'col-' + Math.random().toString(36).substring(2, 6);
        const col2 = 'col-' + Math.random().toString(36).substring(2, 6);
        const row1 = 'row-' + Math.random().toString(36).substring(2, 6);
        updated.tableMeta = {
          columns: [
            { id: col1, name: isEn ? 'Item' : 'Mục', type: 'text' },
            { id: col2, name: isEn ? 'Description' : 'Mô tả', type: 'text' },
          ],
          rows: [
            { id: row1, cells: { [col1]: updated.content || (isEn ? 'Sample' : 'Ví dụ'), [col2]: '' } },
          ],
        };
      }
    } else if (newType === 'divider') {
      updated.content = '---';
    } else if (newType === 'toggle') {
      if (!updated.toggleMeta) {
        updated.toggleMeta = { isOpen: true };
      }
    }

    const updatedBlocks = updateBlockInTree(page.blocks, updated);
    onUpdatePage({
      ...page,
      blocks: updatedBlocks,
      updatedAt: Date.now(),
    });

    setFocusedBlockId(blockId);
  };

  const handleDuplicateBlock = (blockId: string) => {
    const loc = findBlockLoc(page.blocks, blockId);
    if (!loc) return;

    recordDiscreteAction();
    const original = loc.block;
    const duplicated: Block = {
      ...JSON.parse(JSON.stringify(original)),
      id: 'block-' + Math.random().toString(36).substring(2, 9),
    };

    function duplicateInList(list: Block[]): Block[] {
      const idx = list.findIndex((b) => b.id === blockId);
      if (idx !== -1) {
        const copy = [...list];
        copy.splice(idx + 1, 0, duplicated);
        return copy;
      }
      return list.map((b) => (b.children ? { ...b, children: duplicateInList(b.children) } : b));
    }

    const newBlocks = duplicateInList(page.blocks);
    onUpdatePage({
      ...page,
      blocks: newBlocks,
      updatedAt: Date.now(),
    });
    setFocusedBlockId(duplicated.id);
  };

  const handleUnnestBlock = (blockId: string) => {
    const loc = findBlockLoc(page.blocks, blockId);
    if (!loc || !loc.parent) return;

    recordDiscreteAction();
    const { newBlocks, removed } = removeBlockFromTree(page.blocks, blockId);
    if (!removed) return;

    function insertAfterParent(list: Block[]): Block[] {
      const pIdx = list.findIndex((b) => b.id === loc!.parent!.id);
      if (pIdx !== -1) {
        const copy = [...list];
        copy.splice(pIdx + 1, 0, removed!);
        return copy;
      }
      return list.map((b) => (b.children ? { ...b, children: insertAfterParent(b.children) } : b));
    }

    const updatedBlocks = insertAfterParent(newBlocks);
    onUpdatePage({ ...page, blocks: updatedBlocks, updatedAt: Date.now() });
    setFocusedBlockId(blockId);
  };

  const handleOpenBlockMenu = (blockId: string, anchorEl: HTMLElement) => {
    const rect = anchorEl.getBoundingClientRect();
    setBlockMenuState({
      blockId,
      position: {
        top: rect.bottom + 4,
        left: rect.left,
      },
    });
  };

  const createNewBlock = (
    type: BlockType, 
    language: LanguageId = 'javascript',
    calloutVariant: 'tip' | 'warning' | 'info' | 'concept' = 'tip'
  ): Block => {
    const newId = 'block-' + Math.random().toString(36).substring(2, 9);
    switch (type) {
      case 'code':
        return {
          id: newId,
          type: 'code',
          language,
          content: language === 'csharp'
            ? (isEn
                ? `// Write C# (.NET) code here\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from DevNotes C#!");\n    }\n}`
                : `// Viết code C# (.NET) tại đây\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Xin chào từ C# trong DevNotes!");\n    }\n}`)
            : language === 'bash'
            ? (isEn
                ? `#!/bin/bash\n# Write Bash commands here\necho "Hello from Bash Shell!"`
                : `#!/bin/bash\n# Viết lệnh Bash tại đây\necho "Xin chào từ DevNotes Bash Shell!"`)
            : language === 'sql'
            ? (isEn
                ? `-- Write SQL query\nCREATE TABLE students (id INT, name TEXT);\nINSERT INTO students VALUES (1, 'Alice'), (2, 'Bob');\nSELECT * FROM students;`
                : `-- Viết truy vấn SQL\nCREATE TABLE students (id INT, name TEXT);\nINSERT INTO students VALUES (1, 'Alice'), (2, 'Bob');\nSELECT * FROM students;`)
            : (isEn
                ? `// Write ${language} code here and press Run\nconsole.log("Hello from DevNotes!");`
                : `// Viết code ${language} tại đây và nhấn Run\nconsole.log("Hello from DevNotes!");`),
        };
      case 'callout': {
        const titleMap = isEn ? {
          tip: 'Pro Tip',
          warning: 'Important Warning',
          info: 'Additional Info',
          concept: 'Core Concept',
        } : {
          tip: 'Mẹo hay',
          warning: 'Cảnh báo quan trọng',
          info: 'Thông tin bổ sung',
          concept: 'Khái niệm cốt lõi',
        };
        const contentMap = isEn ? {
          tip: 'Helpful tip or best practice to remember...',
          warning: 'Key warning or common pitfall to avoid...',
          info: 'Extra background information or documentation note...',
          concept: 'Key definition or theoretical architecture note...',
        } : {
          tip: 'Nội dung ghi chú hoặc lưu ý quan trọng cần ghi nhớ...',
          warning: 'Lưu ý cảnh báo lỗi phổ biến cần tránh...',
          info: 'Thông tin chi tiết bổ sung cần nhớ...',
          concept: 'Khái niệm cốt lõi hoặc lý thuyết nền tảng...',
        };
        return {
          id: newId,
          type: 'callout',
          content: contentMap[calloutVariant],
          calloutMeta: { variant: calloutVariant, title: titleMap[calloutVariant] },
        };
      }
      case 'todo':
        return {
          id: newId,
          type: 'todo',
          content: isEn ? 'Task or exercise to practice' : 'Ghi chú nhiệm vụ hoặc bài tập cần luyện tập',
          checked: false,
        };
      case 'heading1':
        return {
          id: newId,
          type: 'heading1',
          content: isEn ? 'New Main Heading' : 'Tiêu đề chính mới',
        };
      case 'heading2':
        return {
          id: newId,
          type: 'heading2',
          content: isEn ? 'New Sub Heading' : 'Tiêu đề phụ mới',
        };
      case 'heading3':
        return {
          id: newId,
          type: 'heading3',
          content: isEn ? 'New Section Heading' : 'Tiêu đề nhỏ mới',
        };
      case 'bullet':
        return {
          id: newId,
          type: 'bullet',
          content: isEn ? 'Bulleted list item' : 'Mục danh sách gạch đầu dòng',
        };
      case 'numbered':
        return {
          id: newId,
          type: 'numbered',
          content: isEn ? 'Numbered step' : 'Mục danh sách thứ tự',
        };
      case 'flashcard':
        return {
          id: newId,
          type: 'flashcard',
          content: isEn ? 'What concept needs to be remembered?' : 'Khái niệm cần ghi nhớ là gì?',
          flashcardMeta: {
            question: isEn ? 'What concept needs to be remembered?' : 'Khái niệm cần ghi nhớ là gì?',
            answer: isEn ? 'Detailed explanation and answer...' : 'Câu trả lời giải thích chi tiết...',
          },
        };
      case 'columns': {
        const leftId = 'block-' + Math.random().toString(36).substring(2, 9);
        const rightId = 'block-' + Math.random().toString(36).substring(2, 9);
        return {
          id: newId,
          type: 'columns',
          content: '',
          columnsMeta: {
            leftRatio: 50,
            leftBlocks: [
              {
                id: leftId,
                type: 'heading2',
                content: isEn ? 'Left Column' : 'Cột 1 (Trái)',
              },
              {
                id: leftId + '-sub',
                type: 'text',
                content: isEn ? 'Enter content for left column...' : 'Nội dung ghi chú cho cột bên trái...',
              }
            ],
            rightBlocks: [
              {
                id: rightId,
                type: 'heading2',
                content: isEn ? 'Right Column' : 'Cột 2 (Phải)',
              },
              {
                id: rightId + '-sub',
                type: 'text',
                content: isEn ? 'Enter content for right column...' : 'Nội dung ghi chú cho cột bên phải...',
              }
            ],
          },
        };
      }
      case 'table': {
        const col1Id = 'col-page';
        const col2Id = 'col-tags';
        const col3Id = 'col-status';
        return {
          id: newId,
          type: 'table',
          content: 'My knowledge',
          tableMeta: {
            title: isEn ? 'My knowledge' : 'My knowledge',
            columns: [
              { id: col1Id, name: isEn ? 'Page' : 'Page', type: 'text', width: 260 },
              { id: col2Id, name: isEn ? 'Tags' : 'Tags', type: 'tags', width: 180 },
              { id: col3Id, name: isEn ? 'Status' : 'Status', type: 'status', width: 170 },
            ],
            rows: [
              { id: 'row-1', cells: { [col1Id]: 'Authentication, Authorization', [col2Id]: 'Security', [col3Id]: 'Done' } },
              { id: 'row-2', cells: { [col1Id]: 'Back-up DB', [col2Id]: 'DB - fundamentals', [col3Id]: 'Done' } },
              { id: 'row-3', cells: { [col1Id]: 'Change Tracking', [col2Id]: 'EF core', [col3Id]: 'Done' } },
              { id: 'row-4', cells: { [col1Id]: 'CI/CD', [col2Id]: 'DevOps', [col3Id]: 'In progress' } },
              { id: 'row-5', cells: { [col1Id]: 'Custom Validation Attribute', [col2Id]: 'Daily', [col3Id]: 'Done' } },
              { id: 'row-6', cells: { [col1Id]: 'Dapper', [col2Id]: 'ORM', [col3Id]: 'In progress' } },
              { id: 'row-7', cells: { [col1Id]: 'Data Structures', [col2Id]: 'Basic', [col3Id]: 'Frequent update' } },
              { id: 'row-8', cells: { [col1Id]: 'Dependency Injection', [col2Id]: 'DI', [col3Id]: 'Done' } },
              { id: 'row-9', cells: { [col1Id]: 'EF Cache', [col2Id]: 'Caching', [col3Id]: 'Done except code' } },
              { id: 'row-10', cells: { [col1Id]: 'Kafka', [col2Id]: 'Microservice', [col3Id]: 'Done except code' } },
            ],
          },
        };
      }
      case 'toggle':
        return {
          id: newId,
          type: 'toggle',
          content: isEn
            ? 'Toggle header\n• Sub-item 1\n• Sub-item 2'
            : 'Tiêu đề khối thu gọn\n• Mục con 1\n• Mục con 2',
          toggleMeta: { isOpen: true },
        };
      case 'divider':
        return {
          id: newId,
          type: 'divider',
          content: '',
        };
      case 'text':
      default:
        return {
          id: newId,
          type: 'text',
          content: '',
        };
    }
  };

  const handleAddBlock = (
    type: BlockType, 
    language: LanguageId = 'javascript',
    calloutVariant: 'tip' | 'warning' | 'info' | 'concept' = 'tip'
  ) => {
    recordDiscreteAction();
    const newBlock = createNewBlock(type, language, calloutVariant);
    setFocusedBlockId(newBlock.id);
    onUpdatePage({
      ...page,
      blocks: [...page.blocks, newBlock],
      updatedAt: Date.now(),
    });
    setIsAddBlockMenuOpen(false);
  };

  const handleEnterNextBlock = (currentBlockId: string, type: BlockType, initialContent = '') => {
    recordDiscreteAction();
    const newBlock = createNewBlock(type);
    newBlock.content = initialContent;

    function insertNext(list: Block[]): Block[] {
      const idx = list.findIndex((b) => b.id === currentBlockId);
      if (idx !== -1) {
        const copy = [...list];
        copy.splice(idx + 1, 0, newBlock);
        return copy;
      }
      return list.map((b) => (b.children ? { ...b, children: insertNext(b.children) } : b));
    }

    const newBlocks = insertNext(page.blocks);
    setFocusedBlockId(newBlock.id);
    onUpdatePage({
      ...page,
      blocks: newBlocks,
      updatedAt: Date.now(),
    });
  };

  // Convert raw text line into appropriate Block type (Markdown parsing)
  const parseLineToBlock = (line: string): Block => {
    const newId = 'block-' + Math.random().toString(36).substring(2, 9);
    const trimmed = line.trim();

    // Bullet: * or - or •
    if (/^(\*|-|•)\s*/.test(trimmed)) {
      return {
        id: newId,
        type: 'bullet',
        content: trimmed.replace(/^(\*|-|•)\s*/, ''),
      };
    }

    // Numbered: 1. 2. etc.
    if (/^\d+\.\s+/.test(trimmed)) {
      return {
        id: newId,
        type: 'numbered',
        content: trimmed.replace(/^\d+\.\s+/, ''),
      };
    }

    // Heading 1: #
    if (/^#\s+/.test(trimmed)) {
      return {
        id: newId,
        type: 'heading1',
        content: trimmed.replace(/^#\s+/, ''),
      };
    }

    // Heading 2: ##
    if (/^##\s+/.test(trimmed)) {
      return {
        id: newId,
        type: 'heading2',
        content: trimmed.replace(/^##\s+/, ''),
      };
    }

    // Heading 3: ###
    if (/^###\s+/.test(trimmed)) {
      return {
        id: newId,
        type: 'heading3',
        content: trimmed.replace(/^###\s+/, ''),
      };
    }

    // Todo: - [ ] or [ ] or [x]
    if (/^(-\s*)?\[([ xX])\]\s+/.test(trimmed)) {
      const isChecked = /\[[xX]\]/.test(trimmed);
      return {
        id: newId,
        type: 'todo',
        checked: isChecked,
        content: trimmed.replace(/^(-\s*)?\[([ xX])\]\s+/, ''),
      };
    }

    // Callout: >
    if (/^>\s+/.test(trimmed)) {
      return {
        id: newId,
        type: 'callout',
        content: trimmed.replace(/^>\s+/, ''),
        calloutMeta: { variant: 'concept', title: 'Khái niệm' },
      };
    }

    // Divider: ---
    if (/^---\s*$/.test(trimmed)) {
      return {
        id: newId,
        type: 'divider',
        content: '',
      };
    }

    // Default plain text
    return {
      id: newId,
      type: 'text',
      content: trimmed,
    };
  };

  // Handle pasting multiline content: split into separate blocks
  const handlePasteMultipleBlocks = (currentBlockId: string, lines: string[]) => {
    const currentIdx = page.blocks.findIndex((b) => b.id === currentBlockId);
    if (currentIdx === -1) return;

    recordDiscreteAction();
    const currentBlock = page.blocks[currentIdx];

    const updatedBlocks = [...page.blocks];

    if (!currentBlock.content.trim()) {
      // Empty block: First line replaces current block RETAINING currentBlock.type!
      // (E.g. If currentBlock was heading2, line 0 remains heading2!)
      const firstBlock: Block = {
        ...currentBlock,
        id: currentBlock.id,
        content: lines[0],
      };
      // Subsequent lines are parsed into individual blocks
      const subsequentBlocks = lines.slice(1).map((line) => parseLineToBlock(line));
      const allPasted = [firstBlock, ...subsequentBlocks];
      updatedBlocks.splice(currentIdx, 1, ...allPasted);
      const lastBlock = allPasted[allPasted.length - 1];
      if (lastBlock) {
        setFocusedBlockId(lastBlock.id);
      }
    } else {
      // Current block has content: insert new parsed blocks below
      const newBlocksFromLines = lines.map((line) => parseLineToBlock(line));
      updatedBlocks.splice(currentIdx + 1, 0, ...newBlocksFromLines);
      const lastBlock = newBlocksFromLines[newBlocksFromLines.length - 1];
      if (lastBlock) {
        setFocusedBlockId(lastBlock.id);
      }
    }

    onUpdatePage({
      ...page,
      blocks: updatedBlocks,
      updatedAt: Date.now(),
    });
  };

  // Split a combined multiline text block into separate individual blocks
  const handleSplitBlock = (currentBlockId: string) => {
    const currentIdx = page.blocks.findIndex((b) => b.id === currentBlockId);
    if (currentIdx === -1) return;

    const currentBlock = page.blocks[currentIdx];
    const lines = currentBlock.content
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length <= 1) return;

    recordDiscreteAction();
    const newBlocksFromLines = lines.map((line) => parseLineToBlock(line));
    const updatedBlocks = [...page.blocks];
    updatedBlocks.splice(currentIdx, 1, ...newBlocksFromLines);

    if (newBlocksFromLines[0]) {
      setFocusedBlockId(newBlocksFromLines[0].id);
    }

    onUpdatePage({
      ...page,
      blocks: updatedBlocks,
      updatedAt: Date.now(),
    });
  };

  // Slash Trigger Handler
  const handleTriggerSlash = (blockId: string, query: string, rect: DOMRect) => {
    const menuHeight = 340;
    const top = rect.bottom + menuHeight > window.innerHeight
      ? Math.max(10, rect.top - menuHeight)
      : rect.bottom + 6;
    const left = Math.max(16, Math.min(rect.left, window.innerWidth - 360));

    setSlashMenuState({
      blockId,
      query,
      position: { top, left },
    });
    setSlashSelectedIndex(0);
  };

  const handleCloseSlash = () => {
    setSlashMenuState(null);
  };

  // Keyboard navigation when slash menu is active
  const handleSlashKeyDown = (e: React.KeyboardEvent): boolean => {
    if (!slashMenuState) return false;

    const items = getSlashMenuItems(lang);
    const cleanQuery = slashMenuState.query.toLowerCase().trim();
    const filteredItems = items.filter((item) => {
      if (!cleanQuery) return true;
      if (item.title.toLowerCase().includes(cleanQuery)) return true;
      if (item.description.toLowerCase().includes(cleanQuery)) return true;
      return item.keywords.some((k) => k.toLowerCase().includes(cleanQuery));
    });

    if (filteredItems.length === 0) {
      if (e.key === 'Escape') {
        handleCloseSlash();
        return true;
      }
      return false;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSlashSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      return true;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSlashSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      return true;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[slashSelectedIndex] || filteredItems[0];
      if (selected) {
        handleSelectSlashItem(selected);
      }
      return true;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      handleCloseSlash();
      return true;
    }

    return false;
  };

  // Convert or insert selected block from slash menu
  const handleSelectSlashItem = (item: SlashMenuItem) => {
    if (!slashMenuState) return;

    const targetBlockIndex = page.blocks.findIndex((b) => b.id === slashMenuState.blockId);
    if (targetBlockIndex === -1) {
      handleCloseSlash();
      return;
    }

    recordDiscreteAction();
    const currentBlock = page.blocks[targetBlockIndex];
    // Remove slash command text (e.g. "/heading", "/h1", "/h2", "/")
    const textBeforeSlash = currentBlock.content.replace(/(?:^|\s)\/[^\s/]*$/, '').trim();

    const newBlocks = [...page.blocks];

    // CONVERT CURRENT BLOCK DIRECTLY! Preserving textBeforeSlash!
    const updated: Block = {
      ...currentBlock,
      type: item.type,
      content: textBeforeSlash,
    };

    if (item.type === 'todo') {
      updated.checked = typeof currentBlock.checked === 'boolean' ? currentBlock.checked : false;
    } else if (item.type === 'callout') {
      updated.calloutMeta = currentBlock.calloutMeta || {
        variant: item.calloutVariant || 'info',
        title: isEn ? 'Info' : 'Thông tin',
      };
    } else if (item.type === 'code') {
      updated.language = currentBlock.language || item.defaultLanguage || 'javascript';
    } else if (item.type === 'table') {
      if (!currentBlock.tableMeta) {
        const col1 = 'col-' + Math.random().toString(36).substring(2, 6);
        const col2 = 'col-' + Math.random().toString(36).substring(2, 6);
        const row1 = 'row-' + Math.random().toString(36).substring(2, 6);
        updated.tableMeta = {
          columns: [
            { id: col1, name: isEn ? 'Item' : 'Mục', type: 'text' },
            { id: col2, name: isEn ? 'Description' : 'Mô tả', type: 'text' },
          ],
          rows: [
            { id: row1, cells: { [col1]: textBeforeSlash || (isEn ? 'Sample' : 'Ví dụ'), [col2]: '' } },
          ],
        };
      }
    } else if (item.type === 'divider') {
      updated.content = '---';
    } else if (item.type === 'flashcard') {
      if (!currentBlock.flashcardMeta) {
        updated.flashcardMeta = {
          question: textBeforeSlash || (isEn ? 'What concept needs to be remembered?' : 'Khái niệm cần ghi nhớ là gì?'),
          answer: isEn ? 'Detailed explanation...' : 'Câu trả lời giải thích chi tiết...',
        };
      }
    }

    newBlocks[targetBlockIndex] = updated;
    setFocusedBlockId(currentBlock.id);

    onUpdatePage({
      ...page,
      blocks: newBlocks,
      updatedAt: Date.now(),
    });

    handleCloseSlash();
  };

  // Close tag popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagMenuRef.current && !tagMenuRef.current.contains(e.target as Node)) {
        setIsTagMenuOpen(false);
        setTagSearchQuery('');
      }
    };
    if (isTagMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTagMenuOpen]);

  // Available tags to pick from global pool that are not yet on this page
  const availableTagsToPick = useMemo(() => {
    const query = tagSearchQuery.toLowerCase().trim();
    return (allAvailableTags || [])
      .filter((t) => !page.tags.includes(t))
      .filter((t) => !query || t.toLowerCase().includes(query));
  }, [allAvailableTags, page.tags, tagSearchQuery]);

  const handleSelectExistingTag = (tag: string) => {
    if (!page.tags.includes(tag)) {
      recordDiscreteAction();
      onUpdatePage({
        ...page,
        tags: [...page.tags, tag],
        updatedAt: Date.now(),
      });
    }
    setTagSearchQuery('');
    setIsTagMenuOpen(false);
  };

  const handleCreateAndAddTag = (newTag: string) => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (!page.tags.includes(trimmed)) {
      recordDiscreteAction();
      onUpdatePage({
        ...page,
        tags: [...page.tags, trimmed],
        updatedAt: Date.now(),
      });
    }
    onAddCustomTag?.(trimmed);
    setTagSearchQuery('');
    setIsTagMenuOpen(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    recordDiscreteAction();
    onUpdatePage({
      ...page,
      tags: page.tags.filter((t) => t !== tagToRemove),
      updatedAt: Date.now(),
    });
  };

  // Block Reordering & Drag-and-Drop Handlers (Supporting Multi-Block Clusters, Nesting & Un-nesting)
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; position: 'above' | 'below' | 'inside' } | null>(null);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [anchorBlockId, setAnchorBlockId] = useState<string | null>(null);
  const [isBatchTurnIntoOpen, setIsBatchTurnIntoOpen] = useState<boolean>(false);
  const [marqueeBox, setMarqueeBox] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);
  const batchToolbarRef = useRef<HTMLDivElement>(null);
  const mouseDownRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const dragStartBlockIdRef = useRef<string | null>(null);
  const isCrossBlockSelectingRef = useRef<boolean>(false);

  // Flat list of all block IDs in document tree order
  const getAllBlockIdsInOrder = useCallback((blocks: Block[]): string[] => {
    const ids: string[] = [];
    function traverse(list: Block[]) {
      for (const b of list) {
        ids.push(b.id);
        if (b.children && b.children.length > 0) {
          traverse(b.children);
        }
      }
    }
    traverse(blocks);
    return ids;
  }, []);

  const getBlockIdAtY = useCallback((clientY: number): string | null => {
    if (!editorContainerRef.current) return null;
    const blockElements = Array.from(
      editorContainerRef.current.querySelectorAll<HTMLElement>('.block-draggable-wrapper[data-block-id]')
    );
    if (blockElements.length === 0) return null;

    for (const el of blockElements) {
      const r = el.getBoundingClientRect();
      if (clientY >= r.top && clientY <= r.bottom) {
        return el.getAttribute('data-block-id');
      }
    }

    let closestId: string | null = null;
    let minDiff = Infinity;
    for (const el of blockElements) {
      const r = el.getBoundingClientRect();
      const midY = (r.top + r.bottom) / 2;
      const diff = Math.abs(clientY - midY);
      if (diff < minDiff) {
        minDiff = diff;
        closestId = el.getAttribute('data-block-id');
      }
    }
    return closestId;
  }, []);

  // Filter out block IDs whose ancestor is already in the selected list (prevents duplication of child items)
  const filterTopLevelSelectedIds = useCallback((blocks: Block[], selectedIds: string[]): string[] => {
    const set = new Set(selectedIds);
    return selectedIds.filter((id) => {
      const loc = findBlockLoc(blocks, id);
      let curr = loc?.parent;
      while (curr) {
        if (set.has(curr.id)) return false;
        const pLoc = findBlockLoc(blocks, curr.id);
        curr = pLoc?.parent;
      }
      return true;
    });
  }, []);

  // Extract blocks by IDs and remove them from tree
  const extractAndRemoveBlocks = useCallback((blocks: Block[], targetIds: Set<string>): { newBlocks: Block[]; extracted: Block[] } => {
    const extractedMap = new Map<string, Block>();

    function remove(list: Block[]): Block[] {
      const result: Block[] = [];
      for (const b of list) {
        if (targetIds.has(b.id)) {
          extractedMap.set(b.id, b);
        } else {
          const updated = b.children && b.children.length > 0
            ? { ...b, children: remove(b.children) }
            : b;
          result.push(updated);
        }
      }
      return result;
    }

    const newBlocks = remove(blocks);
    const extracted = Array.from(targetIds)
      .map((id) => extractedMap.get(id))
      .filter((b): b is Block => Boolean(b));

    return { newBlocks, extracted };
  }, []);

  const insertInsideList = useCallback((list: Block[], targetId: string, toInsert: Block[]): Block[] => {
    return list.map((b) => {
      if (b.id === targetId) {
        const currentChildren = b.children || [];
        return {
          ...b,
          toggleMeta: { isOpen: true },
          children: [...currentChildren, ...toInsert],
        };
      }
      if (b.children && b.children.length > 0) {
        return { ...b, children: insertInsideList(b.children, targetId, toInsert) };
      }
      return b;
    });
  }, []);

  const insertAdjacentList = useCallback((list: Block[], targetId: string, toInsert: Block[], pos: 'above' | 'below'): Block[] => {
    const targetIdx = list.findIndex((b) => b.id === targetId);
    if (targetIdx !== -1) {
      const insertIdx = pos === 'below' ? targetIdx + 1 : targetIdx;
      const copy = [...list];
      copy.splice(insertIdx, 0, ...toInsert);
      return copy;
    }
    return list.map((b) => {
      if (b.children && b.children.length > 0) {
        return { ...b, children: insertAdjacentList(b.children, targetId, toInsert, pos) };
      }
      return b;
    });
  }, []);

  // Multi-block move up/down within tree
  const moveMultipleBlocksInTree = useCallback((blocks: Block[], idsToMove: string[], direction: 'up' | 'down'): { updated: Block[]; moved: boolean } => {
    const idsSet = new Set(idsToMove);

    function helper(list: Block[]): { updated: Block[]; moved: boolean } {
      const indices = list
        .map((b, idx) => (idsSet.has(b.id) ? idx : -1))
        .filter((idx) => idx !== -1);

      if (indices.length > 0) {
        const minIdx = Math.min(...indices);
        const maxIdx = Math.max(...indices);

        if (direction === 'up') {
          if (minIdx === 0) return { updated: list, moved: false };
          const selectedItems = list.filter((b) => idsSet.has(b.id));
          const remainingItems = list.filter((b) => !idsSet.has(b.id));
          const insertIdx = minIdx - 1;
          remainingItems.splice(insertIdx, 0, ...selectedItems);
          return { updated: remainingItems, moved: true };
        } else {
          if (maxIdx === list.length - 1) return { updated: list, moved: false };
          const selectedItems = list.filter((b) => idsSet.has(b.id));
          const remainingItems = list.filter((b) => !idsSet.has(b.id));
          const insertIdx = minIdx + 1;
          remainingItems.splice(insertIdx, 0, ...selectedItems);
          return { updated: remainingItems, moved: true };
        }
      }

      let anyMoved = false;
      const nextList = list.map((b) => {
        if (b.children && b.children.length > 0) {
          const res = helper(b.children);
          if (res.moved) {
            anyMoved = true;
            return { ...b, children: res.updated };
          }
        }
        return b;
      });

      return { updated: nextList, moved: anyMoved };
    }

    return helper(blocks);
  }, []);

  const handleBatchMove = useCallback((direction: 'up' | 'down') => {
    if (selectedBlockIds.length === 0) return;
    const topIds = filterTopLevelSelectedIds(page.blocks, selectedBlockIds);
    const res = moveMultipleBlocksInTree(page.blocks, topIds, direction);
    if (res.moved) {
      recordDiscreteAction();
      onUpdatePage({ ...page, blocks: res.updated, updatedAt: Date.now() });
    }
  }, [selectedBlockIds, page, filterTopLevelSelectedIds, moveMultipleBlocksInTree, recordDiscreteAction, onUpdatePage]);

  const handleBatchDelete = useCallback(() => {
    if (selectedBlockIds.length === 0) return;
    recordDiscreteAction();
    const deleteSet = new Set(selectedBlockIds);

    function deleteFromTree(list: Block[]): Block[] {
      return list
        .filter((b) => !deleteSet.has(b.id))
        .map((b) => (b.children && b.children.length > 0 ? { ...b, children: deleteFromTree(b.children) } : b));
    }

    let updated = deleteFromTree(page.blocks);
    if (updated.length === 0) {
      updated = [createNewBlock('text')];
    }

    onUpdatePage({ ...page, blocks: updated, updatedAt: Date.now() });
    setSelectedBlockIds([]);
  }, [selectedBlockIds, page, recordDiscreteAction, onUpdatePage, createNewBlock]);

  const handleBatchDuplicate = useCallback(() => {
    if (selectedBlockIds.length === 0) return;
    recordDiscreteAction();

    const topIds = filterTopLevelSelectedIds(page.blocks, selectedBlockIds);
    const targetId = topIds[topIds.length - 1];

    function cloneBlockWithNewIds(b: Block): Block {
      const newId = 'block-' + Math.random().toString(36).substring(2, 9);
      return {
        ...b,
        id: newId,
        children: b.children ? b.children.map(cloneBlockWithNewIds) : undefined,
      };
    }

    const selectedBlocks: Block[] = [];
    function findSelected(list: Block[]) {
      for (const b of list) {
        if (topIds.includes(b.id)) {
          selectedBlocks.push(cloneBlockWithNewIds(b));
        }
        if (b.children) findSelected(b.children);
      }
    }
    findSelected(page.blocks);

    const updated = insertAdjacentList(page.blocks, targetId, selectedBlocks, 'below');
    onUpdatePage({ ...page, blocks: updated, updatedAt: Date.now() });
    setSelectedBlockIds(selectedBlocks.map((b) => b.id));
  }, [selectedBlockIds, page, filterTopLevelSelectedIds, insertAdjacentList, recordDiscreteAction, onUpdatePage]);

  const handleBatchTurnInto = useCallback((newType: BlockType) => {
    if (selectedBlockIds.length === 0) return;
    recordDiscreteAction();
    const targetSet = new Set(selectedBlockIds);

    function turnTree(list: Block[]): Block[] {
      return list.map((b) => {
        let updated = b;
        if (targetSet.has(b.id)) {
          updated = {
            ...b,
            type: newType,
            calloutMeta: newType === 'callout' ? (b.calloutMeta || { variant: 'tip', title: isEn ? 'Tip' : 'Ghi chú' }) : b.calloutMeta,
            checked: newType === 'todo' ? (b.checked ?? false) : b.checked,
          };
        }
        if (updated.children && updated.children.length > 0) {
          updated = { ...updated, children: turnTree(updated.children) };
        }
        return updated;
      });
    }

    const updated = turnTree(page.blocks);
    onUpdatePage({ ...page, blocks: updated, updatedAt: Date.now() });
    setIsBatchTurnIntoOpen(false);
  }, [selectedBlockIds, page, isEn, recordDiscreteAction, onUpdatePage]);

  const handleRangeSelect = useCallback((targetId: string) => {
    const allIds = getAllBlockIdsInOrder(page.blocks);
    const anchorId = anchorBlockId || focusedBlockId || selectedBlockIds[0] || targetId;
    const idx1 = allIds.indexOf(anchorId);
    const idx2 = allIds.indexOf(targetId);
    if (idx1 !== -1 && idx2 !== -1) {
      const start = Math.min(idx1, idx2);
      const end = Math.max(idx1, idx2);
      const rangeIds = allIds.slice(start, end + 1);
      setSelectedBlockIds(rangeIds);
      setAnchorBlockId(anchorId);
    }
  }, [page.blocks, getAllBlockIdsInOrder, anchorBlockId, focusedBlockId, selectedBlockIds]);

  const handleToggleSelect = useCallback((targetId: string) => {
    setSelectedBlockIds((prev) => {
      if (prev.includes(targetId)) {
        return prev.filter((id) => id !== targetId);
      } else {
        return [...prev, targetId];
      }
    });
    setAnchorBlockId(targetId);
  }, []);

  const handleEditorMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.batch-selection-toolbar') || 
      target.closest('.block-action-menu-popover') ||
      target.closest('.tag-picker-popover') ||
      target.closest('.slash-menu-dropdown') ||
      target.closest('.btn-add-block-dropdown') ||
      target.closest('.block-picker-popover')
    ) {
      return;
    }

    const clickedBlockWrapper = target.closest<HTMLElement>('.block-draggable-wrapper[data-block-id]');
    const clickedId = clickedBlockWrapper?.getAttribute('data-block-id');

    // Modifiers for click selection
    if (e.shiftKey && clickedId) {
      e.preventDefault();
      handleRangeSelect(clickedId);
      return;
    }
    if ((e.metaKey || e.ctrlKey) && clickedId) {
      e.preventDefault();
      handleToggleSelect(clickedId);
      return;
    }

    // Record mousedown point
    mouseDownRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    dragStartBlockIdRef.current = clickedId || null;
    isCrossBlockSelectingRef.current = false;

    // Deselect if clicking on empty space or clicking another block outside existing selection
    if (selectedBlockIds.length > 0) {
      if (!clickedId || !selectedBlockIds.includes(clickedId)) {
        setSelectedBlockIds([]);
      }
    }
  }, [selectedBlockIds, handleRangeSelect, handleToggleSelect]);

  // Global mousemove and mouseup listeners for smooth drag-selection across editor blocks
  useEffect(() => {
    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (!mouseDownRef.current) return;
      const dx = e.clientX - mouseDownRef.current.x;
      const dy = e.clientY - mouseDownRef.current.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 6) return;

      // Case 1: Drag started on or inside a block
      if (dragStartBlockIdRef.current) {
        const elUnder = document.elementFromPoint(e.clientX, e.clientY);
        const currBlockEl = elUnder?.closest<HTMLElement>('.block-draggable-wrapper[data-block-id]');
        let currBlockId = currBlockEl?.getAttribute('data-block-id') || null;

        if (!currBlockId) {
          currBlockId = getBlockIdAtY(e.clientY);
        }

        if (isCrossBlockSelectingRef.current || (currBlockId && currBlockId !== dragStartBlockIdRef.current)) {
          isCrossBlockSelectingRef.current = true;
          window.getSelection()?.removeAllRanges();
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }

          if (currBlockId) {
            const allIds = getAllBlockIdsInOrder(page.blocks);
            const idx1 = allIds.indexOf(dragStartBlockIdRef.current);
            const idx2 = allIds.indexOf(currBlockId);
            if (idx1 !== -1 && idx2 !== -1) {
              const start = Math.min(idx1, idx2);
              const end = Math.max(idx1, idx2);
              setSelectedBlockIds(allIds.slice(start, end + 1));
              setAnchorBlockId(dragStartBlockIdRef.current);
            }
          }
        }
        return;
      }

      // Case 2: Drag started on empty space (gutter/margin/padding) -> Marquee Box Selection
      if (editorContainerRef.current) {
        const boxLeft = Math.min(mouseDownRef.current.x, e.clientX);
        const boxRight = Math.max(mouseDownRef.current.x, e.clientX);
        const boxTop = Math.min(mouseDownRef.current.y, e.clientY);
        const boxBottom = Math.max(mouseDownRef.current.y, e.clientY);

        setMarqueeBox({
          startX: mouseDownRef.current.x,
          startY: mouseDownRef.current.y,
          currentX: e.clientX,
          currentY: e.clientY,
        });

        const blockEls = Array.from(
          editorContainerRef.current.querySelectorAll<HTMLElement>('.block-draggable-wrapper[data-block-id]')
        );
        const intersecting: string[] = [];
        for (const el of blockEls) {
          const r = el.getBoundingClientRect();
          const overlapsX = boxLeft <= r.right && boxRight >= r.left;
          const overlapsY = boxTop <= r.bottom && boxBottom >= r.top;
          if (overlapsX && overlapsY) {
            const bId = el.getAttribute('data-block-id');
            if (bId) intersecting.push(bId);
          }
        }
        if (intersecting.length > 0) {
          setSelectedBlockIds(intersecting);
          setAnchorBlockId(intersecting[0]);
          window.getSelection()?.removeAllRanges();
        }
      }
    };

    const handleDocumentMouseUp = () => {
      if (isCrossBlockSelectingRef.current) {
        window.getSelection()?.removeAllRanges();
      }
      mouseDownRef.current = null;
      dragStartBlockIdRef.current = null;
      isCrossBlockSelectingRef.current = false;
      setMarqueeBox(null);

      // Support native text selection crossing multiple blocks
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);

      if (!editorContainerRef.current) return;
      const blockElements = Array.from(
        editorContainerRef.current.querySelectorAll<HTMLElement>('.block-draggable-wrapper[data-block-id]')
      );

      const intersecting: string[] = [];
      for (const el of blockElements) {
        try {
          if (range.intersectsNode(el)) {
            const bId = el.getAttribute('data-block-id');
            if (bId) intersecting.push(bId);
          }
        } catch {
          // ignore
        }
      }

      if (intersecting.length > 1) {
        setSelectedBlockIds(intersecting);
        setAnchorBlockId(intersecting[0]);
        sel.removeAllRanges();
      }
    };

    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [page.blocks, getAllBlockIdsInOrder, getBlockIdAtY]);

  // Close batch popover when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (batchToolbarRef.current && !batchToolbarRef.current.contains(e.target as Node)) {
        setIsBatchTurnIntoOpen(false);
      }
    };
    if (isBatchTurnIntoOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
    }
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isBatchTurnIntoOpen]);

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    if (selectedBlockIds.includes(blockId) && selectedBlockIds.length > 1) {
      handleBatchMove(direction);
      return;
    }

    const loc = findBlockLoc(page.blocks, blockId);
    if (!loc) return;
    const { siblings, index } = loc;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;

    recordDiscreteAction();

    function moveInTree(list: Block[]): Block[] {
      const idx = list.findIndex((b) => b.id === blockId);
      if (idx !== -1) {
        const copy = [...list];
        const [moved] = copy.splice(idx, 1);
        copy.splice(targetIndex, 0, moved);
        return copy;
      }
      return list.map((b) => (b.children ? { ...b, children: moveInTree(b.children) } : b));
    }

    const newBlocks = moveInTree(page.blocks);
    onUpdatePage({ ...page, blocks: newBlocks, updatedAt: Date.now() });
    setFocusedBlockId(blockId);
  };

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', blockId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedBlockId(blockId);

    // If dragging a selected block in a multi-block selection, show badge preview
    if (selectedBlockIds.includes(blockId) && selectedBlockIds.length > 1) {
      const dragBadge = document.createElement('div');
      dragBadge.className = 'batch-drag-preview-ghost';
      dragBadge.innerText = isEn ? `⤹ Move ${selectedBlockIds.length} blocks` : `⤹ Di chuyển ${selectedBlockIds.length} blocks`;
      document.body.appendChild(dragBadge);
      e.dataTransfer.setDragImage(dragBadge, 16, 16);
      setTimeout(() => {
        if (document.body.contains(dragBadge)) {
          document.body.removeChild(dragBadge);
        }
      }, 0);
    } else if (!selectedBlockIds.includes(blockId)) {
      setSelectedBlockIds([]);
    }
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedBlockId) {
      setDropTarget(null);
      return;
    }

    const isCluster = selectedBlockIds.includes(draggedBlockId) && selectedBlockIds.length > 1;

    if (isCluster) {
      if (selectedBlockIds.includes(targetId) || selectedBlockIds.some((id) => isDescendantOf(page.blocks, id, targetId))) {
        setDropTarget(null);
        return;
      }
    } else {
      if (draggedBlockId === targetId || isDescendantOf(page.blocks, draggedBlockId, targetId)) {
        setDropTarget(null);
        return;
      }
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const relY = (e.clientY - rect.top) / rect.height;
    let position: 'above' | 'below' | 'inside';

    if (relY < 0.28) {
      position = 'above';
    } else if (relY > 0.72) {
      position = 'below';
    } else {
      position = 'inside';
    }

    setDropTarget({ id: targetId, position });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedBlockId) {
      setDraggedBlockId(null);
      setDropTarget(null);
      return;
    }

    const isCluster = selectedBlockIds.includes(draggedBlockId) && selectedBlockIds.length > 1;

    if (isCluster) {
      // Multiple blocks drop together
      const topIds = filterTopLevelSelectedIds(page.blocks, selectedBlockIds);
      if (topIds.includes(targetId) || topIds.some((id) => isDescendantOf(page.blocks, id, targetId))) {
        setDraggedBlockId(null);
        setDropTarget(null);
        return;
      }

      recordDiscreteAction();

      const { newBlocks, extracted } = extractAndRemoveBlocks(page.blocks, new Set(topIds));
      if (extracted.length === 0) {
        setDraggedBlockId(null);
        setDropTarget(null);
        return;
      }

      const pos = dropTarget?.position || 'below';
      let updatedBlocks: Block[];

      if (pos === 'inside') {
        updatedBlocks = insertInsideList(newBlocks, targetId, extracted);
      } else {
        updatedBlocks = insertAdjacentList(newBlocks, targetId, extracted, pos);
      }

      onUpdatePage({ ...page, blocks: updatedBlocks, updatedAt: Date.now() });
      setDraggedBlockId(null);
      setDropTarget(null);
      return;
    }

    // Single block drop
    if (draggedBlockId === targetId || isDescendantOf(page.blocks, draggedBlockId, targetId)) {
      setDraggedBlockId(null);
      setDropTarget(null);
      return;
    }

    recordDiscreteAction();

    const { newBlocks, removed: moved } = removeBlockFromTree(page.blocks, draggedBlockId);
    if (!moved) {
      setDraggedBlockId(null);
      setDropTarget(null);
      return;
    }

    const pos = dropTarget?.position || 'below';

    if (pos === 'inside') {
      const updatedBlocks = insertInsideList(newBlocks, targetId, [moved]);
      onUpdatePage({ ...page, blocks: updatedBlocks, updatedAt: Date.now() });
    } else {
      const updatedBlocks = insertAdjacentList(newBlocks, targetId, [moved], pos);
      onUpdatePage({ ...page, blocks: updatedBlocks, updatedAt: Date.now() });
    }

    setFocusedBlockId(draggedBlockId);
    setDraggedBlockId(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedBlockId(null);
    setDropTarget(null);
  };

  // Keyboard shortcut: Alt + ArrowUp / Alt + ArrowDown to reorder active block or multi-block cluster
  // Keyboard shortcuts: Alt+Up/Down (reorder), Shift+Up/Down (expand selection), Cmd/Ctrl+A (select all), Delete (batch delete)
  useEffect(() => {
    const handleReorderKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea';

      // Alt + ArrowUp / ArrowDown: Reorder selected cluster or active block
      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        const direction = e.key === 'ArrowUp' ? 'up' : 'down';
        if (selectedBlockIds.length > 1) {
          e.preventDefault();
          handleBatchMove(direction);
        } else if (focusedBlockId) {
          e.preventDefault();
          handleMoveBlock(focusedBlockId, direction);
        }
      } 
      // Shift + ArrowUp / ArrowDown: Expand block selection
      else if (e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && !isInput) {
        const allIds = getAllBlockIdsInOrder(page.blocks);
        if (selectedBlockIds.length === 0 && focusedBlockId) {
          const idx = allIds.indexOf(focusedBlockId);
          if (e.key === 'ArrowUp' && idx > 0) {
            e.preventDefault();
            setSelectedBlockIds([allIds[idx - 1], focusedBlockId]);
            setAnchorBlockId(focusedBlockId);
          } else if (e.key === 'ArrowDown' && idx !== -1 && idx < allIds.length - 1) {
            e.preventDefault();
            setSelectedBlockIds([focusedBlockId, allIds[idx + 1]]);
            setAnchorBlockId(focusedBlockId);
          }
        } else if (selectedBlockIds.length > 0) {
          e.preventDefault();
          const firstId = selectedBlockIds[0];
          const lastId = selectedBlockIds[selectedBlockIds.length - 1];
          if (e.key === 'ArrowUp') {
            const idx = allIds.indexOf(firstId);
            if (idx > 0) {
              setSelectedBlockIds([allIds[idx - 1], ...selectedBlockIds]);
            }
          } else {
            const idx = allIds.indexOf(lastId);
            if (idx !== -1 && idx < allIds.length - 1) {
              setSelectedBlockIds([...selectedBlockIds, allIds[idx + 1]]);
            }
          }
        }
      }
      // Cmd/Ctrl + A: Select all blocks when multi-selection is active
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a' && !isInput && selectedBlockIds.length > 0) {
        e.preventDefault();
        const allIds = getAllBlockIdsInOrder(page.blocks);
        setSelectedBlockIds(allIds);
      }
      // Escape: Deselect all
      else if (e.key === 'Escape' && selectedBlockIds.length > 0) {
        e.preventDefault();
        setSelectedBlockIds([]);
      } 
      // Delete / Backspace: Batch delete
      else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockIds.length > 0 && !isInput) {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) {
          e.preventDefault();
          handleBatchDelete();
        }
      }
    };
    window.addEventListener('keydown', handleReorderKeyDown);
    return () => window.removeEventListener('keydown', handleReorderKeyDown);
  }, [focusedBlockId, selectedBlockIds, page.blocks, handleBatchMove, handleBatchDelete, getAllBlockIdsInOrder, handleMoveBlock]);

  // Group numbering calculation for consecutive numbered blocks
  let numberedCounter = 0;

  return (
    <div 
      className="editor-container" 
      ref={editorContainerRef}
      onMouseDown={handleEditorMouseDown}
    >
      {/* Cover Banner */}
      <div 
        className="page-cover-banner" 
        style={{ 
          background: page.coverGradient || 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' 
        }} 
      />

      <div className="editor-wrapper">
        {/* Page Header */}
        <div className="page-header-block">
          <input
            className="page-title-input"
            value={page.title}
            onChange={(e) => {
              recordTypingAction('page-title');
              onUpdatePage({ ...page, title: e.target.value, updatedAt: Date.now() });
            }}
            placeholder={t(lang, 'lessonTitlePlaceholder')}
          />

          {/* Tags */}
          <div className="page-tags-row">
            {page.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                <TagIcon size={11} />
                <span>{tag}</span>
                <button 
                  className="tag-pill-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(tag);
                  }}
                  title={t(lang, 'deleteTagTooltip')}
                >
                  <X size={11} />
                </button>
              </span>
            ))}

            {/* Tag Picker Popover Trigger Button */}
            <div style={{ position: 'relative' }} ref={tagMenuRef}>
              <button 
                className="tag-pill" 
                onClick={() => setIsTagMenuOpen((prev) => !prev)}
                style={{ 
                  cursor: 'pointer', 
                  borderStyle: 'dashed',
                  background: isTagMenuOpen ? 'var(--bg-surface-active)' : 'var(--bg-surface)',
                  color: isTagMenuOpen ? 'var(--primary)' : 'var(--text-secondary)'
                }}
                title={t(lang, 'addTag')}
              >
                <Plus size={11} />
                <span>{t(lang, 'addTag')}</span>
              </button>

              {/* Tag Picker Popover Dropdown */}
              {isTagMenuOpen && (
                <div className="tag-picker-popover">
                  {/* Search Input Bar */}
                  <div className="tag-picker-search-bar">
                    <Search size={13} color="var(--text-muted)" />
                    <input
                      autoFocus
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const trimmed = tagSearchQuery.trim();
                          if (!trimmed) return;
                          const exactMatch = availableTagsToPick.find(
                            (t) => t.toLowerCase() === trimmed.toLowerCase()
                          );
                          if (exactMatch) {
                            handleSelectExistingTag(exactMatch);
                          } else {
                            handleCreateAndAddTag(trimmed);
                          }
                        } else if (e.key === 'Escape') {
                          setIsTagMenuOpen(false);
                        }
                      }}
                      placeholder={t(lang, 'searchOrAddTag')}
                      className="tag-picker-input"
                    />
                    {tagSearchQuery && (
                      <button 
                        className="icon-btn-ghost" 
                        onClick={() => setTagSearchQuery('')}
                        style={{ padding: 2 }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Existing Tags Section */}
                  <div className="tag-picker-section-title">
                    <span>{t(lang, 'availableTags')}</span>
                    {availableTagsToPick.length > 0 && (
                      <span className="tag-picker-count">{availableTagsToPick.length}</span>
                    )}
                  </div>

                  <div className="tag-picker-list">
                    {availableTagsToPick.length > 0 ? (
                      availableTagsToPick.map((tag) => (
                        <div key={tag} className="tag-picker-item-row">
                          <button
                            className="tag-picker-item-btn"
                            onClick={() => handleSelectExistingTag(tag)}
                            title={isEn ? `Add #${tag} to note` : `Gán #${tag} vào ghi chú`}
                          >
                            <div className="tag-picker-item-label">
                              <TagIcon size={12} color="var(--primary)" style={{ flexShrink: 0 }} />
                              <span>#{tag}</span>
                            </div>
                            <Plus size={12} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                          </button>
                          {onDeleteTag && (
                            <button
                              className="tag-picker-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTag(tag);
                              }}
                              title={isEn ? `Delete tag #${tag} permanently` : `Xóa vĩnh viễn tag #${tag}`}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="tag-picker-empty">
                        {tagSearchQuery.trim()
                          ? t(lang, 'noTagsFound')
                          : (lang === 'vi' ? 'Không có tag nào khác' : 'No other tags')}
                      </div>
                    )}
                  </div>

                  {/* Create New Tag Option */}
                  {tagSearchQuery.trim() &&
                    !page.tags.some((t) => t.toLowerCase() === tagSearchQuery.toLowerCase().trim()) &&
                    !availableTagsToPick.some((t) => t.toLowerCase() === tagSearchQuery.toLowerCase().trim()) && (
                      <button
                        className="tag-picker-create-btn"
                        onClick={() => handleCreateAndAddTag(tagSearchQuery)}
                      >
                        <Plus size={13} />
                        <span>
                          {t(lang, 'createTag')}: <strong>#{tagSearchQuery.trim()}</strong>
                        </span>
                      </button>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Category, Status & Metadata Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <FolderOpen size={13} />
              <span>{t(lang, 'categoryLabel')}</span>
              <input
                value={page.category || ''}
                onChange={(e) => {
                  recordTypingAction('page-category');
                  onUpdatePage({ ...page, category: e.target.value, updatedAt: Date.now() });
                }}
                placeholder={t(lang, 'categoryPlaceholder')}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.78rem',
                  color: 'var(--text-primary)',
                  width: 140,
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>{t(lang, 'statusLabel')}</span>
              <select
                value={page.status || 'learning'}
                onChange={(e) => {
                  recordDiscreteAction();
                  onUpdatePage({ ...page, status: e.target.value as any, updatedAt: Date.now() });
                }}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.78rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                <option value="learning">{t(lang, 'statusLearning')}</option>
                <option value="completed">{t(lang, 'statusCompleted')}</option>
                <option value="review">{t(lang, 'statusReview')}</option>
              </select>
            </div>

            {/* Undo / Redo Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
              <button
                type="button"
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                title={t(lang, 'undoTooltip')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 500,
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: undoStack.length > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                  opacity: undoStack.length > 0 ? 1 : 0.45,
                  cursor: undoStack.length > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s ease',
                }}
              >
                <Undo2 size={12} />
                <span>{t(lang, 'undo')}</span>
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                title={t(lang, 'redoTooltip')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 500,
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  color: redoStack.length > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                  opacity: redoStack.length > 0 ? 1 : 0.45,
                  cursor: redoStack.length > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s ease',
                }}
              >
                <Redo2 size={12} />
                <span>{t(lang, 'redo')}</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#10b981' }}>
              <Check size={12} strokeWidth={2.5} />
              <span>{t(lang, 'autoSaved')}</span>
            </div>
          </div>

          {/* Description Input */}
          <div style={{ marginTop: 8 }}>
            <input
              value={page.description || ''}
              onChange={(e) => {
                recordTypingAction('page-description');
                onUpdatePage({ ...page, description: e.target.value, updatedAt: Date.now() });
              }}
              placeholder={t(lang, 'lessonDescPlaceholder')}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px dashed var(--border-subtle)',
                padding: '4px 0',
                fontSize: '0.86rem',
                color: 'var(--text-secondary)',
              }}
            />
          </div>
        </div>

        {/* Recursive Block Renderer supporting nested children */}
        {(() => {
          const renderBlockNode = (
            block: Block, 
            indexInGroup: number, 
            isFirst: boolean, 
            isLast: boolean, 
            depth: number = 0
          ): React.ReactNode => {
            const isDragging = draggedBlockId === block.id;
            const isTarget = dropTarget?.id === block.id;
            const dropPosition = isTarget ? dropTarget.position : null;
            const hasChildren = Boolean(block.children && block.children.length > 0);
            const isOpen = block.toggleMeta?.isOpen !== false;
            const isSelected = selectedBlockIds.includes(block.id);
            const isCluster = isSelected && selectedBlockIds.length > 1;

            return (
              <div key={block.id} className="block-tree-node">
                <div
                  data-block-id={block.id}
                  className={`block-draggable-wrapper ${isSelected ? 'is-selected' : ''} ${isDragging ? 'is-dragging' : ''} ${dropPosition ? `drop-${dropPosition}` : ''} ${depth > 0 ? 'is-child-block' : ''}`}
                  draggable={isCluster}
                  onDragStart={(e) => {
                    if (isCluster) {
                      const target = e.target as HTMLElement;
                      if (target.closest('button') || target.closest('input')) return;
                      handleDragStart(e, block.id);
                    }
                  }}
                  onDragOver={(e) => handleDragOver(e, block.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, block.id)}
                >
                  {/* Left Gutter: Drag Handle, Toggle Caret, and Reorder Controls */}
                  <div 
                    className="block-drag-gutter"
                    onClick={(e) => {
                      if (e.shiftKey) {
                        e.stopPropagation();
                        handleRangeSelect(block.id);
                      } else if (e.metaKey || e.ctrlKey) {
                        e.stopPropagation();
                        handleToggleSelect(block.id);
                      }
                    }}
                  >
                    {hasChildren && block.type !== 'toggle' ? (
                      <button
                        type="button"
                        className={`block-nest-caret-btn ${isOpen ? 'open' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateBlock({ ...block, toggleMeta: { isOpen: !isOpen } });
                        }}
                        title={isOpen ? (isEn ? "Collapse sub-items" : "Thu gọn mục con") : (isEn ? "Expand sub-items" : "Mở rộng mục con")}
                      >
                        <ChevronRight size={13} className="nest-caret-icon" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="block-move-btn"
                        onClick={() => handleMoveBlock(block.id, 'up')}
                        disabled={isFirst}
                        title={isEn ? "Move up (Alt+↑)" : "Di chuyển lên (Alt+↑)"}
                      >
                        <ChevronUp size={13} />
                      </button>
                    )}

                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, block.id)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (e.shiftKey) {
                          handleRangeSelect(block.id);
                        } else if (e.metaKey || e.ctrlKey) {
                          handleToggleSelect(block.id);
                        } else {
                          handleOpenBlockMenu(block.id, e.currentTarget);
                        }
                      }}
                      className="block-grip-handle"
                      title={isEn ? "Click for menu • Shift+Click to select • Drag to move" : "Bấm để mở menu • Shift+Click để chọn • Kéo để di chuyển"}
                    >
                      <GripVertical size={14} />
                    </div>

                    <button
                      type="button"
                      className="block-move-btn"
                      onClick={() => handleMoveBlock(block.id, 'down')}
                      disabled={isLast}
                      title={isEn ? "Move down (Alt+↓)" : "Di chuyển xuống (Alt+↓)"}
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>

                  {/* Block Content */}
                  <div 
                    className="block-content-area" 
                    onClick={(e) => {
                      if (e.shiftKey) {
                        e.stopPropagation();
                        handleRangeSelect(block.id);
                        return;
                      }
                      if (e.metaKey || e.ctrlKey) {
                        e.stopPropagation();
                        handleToggleSelect(block.id);
                        return;
                      }
                      if (selectedBlockIds.length > 0 && !isCrossBlockSelectingRef.current) {
                        setSelectedBlockIds([]);
                      }
                      setFocusedBlockId(block.id);
                    }}
                  >
                    <BlockItem
                      block={block}
                      indexInGroup={indexInGroup}
                      isSlashActive={slashMenuState?.blockId === block.id}
                      isFocused={focusedBlockId === block.id}
                      lang={lang}
                      onUpdateBlock={handleUpdateBlock}
                      onDeleteBlock={handleDeleteBlock}
                      onTurnBlockInto={handleTurnBlockInto}
                      onOpenBlockMenu={handleOpenBlockMenu}
                      onSendToStudio={onSendToStudio}
                      onTriggerSlash={handleTriggerSlash}
                      onCloseSlash={handleCloseSlash}
                      onSlashKeyDown={handleSlashKeyDown}
                      onEnterNextBlock={handleEnterNextBlock}
                      onPasteMultipleBlocks={handlePasteMultipleBlocks}
                      onSplitBlock={handleSplitBlock}
                    />
                  </div>

                  {/* Visual Drop Inside Badge */}
                  {dropPosition === 'inside' && (
                    <div className="drop-inside-badge">
                      <span>↳ {isEn ? "Drop to nest as sub-item" : "Thả để gộp làm mục con"}</span>
                    </div>
                  )}
                </div>

                {/* Indented child blocks container */}
                {hasChildren && isOpen && (
                  <div className="block-children-container">
                    {block.children!.map((childBlock, childIdx) => {
                      const childIsFirst = childIdx === 0;
                      const childIsLast = childIdx === block.children!.length - 1;
                      return renderBlockNode(
                        childBlock,
                        childIdx + 1,
                        childIsFirst,
                        childIsLast,
                        depth + 1
                      );
                    })}
                  </div>
                )}
              </div>
            );
          };

          return (
            <div className="blocks-list">
              {page.blocks.map((block, index) => {
                if (block.type === 'numbered') {
                  numberedCounter++;
                } else {
                  numberedCounter = 0;
                }

                const isFirst = index === 0;
                const isLast = index === page.blocks.length - 1;
                return renderBlockNode(block, numberedCounter, isFirst, isLast, 0);
              })}
            </div>
          );
        })()}

        {/* Floating Slash Menu */}
        {slashMenuState && (
          <SlashMenu
            query={slashMenuState.query}
            position={slashMenuState.position}
            selectedIndex={slashSelectedIndex}
            lang={lang}
            onSelect={handleSelectSlashItem}
            onClose={handleCloseSlash}
          />
        )}

        {/* Floating Block Action Menu ("Turn into" / Actions) */}
        {blockMenuState && (() => {
          const loc = findBlockLoc(page.blocks, blockMenuState.blockId);
          if (!loc) return null;
          const targetBlock = loc.block;
          const isChild = loc.parent !== null;
          const { index, siblings } = loc;
          return (
            <BlockActionMenu
              currentType={targetBlock.type}
              position={blockMenuState.position}
              lang={lang}
              onTurnInto={(newType) => handleTurnBlockInto(targetBlock.id, newType)}
              onDuplicate={() => handleDuplicateBlock(targetBlock.id)}
              onMoveUp={index > 0 ? () => handleMoveBlock(targetBlock.id, 'up') : undefined}
              onMoveDown={index < siblings.length - 1 ? () => handleMoveBlock(targetBlock.id, 'down') : undefined}
              onUnnest={isChild ? () => handleUnnestBlock(targetBlock.id) : undefined}
              onDelete={() => handleDeleteBlock(targetBlock.id)}
              onClose={() => setBlockMenuState(null)}
            />
          );
        })()}

        {/* Floating Batch Selection Toolbar */}
        {selectedBlockIds.length > 0 && (
          <div className="batch-selection-toolbar" ref={batchToolbarRef}>
            <div className="batch-toolbar-count">
              <Layers size={13} />
              <span>
                {selectedBlockIds.length}{' '}
                {isEn
                  ? selectedBlockIds.length > 1 ? 'blocks selected' : 'block selected'
                  : 'block đã chọn'}
              </span>
            </div>

            <div className="batch-toolbar-divider" />

            <button
              type="button"
              className="batch-toolbar-btn"
              onClick={() => handleBatchMove('up')}
              title={isEn ? "Move up (Alt+↑)" : "Di chuyển lên (Alt+↑)"}
            >
              <ChevronUp size={14} />
              <span>{isEn ? "Move up" : "Lên"}</span>
            </button>

            <button
              type="button"
              className="batch-toolbar-btn"
              onClick={() => handleBatchMove('down')}
              title={isEn ? "Move down (Alt+↓)" : "Di chuyển xuống (Alt+↓)"}
            >
              <ChevronDown size={14} />
              <span>{isEn ? "Move down" : "Xuống"}</span>
            </button>

            <div className="batch-toolbar-divider" />

            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="batch-toolbar-btn"
                onClick={() => setIsBatchTurnIntoOpen((prev) => !prev)}
                title={isEn ? "Turn into..." : "Chuyển đổi thành..."}
              >
                <Type size={14} />
                <span>{isEn ? "Turn into" : "Chuyển thành"}</span>
                <ChevronDown size={12} style={{ opacity: 0.7 }} />
              </button>

              {isBatchTurnIntoOpen && (
                <div className="batch-toolbar-popover">
                  {TURN_OPTIONS.map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      className="batch-popover-item"
                      onClick={() => handleBatchTurnInto(opt.type)}
                    >
                      {opt.icon}
                      <span>{isEn ? opt.labelEn : opt.labelVi}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="batch-toolbar-btn"
              onClick={handleBatchDuplicate}
              title={isEn ? "Duplicate" : "Nhân bản"}
            >
              <Copy size={14} />
              <span>{isEn ? "Duplicate" : "Nhân bản"}</span>
            </button>

            <div className="batch-toolbar-divider" />

            <button
              type="button"
              className="batch-toolbar-btn danger"
              onClick={handleBatchDelete}
              title={isEn ? "Delete (Delete/Backspace)" : "Xóa (Delete/Backspace)"}
            >
              <Trash2 size={14} />
              <span>{isEn ? "Delete" : "Xóa"}</span>
            </button>

            <button
              type="button"
              className="batch-toolbar-close"
              onClick={() => setSelectedBlockIds([])}
              title={isEn ? "Deselect (Esc)" : "Bỏ chọn (Esc)"}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Marquee Selection Box */}
        {marqueeBox && (
          <div
            className="batch-selection-marquee"
            style={{
              left: Math.min(marqueeBox.startX, marqueeBox.currentX),
              top: Math.min(marqueeBox.startY, marqueeBox.currentY),
              width: Math.abs(marqueeBox.currentX - marqueeBox.startX),
              height: Math.abs(marqueeBox.currentY - marqueeBox.startY),
            }}
          />
        )}

        {/* Sleek Notion-style Bottom Action Bar */}
        <div className="editor-bottom-bar">
          <div className="add-block-dropdown-wrapper" ref={addBlockMenuRef}>
            <button
              className="btn-add-block-dropdown"
              onClick={() => setIsAddBlockMenuOpen((prev) => !prev)}
              title={isEn ? "Add block / Choose from list" : "Thêm block / Chọn từ danh sách"}
            >
              <Plus size={14} />
              <span>{isEn ? "Add block" : "Thêm block"}</span>
              <ChevronDown size={12} style={{ opacity: 0.6 }} />
            </button>

            {isAddBlockMenuOpen && (
              <div className="block-picker-popover">
                <div className="block-picker-header">
                  <span>{isEn ? "SELECT BLOCK TYPE" : "DANH SÁCH BLOCK"}</span>
                  <span className="block-picker-hint">{isEn ? "Type / in text" : "Gõ / trong ghi chú"}</span>
                </div>

                <div className="block-picker-list">
                  {getSlashMenuItems(lang).map((item) => (
                    <button
                      key={item.id}
                      className="block-picker-item"
                      onClick={() =>
                        handleAddBlock(
                          item.type,
                          item.defaultLanguage,
                          item.calloutVariant
                        )
                      }
                    >
                      <div className="block-picker-item-icon">{item.icon}</div>
                      <div className="block-picker-item-info">
                        <div className="block-picker-item-top">
                          <span className="block-picker-item-title">{item.title}</span>
                          {item.badge && (
                            <span className="block-picker-item-badge">{item.badge}</span>
                          )}
                        </div>
                        <span className="block-picker-item-desc">{item.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            className="editor-new-line-prompt"
            onClick={() => handleAddBlock('text')}
            title={isEn ? "Click to add a plain text line" : "Bấm vào để thêm dòng văn bản thường"}
          >
            <span className="prompt-slash-hint">
              {isEn
                ? "💡 Type '/' for block options, or click to write text..."
                : "💡 Gõ '/' để hiện tùy chọn, hoặc bấm vào đây để viết văn bản..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
