"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "vi" | "en";

const LOCALE_KEY = "kb-locale";

const translations = {
  vi: {
    // Sidebar
    "nav.home": "Trang chủ",
    "nav.notes": "Ghi chú",
    "nav.new": "Tạo mới",
    "nav.chat": "Hỏi đáp AI",
    "nav.settings": "Cài đặt",
    "sidebar.collapse": "Thu gọn",
    "sidebar.expand": "Mở rộng",

    // Dashboard
    "dashboard.title": "Trang chủ",
    "dashboard.subtitle": "Tổng quan hệ thống tri thức nội bộ",
    "dashboard.totalNotes": "Tổng ghi chú",
    "dashboard.published": "Đã xuất bản",
    "dashboard.drafts": "Bản nháp",
    "dashboard.comments": "Bình luận",
    "dashboard.searchPlaceholder": "Tìm kiếm nhanh...",
    "dashboard.search": "Tìm",
    "dashboard.searchResults": "Kết quả tìm kiếm",
    "dashboard.recentNotes": "Ghi chú gần đây",
    "dashboard.viewAll": "Xem tất cả →",
    "dashboard.noNotes": "Chưa có ghi chú nào.",
    "dashboard.createFirst": "Tạo ghi chú đầu tiên",

    // Notes
    "notes.title": "Tất cả ghi chú",
    "notes.searchPlaceholder": "Tìm kiếm ghi chú...",
    "notes.notFound": "Không tìm thấy ghi chú nào.",
    "notes.loading": "Đang tải...",
    "notes.new": "Tạo ghi chú mới",
    "notes.edit": "Chỉnh sửa ghi chú",
    "notes.titleField": "Tiêu đề",
    "notes.author": "Tác giả",
    "notes.folder": "Thư mục (chọn hoặc tạo mới)",
    "notes.tags": "Tags (phân cách bởi dấu phẩy)",
    "notes.draft": "Bản nháp",
    "notes.publish": "Xuất bản",
    "notes.published": "Đã xuất bản",
    "notes.contentPlaceholder": "Viết nội dung bằng markdown...",
    "notes.create": "Tạo ghi chú",
    "notes.save": "Lưu thay đổi",
    "notes.saving": "Đang lưu...",
    "notes.editBtn": "Sửa",
    "notes.deleteBtn": "Xoá",
    "notes.deleteConfirm": "Xoá ghi chú này? Hành động không thể hoàn tác.",
    "notes.createError": "Không thể tạo ghi chú",
    "notes.updateError": "Cập nhật thất bại",
    "notes.loadError": "Không thể tải ghi chú",
    "notes.deleteError": "Xoá thất bại",

    // Chat
    "chat.title": "Hỏi đáp AI",
    "chat.subtitle": "Hybrid search (FTS + Vector) · Streaming responses",
    "chat.placeholder": "Đặt câu hỏi...",
    "chat.send": "Gửi",
    "chat.empty": "Hỏi bất cứ điều gì về ghi chú và tài liệu nội bộ.",
    "chat.retrieving": "Đang tìm kiếm ngữ cảnh...",
    "chat.sources": "Nguồn tham khảo:",
    "chat.score": "điểm",
    "chat.error": "Hỏi đáp thất bại",

    // Settings
    "settings.title": "Cài đặt",
    "settings.subtitle": "Tuỳ chỉnh giao diện và ngôn ngữ",
    "settings.theme": "Giao diện",
    "settings.themeDesc": "Chọn chế độ hiển thị phù hợp với bạn.",
    "settings.language": "Ngôn ngữ",
    "settings.languageDesc": "Chọn ngôn ngữ hiển thị.",
    "settings.scrollTop": "Cuộn lên đầu trang",
    "settings.scrollTopDesc": "Hiện nút Scroll to top khi note hoặc trang dài — có thể tắt nếu không cần.",
    "settings.scrollTopToggle": "Bật nút Scroll to top",

    // Comments
    "comments.title": "Bình luận",
    "comments.name": "Tên của bạn",
    "comments.placeholder": "Viết bình luận (hỗ trợ markdown)",
    "comments.post": "Đăng bình luận",
    "comments.posting": "Đang gửi...",
    "comments.empty": "Chưa có bình luận nào.",
    "comments.error": "Không thể đăng bình luận",

    // Folders
    "folders.title": "Thư mục",
    "folders.all": "Tất cả",
    "folders.empty": "Chưa có thư mục",
    "folders.allTags": "Tất cả tags",
    "folders.create": "Tạo",

    // Upload
    "upload.title": "Import Markdown",
    "upload.desc": "Kéo thả hoặc chọn file .md để import thành ghi chú mới.",
    "upload.dropzone": "Kéo thả file .md vào đây hoặc nhấn để chọn",
    "upload.processing": "Đang xử lý...",
    "upload.success": "Import thành công!",
    "upload.error": "Import thất bại",
  },
  en: {
    // Sidebar
    "nav.home": "Home",
    "nav.notes": "Notes",
    "nav.new": "New Note",
    "nav.chat": "AI Chat",
    "nav.settings": "Settings",
    "sidebar.collapse": "Collapse",
    "sidebar.expand": "Expand",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Internal knowledge base overview",
    "dashboard.totalNotes": "Total Notes",
    "dashboard.published": "Published",
    "dashboard.drafts": "Drafts",
    "dashboard.comments": "Comments",
    "dashboard.searchPlaceholder": "Quick search...",
    "dashboard.search": "Search",
    "dashboard.searchResults": "Search Results",
    "dashboard.recentNotes": "Recent Notes",
    "dashboard.viewAll": "View all →",
    "dashboard.noNotes": "No notes yet.",
    "dashboard.createFirst": "Create your first note",

    // Notes
    "notes.title": "All Notes",
    "notes.searchPlaceholder": "Search notes...",
    "notes.notFound": "No notes found.",
    "notes.loading": "Loading...",
    "notes.new": "New Note",
    "notes.edit": "Edit Note",
    "notes.titleField": "Title",
    "notes.author": "Author",
    "notes.folder": "Folder (select or create new)",
    "notes.tags": "Tags (comma-separated)",
    "notes.draft": "Draft",
    "notes.publish": "Published",
    "notes.published": "Published",
    "notes.contentPlaceholder": "Write content in markdown...",
    "notes.create": "Create Note",
    "notes.save": "Save Changes",
    "notes.saving": "Saving...",
    "notes.editBtn": "Edit",
    "notes.deleteBtn": "Delete",
    "notes.deleteConfirm": "Delete this note? This cannot be undone.",
    "notes.createError": "Failed to create note",
    "notes.updateError": "Failed to update",
    "notes.loadError": "Failed to load note",
    "notes.deleteError": "Failed to delete",

    // Chat
    "chat.title": "AI Chat",
    "chat.subtitle": "Hybrid search (FTS + Vector) · Streaming responses",
    "chat.placeholder": "Ask a question...",
    "chat.send": "Send",
    "chat.empty": "Ask anything about your internal notes and documentation.",
    "chat.retrieving": "Retrieving context...",
    "chat.sources": "Sources:",
    "chat.score": "score",
    "chat.error": "Chat failed",

    // Settings
    "settings.title": "Settings",
    "settings.subtitle": "Customize appearance and language",
    "settings.theme": "Appearance",
    "settings.themeDesc": "Choose your preferred display mode.",
    "settings.language": "Language",
    "settings.languageDesc": "Choose display language.",
    "settings.scrollTop": "Scroll to top",
    "settings.scrollTopDesc": "Show a scroll-to-top button on long pages — turn off if you prefer a cleaner UI.",
    "settings.scrollTopToggle": "Enable scroll-to-top button",

    // Comments
    "comments.title": "Comments",
    "comments.name": "Your name",
    "comments.placeholder": "Write a comment (markdown supported)",
    "comments.post": "Post Comment",
    "comments.posting": "Posting...",
    "comments.empty": "No comments yet.",
    "comments.error": "Failed to post comment",

    // Folders
    "folders.title": "Folders",
    "folders.all": "All",
    "folders.empty": "No folders yet",
    "folders.allTags": "All tags",
    "folders.create": "Create",

    // Upload
    "upload.title": "Import Markdown",
    "upload.desc": "Drag & drop or select .md files to import as new notes.",
    "upload.dropzone": "Drop .md files here or click to select",
    "upload.processing": "Processing...",
    "upload.success": "Import successful!",
    "upload.error": "Import failed",
  },
} as const;

type TranslationKey = keyof typeof translations.vi;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored === "en" || stored === "vi") {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(LOCALE_KEY, next);
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[locale][key] ?? key;
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
