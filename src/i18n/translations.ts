import type { AppLanguage } from '../types';

export const TRANSLATIONS = {
  vi: {
    // Brand & App
    appName: 'DevNotes',
    appTagline: 'Sổ tay lập trình tương tác',

    // Nav
    navDashboard: 'Mục Lục (Dashboard)',
    navNotes: 'Ghi Chú Notion',
    navStudio: 'Split Studio',
    navSnippets: 'Snippet Vault',
    navFlashcards: 'Flashcard Quiz',
    lessonsTitle: 'Danh sách bài học',
    addLesson: 'Thêm bài học',
    searchLessons: 'Tìm bài học...',
    noLessonsFound: 'Không tìm thấy bài học nào',

    // Top Navbar
    notebook: 'Sổ tay',
    overview: 'Tổng quan',
    backToDashboard: 'Về Dashboard',
    openSplitStudio: 'Mở Split Studio',
    fullscreenNote: 'Toàn màn hình Note',
    exportMd: 'Xuất .md',
    newLesson: 'Bài học mới',

    // Dashboard Hero & Stats
    dashboardBadge: 'DevNotes Dashboard & Mục Lục',
    dashboardHeroTitle: 'Mục Lục & Quản Lý Bài Học Lập Trình',
    dashboardHeroDesc: 'Tổng hợp toàn bộ kiến thức, phân loại theo chủ đề, lọc tags linh hoạt và chạy thử code ngay tức thì trong sổ tay tương tác.',
    tutorialBtn: 'Hướng Dẫn (Tutorial)',
    changeThemeBtn: 'Đổi Màu Giao Diện',
    changeLangBtn: 'Ngôn Ngữ (Language)',
    totalLessons: 'Tổng số bài học',
    runnableBlocks: 'Code Blocks thực thi',
    goalsCompleted: 'Mục tiêu hoàn thành',
    spacedRepetitionReady: 'Spaced Repetition',
    readyStatus: 'Sẵn sàng',

    // Filters
    allCategories: 'Tất cả danh mục',
    tagsLabel: 'Tags:',
    createNewTag: 'Tạo Tag mới',
    newTagNamePlaceholder: 'Tên tag mới...',
    save: 'Lưu',
    clearTagFilter: 'Xóa bộ lọc tag',
    searchPlaceholder: 'Tìm kiếm bài học theo tiêu đề, mô tả hoặc tag...',
    sortBy: 'Sắp xếp:',
    sortNewest: 'Mới nhất',
    sortOldest: 'Cũ nhất',
    sortTitle: 'Tên A - Z',
    sortProgress: 'Tiến độ hoàn thành',

    // Lesson Cards
    studyLesson: 'Học bài',
    openInStudio: 'Studio',
    blocksCount: 'blocks',
    noMatchingLessons: 'Không tìm thấy bài học phù hợp',
    tryAdjustingFilters: 'Thử thay đổi bộ lọc danh mục, tags hoặc từ khóa tìm kiếm.',

    // Blocks Toolbar
    btnText: 'Văn bản',
    btnHeading: 'Tiêu đề',
    btnHeading1: 'Tiêu đề 1',
    btnHeading2: 'Tiêu đề 2',
    btnBullet: 'Bullet List',
    btnNumbered: 'Numbered List',
    btnCodeRunner: '▶ Code Runner',
    btnCallout: 'Callout Mẹo',
    btnTodo: 'Việc cần làm',
    btnFlashcard: 'Flashcard',
    btnDivider: 'Đường kẻ',
    addTag: 'Thêm Tag',
    newTagPrompt: 'Nhập tên tag...',
    searchOrAddTag: 'Tìm hoặc tạo tag mới...',
    availableTags: 'Tag có sẵn',
    createTag: 'Tạo tag mới',
    noTagsFound: 'Không tìm thấy tag phù hợp',
    saveBtn: 'Lưu',

    // Editor & New Lesson Placeholders
    untitledLesson: 'Bài học mới không có tiêu đề',
    newLessonDesc: 'Ghi chép và thực hành các khái niệm lập trình mới.',
    generalCategory: 'Chung',
    lessonObjectivesHeading: 'Mục tiêu bài học',
    lessonNotesInit: 'Ghi chú tóm tắt kiến thức lý thuyết cần nắm vững tại đây (gõ / để mở menu block)...',
    lessonCodeInit: '// Viết code thử nghiệm tại đây\nconsole.log("Hello DevNotes!");',
    createdNewLessonActivity: 'Tạo bài học mới',
    lessonTitlePlaceholder: 'Tiêu đề bài học...',
    lessonDescPlaceholder: 'Mô tả tóm tắt nội dung bài học (hiển thị trên Dashboard)...',
    categoryLabel: 'Danh mục:',
    categoryPlaceholder: 'VD: Frontend & JS...',
    statusLabel: 'Trạng thái:',
    statusLearning: 'Đang học (Learning)',
    statusCompleted: 'Đã hoàn thành (Completed)',
    statusReview: 'Cần ôn tập (Review)',
    autoSaved: 'Đã lưu tự động',
    changeIconTooltip: 'Bấm để đổi Icon',
    deleteTagTooltip: 'Xóa tag',
    deleteBlockTooltip: 'Xóa',

    // Code Runner
    runBtn: 'Run',
    runningBtn: 'Running...',
    pinToStudio: 'Ghim sang Studio',
    copied: 'Đã copy',
    consoleOutput: 'Console Output',
    querySuccess: 'Thực thi thành công',

    // Split Studio
    lessonNotesTab: 'Tài liệu bài học',
    livePreviewTab: 'Web Live Preview',
    saveSnippetBtn: 'Lưu Snippet',
    runCodeBtn: 'Chạy Code',
    pressRunToSeeOutput: 'Nhấn "Chạy Code" để xem kết quả console hoặc truy vấn dữ liệu...',

    // Snippets Vault
    snippetVaultTitle: 'Kho Đoạn Code (Snippet Vault)',
    snippetVaultDesc: 'Lưu trữ, tra cứu và xuất trực tiếp thành VS Code Snippets cho công việc thực tế.',
    exportVSCodeSnippets: 'Xuất VS Code Snippets',
    newSnippetBtn: 'Thêm Snippet mới',
    searchSnippetsPlaceholder: 'Tìm kiếm theo tiêu đề, mô tả hoặc tags...',

    // Flashcards
    flashcardsTitle: 'Ôn Tập Spaced Repetition',
    flashcardsDesc: 'Rèn luyện phản xạ cú pháp và suy luận output trước khi chạy code.',
    addFlashcardBtn: 'Thêm Flashcard',
    cardProgress: 'Thẻ',
    completedRate: 'hoàn thành',
    flippedTimes: 'Đã lật:',
    times: 'lượt',
    clickToFlip: 'Bấm vào thẻ để lật xem đáp án',
    clickToFront: 'Bấm để quay lại mặt trước',
    selfRating: 'Mức độ tự đánh giá:',
    rateHard: '😰 Cần ôn lại',
    rateMedium: '🤔 Vừa phải',
    rateEasy: '😎 Đã nắm chắc',
    prevCard: 'Thẻ trước',
    nextCard: 'Thẻ tiếp theo',
    finishDeck: 'Hoàn thành 🎉',
    emptyCards: 'Chưa có Flashcard nào. Hãy tạo thêm flashcard để ôn tập!',

    // Tutorial Modal
    tutorialModalTitle: 'Hướng Dẫn Sử Dụng DevNotes',
    tutorialModalSubtitle: 'Cẩm nang nhanh làm chủ sổ tay lập trình tương tác.',
    gotItBtn: 'Đã hiểu, bắt đầu khám phá! 🚀',

    // Theme Picker Modal
    themePickerTitle: 'Tùy Chỉnh Màu Sắc Ứng Dụng',
    themePickerSubtitle: 'Chọn tông màu chủ đạo yêu thích cho toàn bộ giao diện DevNotes.',
    applyColorBtn: 'Áp dụng màu này',

    // Tooltips & Backup
    toggleThemeTooltip: 'Đổi giao diện Sáng / Tối',
    paletteTooltip: 'Chọn màu sắc chủ đạo (Accent Color)',
    exportBackupTooltip: 'Sao lưu dữ liệu (Export JSON)',
    importBackupTooltip: 'Khôi phục dữ liệu (Import JSON)',
    backupSuccess: 'Đã khôi phục dữ liệu thành công!',
    backupInvalid: 'File JSON không hợp lệ!',
    keepAtLeastOneLesson: 'Bạn cần giữ lại ít nhất một bài học!',
    snippetSavedSuccess: 'Đã lưu thành công vào Kho Snippets!',
    undo: 'Hoàn tác',
    redo: 'Làm lại',
    undoTooltip: 'Hoàn tác (Ctrl+Z / ⌘Z)',
    redoTooltip: 'Làm lại (Ctrl+Shift+Z / ⌘Shift+Z / Ctrl+Y)',
  },

  en: {
    // Brand & App
    appName: 'DevNotes',
    appTagline: 'Interactive Coding Notebook',

    // Nav
    navDashboard: 'Dashboard & Catalog',
    navNotes: 'Notion Notes',
    navStudio: 'Split Studio',
    navSnippets: 'Snippet Vault',
    navFlashcards: 'Flashcard Quiz',
    lessonsTitle: 'Lessons List',
    addLesson: 'New Lesson',
    searchLessons: 'Search lessons...',
    noLessonsFound: 'No lessons found',

    // Top Navbar
    notebook: 'Notebook',
    overview: 'Overview',
    backToDashboard: 'Back to Dashboard',
    openSplitStudio: 'Open Split Studio',
    fullscreenNote: 'Full Screen Note',
    exportMd: 'Export .md',
    newLesson: 'New Lesson',

    // Dashboard Hero & Stats
    dashboardBadge: 'DevNotes Dashboard & Catalog',
    dashboardHeroTitle: 'Course Catalog & Coding Workspace Hub',
    dashboardHeroDesc: 'Curate your coding knowledge, organize by tags, and execute code blocks instantly inside interactive developer notes.',
    tutorialBtn: 'App Guide (Tutorial)',
    changeThemeBtn: 'Accent Color',
    changeLangBtn: 'Language (Ngôn ngữ)',
    totalLessons: 'Total Lessons',
    runnableBlocks: 'Executable Code Blocks',
    goalsCompleted: 'Goals Completed',
    spacedRepetitionReady: 'Spaced Repetition',
    readyStatus: 'Ready',

    // Filters
    allCategories: 'All Categories',
    tagsLabel: 'Tags:',
    createNewTag: 'New Tag',
    newTagNamePlaceholder: 'New tag name...',
    save: 'Save',
    clearTagFilter: 'Clear tag filters',
    searchPlaceholder: 'Search lessons by title, description or tag...',
    sortBy: 'Sort by:',
    sortNewest: 'Newest',
    sortOldest: 'Oldest',
    sortTitle: 'Title A - Z',
    sortProgress: 'Progress',

    // Lesson Cards
    studyLesson: 'Study Note',
    openInStudio: 'Studio',
    blocksCount: 'blocks',
    noMatchingLessons: 'No matching lessons found',
    tryAdjustingFilters: 'Try adjusting your category, tag filters or search query.',

    // Blocks Toolbar
    btnText: 'Text',
    btnHeading: 'Heading',
    btnHeading1: 'Heading 1',
    btnHeading2: 'Heading 2',
    btnBullet: 'Bullet List',
    btnNumbered: 'Numbered List',
    btnCodeRunner: '▶ Code Runner',
    btnCallout: 'Callout Tip',
    btnTodo: 'To-do List',
    btnFlashcard: 'Flashcard',
    btnDivider: 'Divider',
    addTag: 'Add Tag',
    newTagPrompt: 'Enter tag name...',
    searchOrAddTag: 'Search or create new tag...',
    availableTags: 'Available tags',
    createTag: 'Create new tag',
    noTagsFound: 'No tags found',
    saveBtn: 'Save',

    // Editor & New Lesson Placeholders
    untitledLesson: 'Untitled New Lesson',
    newLessonDesc: 'Take notes and practice new programming concepts interactively.',
    generalCategory: 'General',
    lessonObjectivesHeading: 'Lesson Objectives',
    lessonNotesInit: 'Summarize key concepts and theoretical notes here (type / for block commands)...',
    lessonCodeInit: '// Write and test your code here\nconsole.log("Hello DevNotes!");',
    createdNewLessonActivity: 'Created new lesson',
    lessonTitlePlaceholder: 'Lesson title...',
    lessonDescPlaceholder: 'Brief summary of lesson content (displayed on Dashboard)...',
    categoryLabel: 'Category:',
    categoryPlaceholder: 'e.g. Frontend & JS...',
    statusLabel: 'Status:',
    statusLearning: 'Learning',
    statusCompleted: 'Completed',
    statusReview: 'Review',
    autoSaved: 'Auto-saved',
    changeIconTooltip: 'Click to change Icon',
    deleteTagTooltip: 'Remove tag',
    deleteBlockTooltip: 'Delete',

    // Code Runner
    runBtn: 'Run',
    runningBtn: 'Running...',
    pinToStudio: 'Pin to Studio',
    copied: 'Copied',
    consoleOutput: 'Console Output',
    querySuccess: 'Execution succeeded',

    // Split Studio
    lessonNotesTab: 'Lesson Reference',
    livePreviewTab: 'Web Live Preview',
    saveSnippetBtn: 'Save Snippet',
    runCodeBtn: 'Run Code',
    pressRunToSeeOutput: 'Click "Run Code" to inspect console logs or database query results...',

    // Snippets Vault
    snippetVaultTitle: 'Code Snippets Vault',
    snippetVaultDesc: 'Store, search and export directly into VS Code Snippets for your daily workflow.',
    exportVSCodeSnippets: 'Export VS Code Snippets',
    newSnippetBtn: 'Add New Snippet',
    searchSnippetsPlaceholder: 'Search by title, description or tags...',

    // Flashcards
    flashcardsTitle: 'Spaced Repetition Practice',
    flashcardsDesc: 'Sharpen your syntax recall and code output prediction before running code.',
    addFlashcardBtn: 'New Flashcard',
    cardProgress: 'Card',
    completedRate: 'completed',
    flippedTimes: 'Flipped:',
    times: 'times',
    clickToFlip: 'Click the card to flip and view answer',
    clickToFront: 'Click to flip back to question',
    selfRating: 'Self rating:',
    rateHard: '😰 Need Review',
    rateMedium: '🤔 Good',
    rateEasy: '😎 Mastered',
    prevCard: 'Previous',
    nextCard: 'Next Card',
    finishDeck: 'Completed 🎉',
    emptyCards: 'No flashcards available. Add new cards to start reviewing!',

    // Tutorial Modal
    tutorialModalTitle: 'DevNotes User Guide',
    tutorialModalSubtitle: 'A quick tour to mastering your interactive developer notebook.',
    gotItBtn: 'Got it, let’s explore! 🚀',

    // Theme Picker Modal
    themePickerTitle: 'Customize Accent Palette',
    themePickerSubtitle: 'Choose your favorite signature accent color for DevNotes.',
    applyColorBtn: 'Apply this color',

    // Tooltips & Backup
    toggleThemeTooltip: 'Toggle Light / Dark theme',
    paletteTooltip: 'Choose Accent Color',
    exportBackupTooltip: 'Backup Data (Export JSON)',
    importBackupTooltip: 'Restore Data (Import JSON)',
    backupSuccess: 'Data restored successfully!',
    backupInvalid: 'Invalid JSON file!',
    keepAtLeastOneLesson: 'You must keep at least one lesson!',
    snippetSavedSuccess: 'Saved to Snippets Vault successfully!',
    undo: 'Undo',
    redo: 'Redo',
    undoTooltip: 'Undo (Ctrl+Z / ⌘Z)',
    redoTooltip: 'Redo (Ctrl+Shift+Z / ⌘Shift+Z / Ctrl+Y)',
  },
};

export type TranslationKey = keyof typeof TRANSLATIONS.vi;

export function t(lang: AppLanguage, key: TranslationKey): string {
  return TRANSLATIONS[lang][key] || TRANSLATIONS.vi[key] || (key as string);
}
