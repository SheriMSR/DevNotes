export type LanguageId = 
  | 'csharp' 
  | 'sql' 
  | 'bash' 
  | 'javascript' 
  | 'typescript' 
  | 'html' 
  | 'css' 
  | 'json'
  | 'python'
  | 'cpp';

export interface CodeOutput {
  logs: string[];
  error?: string;
  returnValue?: string;
  tableData?: { columns: string[]; rows: (string | number | null)[][] };
  executionTimeMs?: number;
  timestamp: number;
}

export type BlockType = 
  | 'text' 
  | 'heading1' 
  | 'heading2' 
  | 'heading3' 
  | 'bullet'
  | 'numbered'
  | 'code' 
  | 'callout' 
  | 'todo' 
  | 'flashcard' 
  | 'divider'
  | 'columns'
  | 'table'
  | 'toggle';

export interface CalloutType {
  variant: 'tip' | 'warning' | 'info' | 'concept';
  title?: string;
}

export interface ToggleMeta {
  isOpen: boolean;
}

export interface ColumnsMeta {
  leftRatio: number; // e.g. 50 (percentage for left column, 20 to 80)
  leftBlocks: Block[];
  rightBlocks: Block[];
}

export interface TableColumn {
  id: string;
  name: string;
  type: 'text' | 'tags' | 'status';
  width?: number;
}

export interface TableRow {
  id: string;
  cells: Record<string, string>; // columnId -> cell value
}

export interface TableMeta {
  title?: string;
  columns: TableColumn[];
  rows: TableRow[];
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  language?: LanguageId;
  checked?: boolean; // for todo
  calloutMeta?: CalloutType;
  flashcardMeta?: { question: string; answer: string; hint?: string };
  codeOutput?: CodeOutput;
  columnsMeta?: ColumnsMeta;
  tableMeta?: TableMeta;
  toggleMeta?: ToggleMeta;
  children?: Block[];
}

export type AccentColor = 'indigo' | 'emerald' | 'sky' | 'rose' | 'amber' | 'violet' | 'mono';
export type BackgroundTheme = 'midnight' | 'black' | 'charcoal' | 'navy' | 'nord' | 'light' | 'sepia';
export type AppLanguage = 'vi' | 'en';
export type AppViewMode = 'dashboard' | 'notes' | 'studio' | 'snippets' | 'flashcards';

export interface LearningActivity {
  id: string;
  type: 'note' | 'code' | 'todo' | 'flashcard' | 'snippet';
  timestamp: number;
  label: string;
}

export interface Page {
  id: string;
  title: string;
  icon: string;
  description?: string;
  category?: string;
  status?: 'learning' | 'completed' | 'review';
  coverGradient?: string;
  parentId?: string | null;
  tags: string[];
  blocks: Block[];
  createdAt: number;
  updatedAt: number;
}

export interface Snippet {
  id: string;
  title: string;
  description: string;
  language: LanguageId;
  code: string;
  tags: string[];
  createdAt: number;
  updatedAt?: number;
  pageId?: string;
}

export interface FlashcardItem {
  id: string;
  question: string;
  answer: string;
  codeSnippet?: string;
  language?: LanguageId;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  lastReviewed?: number;
}

export interface DashboardTodo {
  id: string;
  text: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface StickyNote {
  id: string;
  title: string;
  content: string;
  color: 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'orange';
  isPinned?: boolean;
  createdAt: number;
}

export type QuickTipColor = 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple';

export interface QuickTip {
  id: string;
  title: string;
  category: string;
  shortcut?: string;
  description: string;
  isPinned?: boolean;
  color?: QuickTipColor;
  createdAt: number;
}


