/**
 * Mock Data for PDF Reader
 * 
 * Sample manga data with PDF URLs for testing
 * Replace these URLs with your actual PDF URLs
 */

import { MangaInfo, PDFChapter, ReaderComment } from '../../components/ComicReader';

// Sample PDF URLs (using public domain comics/PDFs for testing)
// Replace these with your actual PDF URLs
const SAMPLE_PDF_URLS = {
  chapter1: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf',
  chapter2: 'https://www.africau.edu/images/default/sample.pdf',
  chapter3: 'https://www.clickdimensions.com/links/TestPDFfile.pdf',
};

// Sample Chapters
export const sampleChapters: PDFChapter[] = [
  {
    id: '1',
    number: 1,
    title: 'The Inheritance',
    pdfUrl: SAMPLE_PDF_URLS.chapter1,
    totalPages: 35,
    isDownloaded: false,
    isLocked: false,
    thumbnail: 'https://picsum.photos/seed/ch1/200/280',
  },
  {
    id: '2',
    number: 2,
    title: 'The Secret Recipe',
    pdfUrl: SAMPLE_PDF_URLS.chapter2,
    totalPages: 42,
    isDownloaded: true,
    isLocked: false,
    thumbnail: 'https://picsum.photos/seed/ch2/200/280',
  },
  {
    id: '3',
    number: 3,
    title: 'New Beginnings',
    pdfUrl: SAMPLE_PDF_URLS.chapter3,
    totalPages: 38,
    isDownloaded: false,
    isLocked: false,
    thumbnail: 'https://picsum.photos/seed/ch3/200/280',
  },
  {
    id: '4',
    number: 4,
    title: 'The Rival',
    pdfUrl: SAMPLE_PDF_URLS.chapter1,
    totalPages: 45,
    isDownloaded: false,
    isLocked: true,
    thumbnail: 'https://picsum.photos/seed/ch4/200/280',
  },
  {
    id: '5',
    number: 5,
    title: 'Rising to the Challenge',
    pdfUrl: SAMPLE_PDF_URLS.chapter2,
    totalPages: 40,
    isDownloaded: false,
    isLocked: true,
    thumbnail: 'https://picsum.photos/seed/ch5/200/280',
  },
];

// Sample Manga Info
export const sampleManga: MangaInfo = {
  id: 'manga_001',
  title: "The Baker's Secret",
  coverImage: 'https://picsum.photos/seed/manga1/400/600',
  author: 'John Smith',
  genre: ['Romance', 'Drama', 'Slice of Life'],
  description: 'A heartwarming story about a young baker who inherits her grandmother\'s bakery and discovers family secrets along the way.',
  totalChapters: 5,
  chapters: sampleChapters,
};

// Sample Comments
export const sampleComments: ReaderComment[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'MangaFan123',
    userAvatar: 'https://i.pravatar.cc/100?img=1',
    text: 'This chapter is amazing! The artwork is incredible and the story keeps getting better.',
    likes: 24,
    timestamp: new Date(Date.now() - 3600000),
    isLiked: false,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'ComicLover',
    userAvatar: 'https://i.pravatar.cc/100?img=2',
    text: "I love this story so much! Can't wait for the next chapter to be released.",
    likes: 18,
    timestamp: new Date(Date.now() - 7200000),
    isLiked: true,
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'ReaderPro',
    userAvatar: 'https://i.pravatar.cc/100?img=3',
    text: 'The plot twist at the end was so unexpected! This author is a genius.',
    likes: 42,
    timestamp: new Date(Date.now() - 86400000),
    isLiked: false,
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'ArtAppreciator',
    userAvatar: 'https://i.pravatar.cc/100?img=4',
    text: 'The art style is beautiful. Every panel is like a masterpiece.',
    likes: 15,
    timestamp: new Date(Date.now() - 172800000),
    isLiked: false,
  },
];

// Helper function to create manga with custom PDF URL
export const createMangaWithPDF = (pdfUrl: string, title?: string): MangaInfo => ({
  ...sampleManga,
  title: title || sampleManga.title,
  chapters: sampleManga.chapters.map((chapter) => ({
    ...chapter,
    pdfUrl: pdfUrl,
  })),
});

// Helper function to create single chapter with PDF URL
export const createChapter = (
  id: string,
  number: number,
  title: string,
  pdfUrl: string
): PDFChapter => ({
  id,
  number,
  title,
  pdfUrl,
  totalPages: 0, // Will be determined when PDF loads
  isDownloaded: false,
  isLocked: false,
});
