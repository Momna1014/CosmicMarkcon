import { Episode } from './components/ChaptersTab';
import { Review } from './components/ReviewsTab';
import { Chapter } from './components/ChaptersListModal';

export interface MangaDetail {
  id: string;
  title: string;
  image: any;
  genre: string;
  rating: number;
  chapters: number;
  views: string;
  status: string;
  language: string;
  synopsis: string;
}

const coverImage = require('../../assets/icons/svgicons/HomeSvgIcons/HomeScreen.png');

export const mangaDetailData: MangaDetail = {
  id: '1',
  title: "The Baker's Secret",
  image: coverImage,
  genre: 'Mystery',
  rating: 4.6,
  chapters: 12,
  views: '6k',
  status: 'Ongoing',
  language: 'English',
  synopsis: "In a world where superpowers are the norm, our protagonist discovers an extraordinary ability that sets them apart from everyone else. As they navigate through challenges and mysteries, they uncover secrets that could change everything they know about their world and themselves.",
};

// Chapters list for dropdown modal
export const chaptersListData: Chapter[] = [
  { id: 'c1', number: 1, title: 'Chapter 01' },
  { id: 'c2', number: 2, title: 'Chapter 02' },
  { id: 'c3', number: 3, title: 'Chapter 03' },
  { id: 'c4', number: 4, title: 'Chapter 04' },
  { id: 'c5', number: 5, title: 'Chapter 05' },
  { id: 'c6', number: 6, title: 'Chapter 06' },
  { id: 'c7', number: 7, title: 'Chapter 07' },
  { id: 'c8', number: 8, title: 'Chapter 08' },
  { id: 'c9', number: 9, title: 'Chapter 09' },
  { id: 'c10', number: 10, title: 'Chapter 10' },
  { id: 'c11', number: 11, title: 'Chapter 11' },
  { id: 'c12', number: 12, title: 'Chapter 12' },
];

export const episodesData: Episode[] = [
  { id: 'e1', episodeNumber: 'Episode 01', title: 'The Unveiling', pdfUrl: 'https://islamicapps.care20.com/public/assets/pdf/Episode%201%20The%20Unveiling.pdf' },
  { id: 'e2', episodeNumber: 'Episode 02', title: 'Moonlight Latte', pdfUrl: 'https://islamicapps.care20.com/public/assets/pdf/Episode%201%20The%20Unveiling.pdf' },
  { id: 'e3', episodeNumber: 'Episode 03', title: 'Shadows of Yesterday', pdfUrl: 'https://islamicapps.care20.com/public/assets/pdf/Episode%201%20The%20Unveiling.pdf' },
  { id: 'e4', episodeNumber: 'Episode 04', title: 'Sweet Deception', pdfUrl: 'https://islamicapps.care20.com/public/assets/pdf/Episode%201%20The%20Unveiling.pdf' },
  { id: 'e5', episodeNumber: 'Episode 05', title: 'The Last Ingredient', pdfUrl: 'https://islamicapps.care20.com/public/assets/pdf/Episode%201%20The%20Unveiling.pdf' },
  { id: 'e6', episodeNumber: 'Episode 06', title: 'Rising Dough', pdfUrl: 'https://islamicapps.care20.com/public/assets/pdf/Episode%201%20The%20Unveiling.pdf' },
  { id: 'e7', episodeNumber: 'Episode 07', title: 'Burnt Memories', pdfUrl: 'https://islamicapps.care20.com/public/assets/pdf/Episode%201%20The%20Unveiling.pdf' },
  { id: 'e8', episodeNumber: 'Episode 08', title: 'The Secret Recipe', pdfUrl: 'https://islamicapps.care20.com/public/assets/pdf/Episode%201%20The%20Unveiling.pdf' },
];

export const reviewsData: Review[] = [
  {
    id: 'r1',
    username: 'MangaFan123',
    timeAgo: '2h ago',
    text: "This is one of the best manga I've read! The story is so engaging.",
    likes: 24,
  },
  {
    id: 'r2',
    username: 'ReadingAddict',
    timeAgo: '5h ago',
    text: "Can't wait for the next chapter!",
    likes: 18,
  },
  {
    id: 'r3',
    username: 'ComicLover99',
    timeAgo: '1d ago',
    text: "The art style is amazing and the plot twists keep me on the edge of my seat.",
    likes: 45,
  },
  {
    id: 'r4',
    username: 'BookwormJane',
    timeAgo: '2d ago',
    text: "Highly recommend this to anyone who loves mystery manga!",
    likes: 32,
  },
];

export const aboutData = {
  views: '5,000',
  status: 'Ongoing',
  language: 'English',
};
