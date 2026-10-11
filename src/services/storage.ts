import type { Page, Snippet, FlashcardItem, AccentColor, AppLanguage, BackgroundTheme, LearningActivity, AppViewMode, LanguageId, DashboardTodo, StickyNote, QuickTip } from '../types';

const STORAGE_KEYS = {
  PAGES: 'devnotes_pages_v1',
  SNIPPETS: 'devnotes_snippets_v1',
  FLASHCARDS: 'devnotes_flashcards_v1',
  ACTIVE_PAGE_ID: 'devnotes_active_page_id_v1',
  THEME: 'devnotes_theme_v1',
  ACCENT_COLOR: 'devnotes_accent_color_v1',
  BACKGROUND_THEME: 'devnotes_bg_theme_v1',
  LANGUAGE: 'devnotes_lang_v1',
  ACTIVITIES: 'devnotes_activities_v1',
  VIEW_MODE: 'devnotes_view_mode_v1',
  CUSTOM_TAGS: 'devnotes_custom_tags_v1',
  STUDIO_CODE: 'devnotes_studio_code_v1',
  STUDIO_LANG: 'devnotes_studio_lang_v1',
  DASHBOARD_TODOS: 'devnotes_dashboard_todos_v1',
  DASHBOARD_STICKIES: 'devnotes_dashboard_stickies_v1',
  QUICK_TIPS: 'devnotes_quick_tips_v1',
};

export const INITIAL_PAGES: Page[] = [
  {
    id: 'page-js-async',
    title: 'JavaScript: Async/Await & Event Loop',
    icon: '⚡',
    description: 'Tìm hiểu cơ chế Microtask vs Macrotask trong Event Loop và thực hành Promise async/await không nghẽn luồng.',
    category: 'Frontend & JS',
    status: 'learning',
    coverGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    tags: ['JavaScript', 'Core', 'Async'],
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000,
    blocks: [
      {
        id: 'b-1',
        type: 'heading1',
        content: 'Bản chất Bất Đồng Bộ trong JavaScript',
      },
      {
        id: 'b-2',
        type: 'callout',
        content: 'Event Loop quản lý Call Stack, Microtask Queue (Promises), và Macrotask Queue (setTimeout). Microtasks luôn được ưu tiên xử lý trước!',
        calloutMeta: { variant: 'concept', title: 'Quy tắc vàng của Event Loop' },
      },
      {
        id: 'b-3',
        type: 'text',
        content: 'Hãy chạy thử đoạn code dưới đây để xem thứ tự in log thực tế giữa synchronous code, setTimeout và Promise.then():',
      },
      {
        id: 'b-4',
        type: 'code',
        language: 'javascript',
        content: `console.log("1. Đồng bộ bắt đầu");

setTimeout(() => {
  console.log("4. Macrotask (setTimeout 0ms)");
}, 0);

Promise.resolve().then(() => {
  console.log("3. Microtask (Promise.then)");
});

console.log("2. Đồng bộ kết thúc");
"Execution complete! 🚀"`,
      },
      {
        id: 'b-5',
        type: 'heading2',
        content: 'Checklist cần nắm vững',
      },
      {
        id: 'b-6',
        type: 'todo',
        content: 'Hiểu khác biệt giữa Callback, Promise và async/await',
        checked: true,
      },
      {
        id: 'b-7',
        type: 'todo',
        content: 'Xử lý lỗi với try/catch trong async function',
        checked: true,
      },
      {
        id: 'b-8',
        type: 'todo',
        content: 'Tránh vòng lặp tuần tự gây nghẽn (dùng Promise.all)',
        checked: false,
      },
    ],
  },
  {
    id: 'page-python-tricks',
    title: 'Python: List Comprehension & High Performance',
    icon: '🐍',
    description: 'Tối ưu hiệu năng và viết mã ngắn gọn, chuẩn Pythonic với List Comprehension và Dict Comprehension.',
    category: 'Backend & Data',
    status: 'learning',
    coverGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    tags: ['Python', 'Data', 'Tips'],
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 7200000,
    blocks: [
      {
        id: 'py-1',
        type: 'heading1',
        content: 'Viết code chuẩn Pythonic với List Comprehension',
      },
      {
        id: 'py-2',
        type: 'callout',
        content: 'List comprehension không chỉ ngắn gọn hơn vòng for thông thường mà còn chạy nhanh hơn do được tối ưu ở tầng CPython bytecode.',
        calloutMeta: { variant: 'tip', title: 'Hiệu năng Python' },
      },
      {
        id: 'py-3',
        type: 'code',
        language: 'python',
        content: `# Lọc số chẵn và bình phương chúng
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens_squared = [x**2 for x in numbers if x % 2 == 0]

print("Danh sách ban đầu:", numbers)
print("Số chẵn bình phương:", evens_squared)

# Dict comprehension đếm độ dài chuỗi
words = ["Python", "Fast", "Interactive", "Notion", "Workspace"]
word_lens = {w: len(w) for w in words}
print("Thống kê độ dài từ:", word_lens)`,
      },
    ],
  },
  {
    id: 'page-sql-queries',
    title: 'SQL: Truy vấn & Thống kê dữ liệu với SQLite',
    icon: '🗄️',
    description: 'Học cách gom nhóm GROUP BY, tính trung bình AVG và hàm thống kê dữ liệu thực tế với SQLite WASM.',
    category: 'Database & SQL',
    status: 'completed',
    coverGradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    tags: ['Database', 'SQL', 'Backend'],
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now(),
    blocks: [
      {
        id: 'sql-1',
        type: 'heading1',
        content: 'Truy vấn nhóm và tính điểm tích lũy',
      },
      {
        id: 'sql-2',
        type: 'callout',
        content: 'Bảng "users" đã được tự động khởi tạo trong bộ nhớ SQLite WASM. Bạn có thể SELECT trực tiếp hoặc chèn thêm dữ liệu!',
        calloutMeta: { variant: 'info', title: 'Sandbox Database' },
      },
      {
        id: 'sql-3',
        type: 'code',
        language: 'sql',
        content: `SELECT 
  role, 
  COUNT(*) AS total_devs, 
  AVG(points) AS average_points,
  MAX(points) AS highest_score
FROM users 
GROUP BY role
ORDER BY average_points DESC;`,
      },
    ],
  },
  {
    id: 'page-html-preview',
    title: 'HTML & CSS: Glassmorphism Card Component',
    icon: '🎨',
    description: 'Xây dựng giao diện hiệu ứng kính mờ (frosted glass) hiện đại chuẩn Apple/Linear bằng CSS backdrop-filter.',
    category: 'UI/UX & Frontend',
    status: 'learning',
    coverGradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    tags: ['Frontend', 'CSS', 'UI/UX'],
    createdAt: Date.now() - 20000000,
    updatedAt: Date.now(),
    blocks: [
      {
        id: 'html-1',
        type: 'heading1',
        content: 'Hiệu ứng Frosted Glass hiện đại',
      },
      {
        id: 'html-2',
        type: 'callout',
        content: 'Sử dụng backdrop-filter: blur(12px) kết hợp viền bán trong suốt để tạo chiều sâu thị giác.',
        calloutMeta: { variant: 'tip', title: 'Thiết kế hiện đại' },
      },
      {
        id: 'html-3',
        type: 'code',
        language: 'html',
        content: `<div style="background: linear-gradient(135deg, #0f172a, #1e1b4b); padding: 30px; border-radius: 16px; font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center;">
  <div style="background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 16px; padding: 24px; color: white; width: 280px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);">
    <div style="font-size: 24px; margin-bottom: 8px;">✨ Glassmorphic</div>
    <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 16px 0;">Thiết kế tương lai cho Developer Notes.</p>
    <button style="background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;">Khám phá ngay</button>
  </div>
</div>`,
      },
    ],
  },
];

export const INITIAL_SNIPPETS: Snippet[] = [
  {
    id: 'snip-1',
    title: 'Deep Clone an Object (Safe)',
    description: 'Sao chép sâu object trong JavaScript sử dụng structuredClone chuẩn ES2022',
    language: 'javascript',
    code: `const original = { name: "Alice", skills: ["React", "Python"], meta: { score: 99 } };
const cloned = structuredClone(original);
cloned.meta.score = 100;
console.log("Original score:", original.meta.score); // 99 (không bị thay đổi)`,
    tags: ['JavaScript', 'Utility', 'Objects'],
    createdAt: Date.now() - 50000000,
  },
  {
    id: 'snip-2',
    title: 'Python Timing Decorator',
    description: 'Đo lường thời gian thực thi của bất kỳ hàm nào bằng Decorator',
    language: 'python',
    code: `import time
from functools import wraps

def timeit(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_now()
        result = func(*args, **kwargs)
        duration = time.perf_now() - start
        print(f"Hàm {func.__name__} chạy mất: {duration:.5f}s")
        return result
    return wrapper`,
    tags: ['Python', 'Performance', 'Decorator'],
    createdAt: Date.now() - 40000000,
  },
  {
    id: 'snip-3',
    title: 'SQL Upsert (Insert or Update)',
    description: 'Cú pháp UPSERT chuẩn trong SQLite và PostgreSQL khi trùng khoá chính',
    language: 'sql',
    code: `INSERT INTO users (id, name, role, points)
VALUES (1, 'Alice Updated', 'Fullstack Lead', 250)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  role = excluded.role,
  points = excluded.points;`,
    tags: ['SQL', 'Database', 'CRUD'],
    createdAt: Date.now() - 30000000,
  },
];

export const INITIAL_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc-1',
    question: 'Trong JavaScript, điều gì xảy ra khi bạn so sánh `[] == ![]`?',
    answer: 'Kết quả là `true`! Vì `![]` ép kiểu thành boolean `false`. Khi so sánh `[] == false`, cả 2 vế được ép kiểu thành số `0 == 0`, cho ra `true`.',
    codeSnippet: 'console.log([] == ![]); // true',
    language: 'javascript',
    difficulty: 'medium',
    category: 'Type Coercion',
  },
  {
    id: 'fc-2',
    question: 'Độ phức tạp thời gian trung bình khi tìm kiếm phần tử trong Python `set` và `dict` là gì?',
    answer: 'O(1) hằng số thời gian nhờ cơ chế băm (Hash Table lookup).',
    language: 'python',
    difficulty: 'easy',
    category: 'Data Structures',
  },
  {
    id: 'fc-3',
    question: 'Sự khác biệt giữa `WHERE` và `HAVING` trong câu lệnh SQL là gì?',
    answer: '`WHERE` lọc các dòng dữ liệu TRƯỚC KHI gom nhóm (GROUP BY), còn `HAVING` lọc các nhóm dữ liệu SAU KHI đã tổng hợp hàm tích hợp (SUM, COUNT, AVG).',
    language: 'sql',
    difficulty: 'easy',
    category: 'Database Basics',
  },
  {
    id: 'fc-4',
    question: 'Toán tử Spread `...` trong JS tạo ra Shallow Copy hay Deep Copy?',
    answer: 'Shallow Copy! Các object con lồng bên trong vẫn trỏ chung vùng tham chiếu bộ nhớ.',
    codeSnippet: `const a = { x: { y: 1 } };
const b = { ...a };
b.x.y = 2; // a.x.y cũng sẽ bị đổi thành 2`,
    language: 'javascript',
    difficulty: 'medium',
    category: 'JavaScript Immutability',
  },
];

// Local Storage helpers
export function loadPages(): Page[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PAGES);
    return data ? JSON.parse(data) : INITIAL_PAGES;
  } catch {
    return INITIAL_PAGES;
  }
}

export function savePages(pages: Page[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pages));
  } catch (err) {
    console.error('Failed to save pages:', err);
  }
}

export function loadSnippets(): Snippet[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SNIPPETS);
    return data ? JSON.parse(data) : INITIAL_SNIPPETS;
  } catch {
    return INITIAL_SNIPPETS;
  }
}

export function saveSnippets(snippets: Snippet[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SNIPPETS, JSON.stringify(snippets));
  } catch (err) {
    console.error('Failed to save snippets:', err);
  }
}

export function loadFlashcards(): FlashcardItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
    return data ? JSON.parse(data) : INITIAL_FLASHCARDS;
  } catch {
    return INITIAL_FLASHCARDS;
  }
}

export function saveFlashcards(cards: FlashcardItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(cards));
  } catch (err) {
    console.error('Failed to save flashcards:', err);
  }
}

export function loadActivePageId(): string {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_PAGE_ID) || 'page-js-async';
}

export function saveActivePageId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PAGE_ID, id);
}

export function loadTheme(): 'dark' | 'light' {
  return (localStorage.getItem(STORAGE_KEYS.THEME) as 'dark' | 'light') || 'dark';
}

export function saveTheme(theme: 'dark' | 'light'): void {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

export function loadAccentColor(): AccentColor {
  return (localStorage.getItem(STORAGE_KEYS.ACCENT_COLOR) as AccentColor) || 'indigo';
}

export function saveAccentColor(accent: AccentColor): void {
  localStorage.setItem(STORAGE_KEYS.ACCENT_COLOR, accent);
}

export function loadLanguage(): AppLanguage {
  return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as AppLanguage) || 'vi';
}

export function saveLanguage(lang: AppLanguage): void {
  localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
}

export function loadBackgroundTheme(): BackgroundTheme {
  return (localStorage.getItem(STORAGE_KEYS.BACKGROUND_THEME) as BackgroundTheme) || 'midnight';
}

export function saveBackgroundTheme(theme: BackgroundTheme): void {
  localStorage.setItem(STORAGE_KEYS.BACKGROUND_THEME, theme);
}

export function loadViewMode(): AppViewMode {
  return (localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as AppViewMode) || 'dashboard';
}

export function saveViewMode(mode: AppViewMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
  } catch (err) {
    console.error('Failed to save view mode:', err);
  }
}

export function loadCustomTags(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_TAGS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCustomTags(tags: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TAGS, JSON.stringify(tags));
  } catch (err) {
    console.error('Failed to save custom tags:', err);
  }
}

export function loadStudioCode(): Record<string, string> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STUDIO_CODE);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveStudioCode(codes: Record<string, string>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDIO_CODE, JSON.stringify(codes));
  } catch (err) {
    console.error('Failed to save studio code:', err);
  }
}

export function loadStudioLang(): LanguageId {
  const lang = (localStorage.getItem(STORAGE_KEYS.STUDIO_LANG) as LanguageId) || 'csharp';
  if (lang === 'python' || lang === 'cpp') return 'csharp';
  return lang;
}

export function saveStudioLang(lang: LanguageId): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDIO_LANG, lang);
  } catch (err) {
    console.error('Failed to save studio language:', err);
  }
}

// Generate realistic simulated activities for the past 60 days
function generateSeedActivities(): LearningActivity[] {
  const activities: LearningActivity[] = [];
  const now = Date.now();
  const dayMs = 86400000;

  // Patterns for simulated daily commits/learning
  const activityDistribution = [
    { daysAgo: 0, count: 5, type: 'code' as const, label: 'Thực thi Python & JS Sandbox' },
    { daysAgo: 0, count: 3, type: 'note' as const, label: 'Tạo ghi chú Event Loop' },
    { daysAgo: 1, count: 4, type: 'flashcard' as const, label: 'Luyện tập Flashcards' },
    { daysAgo: 2, count: 6, type: 'code' as const, label: 'Truy vấn SQLite WASM' },
    { daysAgo: 3, count: 2, type: 'todo' as const, label: 'Hoàn thành bài tập Async' },
    { daysAgo: 4, count: 3, type: 'code' as const, label: 'Viết List Comprehension' },
    { daysAgo: 5, count: 5, type: 'snippet' as const, label: 'Lưu Snippet Deep Clone' },
    { daysAgo: 6, count: 2, type: 'note' as const, label: 'Thêm bài học Glassmorphism' },
    { daysAgo: 7, count: 4, type: 'flashcard' as const, label: 'Ôn tập Spaced Repetition' },
    { daysAgo: 9, count: 3, type: 'code' as const, label: 'Thử nghiệm Web Preview' },
    { daysAgo: 10, count: 5, type: 'todo' as const, label: 'Checklist JavaScript' },
    { daysAgo: 11, count: 4, type: 'code' as const, label: 'Chạy thuật toán Two Sum' },
    { daysAgo: 12, count: 2, type: 'snippet' as const, label: 'Lưu SQL Upsert' },
    { daysAgo: 14, count: 6, type: 'code' as const, label: 'Luyện Code Studio' },
    { daysAgo: 15, count: 3, type: 'note' as const, label: 'Tạo tài liệu Backend' },
    { daysAgo: 16, count: 5, type: 'flashcard' as const, label: 'Lật thẻ Quiz' },
    { daysAgo: 18, count: 2, type: 'code' as const, label: 'Kiểm tra Promise.all' },
    { daysAgo: 19, count: 4, type: 'todo' as const, label: 'Hoàn thành mục tiêu tuần' },
    { daysAgo: 21, count: 3, type: 'code' as const, label: 'Python Decorator benchmark' },
    { daysAgo: 22, count: 5, type: 'snippet' as const, label: 'Thêm snippet mới' },
    { daysAgo: 24, count: 4, type: 'flashcard' as const, label: 'Ôn tập cú pháp SQL' },
    { daysAgo: 25, count: 6, type: 'code' as const, label: 'Chạy query GROUP BY' },
    { daysAgo: 27, count: 2, type: 'note' as const, label: 'Ghi chú Design Patterns' },
    { daysAgo: 28, count: 3, type: 'code' as const, label: 'Luyện tập JS Closures' },
    { daysAgo: 30, count: 5, type: 'flashcard' as const, label: 'Streak ôn tập ngày thứ 30' },
    { daysAgo: 32, count: 4, type: 'todo' as const, label: 'Hoàn tất khóa học cơ bản' },
    { daysAgo: 34, count: 3, type: 'code' as const, label: 'Khởi tạo SQLite database' },
    { daysAgo: 36, count: 5, type: 'code' as const, label: 'Luyện tập C++ Vectors' },
    { daysAgo: 38, count: 2, type: 'snippet' as const, label: 'Lưu thuật toán sắp xếp' },
    { daysAgo: 40, count: 4, type: 'note' as const, label: 'Khởi tạo sổ tay DevNotes' },
  ];

  activityDistribution.forEach((act, index) => {
    for (let i = 0; i < act.count; i++) {
      activities.push({
        id: `act-${index}-${i}`,
        type: act.type,
        timestamp: now - act.daysAgo * dayMs - i * 1800000,
        label: act.label,
      });
    }
  });

  return activities;
}

export function loadActivities(): LearningActivity[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return data ? JSON.parse(data) : generateSeedActivities();
  } catch {
    return generateSeedActivities();
  }
}

export function saveActivities(activities: LearningActivity[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (err) {
    console.error('Failed to save activities:', err);
  }
}

export function recordActivity(type: LearningActivity['type'], label: string): LearningActivity[] {
  const current = loadActivities();
  const newActivity: LearningActivity = {
    id: 'act-' + Math.random().toString(36).substring(2, 9),
    type,
    timestamp: Date.now(),
    label,
  };
  const updated = [newActivity, ...current];
  saveActivities(updated);
  return updated;
}

export const INITIAL_DASHBOARD_TODOS: DashboardTodo[] = [
  {
    id: 'dt-1',
    text: 'Ôn tập kiến thức Kafka: Partition, Broker & Consumer Group',
    completed: true,
    priority: 'high',
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'dt-2',
    text: 'Luyện tập 1 bài LeetCode (Two Pointers / Sliding Window)',
    completed: false,
    priority: 'medium',
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'dt-3',
    text: 'Tối ưu truy vấn SQL với Clustered & Non-clustered Index',
    completed: false,
    priority: 'high',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'dt-4',
    text: 'Đọc tài liệu Clean Architecture & CQRS pattern',
    completed: false,
    priority: 'low',
    createdAt: Date.now(),
  },
];

export function loadDashboardTodos(): DashboardTodo[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DASHBOARD_TODOS);
    return data ? JSON.parse(data) : INITIAL_DASHBOARD_TODOS;
  } catch {
    return INITIAL_DASHBOARD_TODOS;
  }
}

export function saveDashboardTodos(todos: DashboardTodo[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_TODOS, JSON.stringify(todos));
  } catch (err) {
    console.error('Failed to save dashboard todos:', err);
  }
}

export const INITIAL_STICKY_NOTES: StickyNote[] = [
  {
    id: 'sn-1',
    title: '💡 Kafka Best Practice',
    content: 'Key partition quyết định tin nhắn vào partition nào. Cùng key sẽ luôn vào cùng partition và đảm bảo thứ tự nghiêm ngặt!',
    color: 'yellow',
    isPinned: true,
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'sn-2',
    title: '📌 Phím tắt DevNotes',
    content: '• Gõ / để mở menu chèn khối\n• Kéo 6 chấm để đổi vị trí\n• Gộp con vào cha với icon Layers',
    color: 'blue',
    isPinned: true,
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'sn-3',
    title: '🚀 Lệnh Docker hay dùng',
    content: 'docker compose up -d\ndocker compose logs -f kafka\ndocker system prune -f',
    color: 'green',
    isPinned: false,
    createdAt: Date.now() - 3600000,
  },
];

export function loadStickyNotes(): StickyNote[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DASHBOARD_STICKIES);
    return data ? JSON.parse(data) : INITIAL_STICKY_NOTES;
  } catch {
    return INITIAL_STICKY_NOTES;
  }
}

export function saveStickyNotes(stickies: StickyNote[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_STICKIES, JSON.stringify(stickies));
  } catch (err) {
    console.error('Failed to save sticky notes:', err);
  }
}

export const INITIAL_QUICK_TIPS: QuickTip[] = [
  {
    id: 'tip-1',
    title: 'Chụp vùng màn hình lưu thẳng vào Clipboard',
    category: 'mac',
    shortcut: '⌘ + ⌃ + ⇧ + 4',
    description: 'Chụp ảnh màn hình vùng chọn và lưu trực tiếp vào bộ nhớ tạm (Clipboard), sau đó chỉ cần nhấn ⌘V để dán ngay vào DevNotes hoặc khung chat mà không làm rác Desktop.',
    isPinned: true,
    color: 'sky',
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'tip-2',
    title: 'Chụp ảnh một cửa sổ ứng dụng (có bóng viền mờ)',
    category: 'mac',
    shortcut: '⌘ + ⇧ + 4 + Space',
    description: 'Nhấn tổ hợp phím rồi bấm phím Cách (Spacebar), con trỏ biến thành icon máy ảnh để click chụp riêng 1 cửa sổ với viền đổ bóng macOS cực đẹp.',
    isPinned: true,
    color: 'indigo',
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'tip-3',
    title: 'In dữ liệu dạng bảng trong Console (DevTools)',
    category: 'code',
    shortcut: 'console.table(data)',
    description: 'Thay vì dùng console.log in ra object rối rắm, dùng console.table() để hiển thị mảng hoặc object thành bảng trực quan với đầy đủ cột và hàng.',
    isPinned: true,
    color: 'emerald',
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'tip-4',
    title: 'Hủy commit gần nhất nhưng vẫn giữ nguyên code',
    category: 'git',
    shortcut: 'git reset --soft HEAD~1',
    description: 'Rút lại commit vừa tạo nhưng toàn bộ thay đổi vẫn nằm an toàn trong Staging Area để bạn sửa lại commit message hoặc bổ sung thêm file.',
    isPinned: true,
    color: 'amber',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'tip-5',
    title: 'Tô đen & di chuyển nhiều block cùng lúc trong DevNotes',
    category: 'devnotes',
    shortcut: 'Shift + Click',
    description: 'Quét chuột qua các block (hoặc giữ Shift + Click 6 chấm) để chọn nhiều block. Nắm kéo 6 chấm hoặc dùng Alt+↑ / Alt+↓ để dời cả cụm!',
    isPinned: true,
    color: 'purple',
    createdAt: Date.now() - 3600000 * 1,
  },
  {
    id: 'tip-6',
    title: 'Tạm cất toàn bộ code dang dở (kể cả file mới tạo)',
    category: 'git',
    shortcut: 'git stash -u',
    description: 'Tham số -u (untracked) giúp cất cả các file mới chưa được add vào git, đảm bảo thư mục làm việc hoàn toàn sạch để chuyển nhánh.',
    isPinned: false,
    color: 'rose',
    createdAt: Date.now() - 3600000 * 0.8,
  },
  {
    id: 'tip-7',
    title: 'Format toàn bộ file code theo chuẩn trong VS Code',
    category: 'code',
    shortcut: '⇧ + ⌥ + F',
    description: 'Tự động thụt đầu dòng, căn chỉnh dấu phẩy và làm đẹp toàn bộ file theo quy chuẩn Prettier / linter của dự án chỉ với một phím tắt.',
    isPinned: false,
    color: 'emerald',
    createdAt: Date.now() - 3600000 * 0.5,
  },
  {
    id: 'tip-8',
    title: 'Buộc thoát ứng dụng bị treo trên Mac (Force Quit)',
    category: 'mac',
    shortcut: '⌥ + ⌘ + Esc',
    description: 'Mở cửa sổ Force Quit Applications ngay lập tức khi một phần mềm bị quay đĩa hoặc không phản hồi.',
    isPinned: false,
    color: 'rose',
    createdAt: Date.now() - 3600000 * 0.2,
  },
];

export function loadQuickTips(): QuickTip[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUICK_TIPS);
    if (!data) return INITIAL_QUICK_TIPS;
    const tips: QuickTip[] = JSON.parse(data);
    return tips.map((t) => {
      if (t.id === 'tip-5' && t.shortcut && t.shortcut.includes('Kéo chuột qua các block')) {
        return {
          ...t,
          shortcut: 'Shift + Click',
          description: 'Quét chuột qua các block (hoặc giữ Shift + Click 6 chấm) để chọn nhiều block. Nắm kéo 6 chấm hoặc dùng Alt+↑ / Alt+↓ để dời cả cụm!',
        };
      }
      return t;
    });
  } catch {
    return INITIAL_QUICK_TIPS;
  }
}

export function saveQuickTips(tips: QuickTip[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUICK_TIPS, JSON.stringify(tips));
  } catch (err) {
    console.error('Failed to save quick tips:', err);
  }
}


