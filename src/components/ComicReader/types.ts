/**
 * PDF Reader Types
 * 
 * Type definitions for the manga/comic PDF reader component
 */

// Chapter information with PDF link
export interface PDFChapter {
  id: string | number;
  number: number;
  title: string;
  pdfUrl: string; // URL to the PDF file
  totalPages?: number;
  isDownloaded?: boolean;
  isLocked?: boolean;
  thumbnail?: string;
}

// Manga/Comic information
export interface MangaInfo {
  id: string | number;
  title: string;
  coverImage: string;
  author?: string;
  genre?: string[];
  description?: string;
  totalChapters: number;
  chapters: PDFChapter[];
  rating?: number;
}

// Comment interface
export interface ReaderComment {
  id: string | number;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  likes: number;
  timestamp: Date | string;
  isLiked?: boolean;
  replies?: ReaderComment[];
}

// Reader preferences
export interface ReaderPreferences {
  scrollDirection: 'vertical' | 'horizontal';
  brightness: number; // 0-100
  enableDoubleTapZoom: boolean;
  showPageNumber: boolean;
  backgroundColor: string;
  keepScreenOn: boolean;
  cacheEnabled: boolean;
  autoNextChapter: boolean;
  readingMode: 'normal' | 'night' | 'sepia';
  fontSize: 'small' | 'medium' | 'large'; // For any text overlays
}

// Reader state
export interface PDFReaderState {
  currentPage: number;
  totalPages: number;
  currentChapter: PDFChapter | null;
  progress: number; // 0-100
  isLoading: boolean;
  error: string | null;
  scale: number;
}

// Bottom tab types
export type ReaderBottomTabType = 'chapters' | 'comments' | 'preference';

export interface ReaderBottomTabItem {
  key: ReaderBottomTabType;
  label: string;
  icon: string;
}

// Props for reusable components
export interface PDFReaderProps {
  pdfUrl: string;
  title?: string;
  chapterTitle?: string;
  onPageChange?: (page: number, totalPages: number) => void;
  onLoadComplete?: (totalPages: number) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  initialPage?: number;
  enablePaging?: boolean;
  horizontal?: boolean;
}

export interface ReaderHeaderProps {
  title: string;
  chapterTitle: string;
  progress: string;
  onBack: () => void;
}

export interface ReaderBottomTabProps {
  activeTab: ReaderBottomTabType | null;
  onTabChange: (tab: ReaderBottomTabType) => void;
}

export interface ChapterListProps {
  chapters: PDFChapter[];
  currentChapterId: string | number;
  onChapterSelect: (chapter: PDFChapter) => void;
  onClose: () => void;
}

export interface CommentListProps {
  comments: ReaderComment[];
  onLikeComment: (commentId: string | number) => void;
  onReplyComment: (commentId: string | number) => void;
  onAddComment: (text: string) => void;
  onClose: () => void;
}

export interface PreferencesPanelProps {
  preferences: ReaderPreferences;
  onPreferenceChange: (key: keyof ReaderPreferences, value: any) => void;
  onClose: () => void;
}

// Navigation params
export interface PDFReaderScreenParams {
  manga: MangaInfo;
  chapter: PDFChapter;
  chapters?: PDFChapter[];
}
