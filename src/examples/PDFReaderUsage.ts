/**
 * PDF Reader Usage Example
 * 
 * This file demonstrates how to use the PDF Reader component
 * to open manga/comic PDFs from URLs.
 * 
 * INSTALLATION:
 * First, install the required dependencies:
 * 
 * yarn add react-native-pdf react-native-blob-util @react-native-community/slider
 * 
 * For iOS:
 * cd ios && pod install
 * 
 * USAGE:
 * Import and use in your screen to navigate to PDF Reader
 */

import { MangaInfo, PDFChapter } from '../../components/ComicReader';

// ============================================
// EXAMPLE 1: Basic Usage with PDF URL
// ============================================

/**
 * Navigate to PDF Reader with a single chapter
 * Use this when opening a manga chapter from your category/home screen
 */
export const openPDFReader = (navigation: any, pdfUrl: string, title: string) => {
  // Create chapter data
  const chapter: PDFChapter = {
    id: '1',
    number: 1,
    title: 'Chapter 1',
    pdfUrl: pdfUrl, // Your PDF URL here
    isDownloaded: false,
    isLocked: false,
  };

  // Create manga info
  const manga: MangaInfo = {
    id: 'manga_1',
    title: title,
    coverImage: '',
    totalChapters: 1,
    chapters: [chapter],
  };

  // Navigate to PDF Reader
  navigation.navigate('PDFReader', {
    manga,
    chapter,
    chapters: [chapter],
  });
};

// ============================================
// EXAMPLE 2: Multiple Chapters
// ============================================

/**
 * Navigate to PDF Reader with multiple chapters
 * User can switch between chapters using the bottom Chapters tab
 */
export const openMangaWithChapters = (
  navigation: any,
  mangaTitle: string,
  chaptersList: Array<{ title: string; pdfUrl: string }>
) => {
  // Create chapters array
  const chapters: PDFChapter[] = chaptersList.map((ch, index) => ({
    id: String(index + 1),
    number: index + 1,
    title: ch.title,
    pdfUrl: ch.pdfUrl,
    isDownloaded: false,
    isLocked: false,
  }));

  // Create manga info
  const manga: MangaInfo = {
    id: 'manga_multi',
    title: mangaTitle,
    coverImage: '',
    totalChapters: chapters.length,
    chapters,
  };

  // Navigate to first chapter
  navigation.navigate('PDFReader', {
    manga,
    chapter: chapters[0],
    chapters,
  });
};

// ============================================
// EXAMPLE 3: Usage in a Category/List Screen
// ============================================

/**
 * Example: How to use in your MangaCard or Category item press handler
 */
export const ExampleCategoryItemPress = `
// In your Home screen or Category screen:

import { openPDFReader } from '../examples/PDFReaderUsage';

const handleMangaPress = (item) => {
  // item.pdfUrl contains your PDF link
  openPDFReader(navigation, item.pdfUrl, item.title);
};

// Or with TouchableOpacity:
<TouchableOpacity
  onPress={() => {
    navigation.navigate('PDFReader', {
      manga: {
        id: item.id,
        title: item.title,
        coverImage: item.coverImage,
        totalChapters: item.chapters.length,
        chapters: item.chapters,
      },
      chapter: item.chapters[0], // Start with first chapter
      chapters: item.chapters,
    });
  }}
>
  <MangaCard manga={item} />
</TouchableOpacity>
`;

// ============================================
// EXAMPLE 4: Sample Data Structure
// ============================================

/**
 * Example data structure for manga with PDF chapters
 * Use this format when fetching from your API
 */
export const sampleMangaData: MangaInfo = {
  id: 'manga_001',
  title: "The Baker's Secret",
  coverImage: 'https://example.com/cover.jpg',
  author: 'Author Name',
  genre: ['Romance', 'Drama'],
  description: 'A story about...',
  totalChapters: 3,
  chapters: [
    {
      id: 'ch1',
      number: 1,
      title: 'The Beginning',
      pdfUrl: 'https://your-server.com/manga/chapter1.pdf',
      totalPages: 35,
      isDownloaded: false,
      isLocked: false,
    },
    {
      id: 'ch2',
      number: 2,
      title: 'The Journey',
      pdfUrl: 'https://your-server.com/manga/chapter2.pdf',
      totalPages: 42,
      isDownloaded: false,
      isLocked: false,
    },
    {
      id: 'ch3',
      number: 3,
      title: 'The Discovery',
      pdfUrl: 'https://your-server.com/manga/chapter3.pdf',
      totalPages: 38,
      isDownloaded: false,
      isLocked: true, // Premium chapter
    },
  ],
};

// ============================================
// EXAMPLE 5: Integration with HomeDetailScreen
// ============================================

/**
 * Example: Opening PDF Reader from HomeDetail's "Read Chapter" button
 */
export const handleReadChapterExample = `
// In HomeDetailScreen, update handleReadChapter:

const handleReadChapter = useCallback(() => {
  // Get the selected chapter data
  const selectedChapterData = chaptersListData.find(
    ch => ch.number === selectedChapter
  );
  
  if (selectedChapterData) {
    navigation.navigate('PDFReader', {
      manga: {
        id: manga.id,
        title: manga.title,
        coverImage: manga.coverImage,
        totalChapters: chaptersListData.length,
        chapters: chaptersListData.map(ch => ({
          id: String(ch.id),
          number: ch.number,
          title: ch.title,
          pdfUrl: ch.pdfUrl, // Add pdfUrl to your chapter data
          isDownloaded: ch.isDownloaded,
          isLocked: ch.isLocked,
        })),
      },
      chapter: {
        id: String(selectedChapterData.id),
        number: selectedChapterData.number,
        title: selectedChapterData.title,
        pdfUrl: selectedChapterData.pdfUrl,
        isDownloaded: selectedChapterData.isDownloaded,
        isLocked: selectedChapterData.isLocked,
      },
    });
  }
}, [selectedChapter, manga, navigation]);
`;

export default {
  openPDFReader,
  openMangaWithChapters,
  sampleMangaData,
};
