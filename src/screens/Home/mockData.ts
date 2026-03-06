// Mock data for Home Screen

export interface MangaItem {
  id: string;
  title: string;
  image: any;
  rating?: number;
  description?: string;
}

export interface HomeSection {
  id: string;
  title: string;
  subtitle?: string;
  showFireIcon?: boolean;
  showNumbering?: boolean;
  showRating?: boolean;
  variant?: 'trending' | 'recommended';
  data: MangaItem[];
}

export interface GenreItem {
  id: string;
  name: string;
}

export interface FeaturedItem {
  id: string;
  title: string;
  image: any;
  rating: number;
  genres: string[];
}

// Import the static image
const homeScreenImage = require('../../assets/icons/svgicons/HomeSvgIcons/HomeScreen.png');

// Trending Now data (shows numbering, no title/rating below)
export const trendingNowData: MangaItem[] = [
  { id: 't1', title: 'Shadow Man', image: homeScreenImage },
  { id: 't2', title: 'Alvaci', image: homeScreenImage },
  { id: 't3', title: 'Cry Hvao', image: homeScreenImage },
  { id: 't4', title: 'Dark Knight', image: homeScreenImage },
  { id: 't5', title: 'Storm Rider', image: homeScreenImage },
];

// Recommended For You data (shows title and rating)
export const recommendedData: MangaItem[] = [
  { id: 'r1', title: 'Chainsaw Man', image: homeScreenImage, rating: 4.7 },
  { id: 'r2', title: 'Attack on Titan', image: homeScreenImage, rating: 4.9 },
  { id: 'r3', title: 'My Hero Academia', image: homeScreenImage, rating: 4.8 },
  { id: 'r4', title: 'One Punch Man', image: homeScreenImage, rating: 4.6 },
  { id: 'r5', title: 'Demon Slayer', image: homeScreenImage, rating: 4.9 },
];

// Newly On App data (shows title and rating)
export const newlyOnAppData: MangaItem[] = [
  { id: 'n1', title: 'Jujutsu Kaisen', image: homeScreenImage, rating: 4.8 },
  { id: 'n2', title: 'Demon Slayer', image: homeScreenImage, rating: 4.8 },
  { id: 'n3', title: 'Tokyo Revengers', image: homeScreenImage, rating: 4.4 },
  { id: 'n4', title: 'Mob Psycho 100', image: homeScreenImage, rating: 4.7 },
  { id: 'n5', title: 'Spy x Family', image: homeScreenImage, rating: 4.9 },
];

// Completed Stories data (shows title and rating)
export const completedStoriesData: MangaItem[] = [
  { id: 'c1', title: 'One Piece', image: homeScreenImage, rating: 4.9 },
  { id: 'c2', title: 'Hunter x Hunter', image: homeScreenImage, rating: 4.7 },
  { id: 'c3', title: 'Dragon Ball Super', image: homeScreenImage, rating: 4.6 },
  { id: 'c4', title: 'Naruto', image: homeScreenImage, rating: 4.8 },
  { id: 'c5', title: 'Bleach', image: homeScreenImage, rating: 4.5 },
];

// Featured data
export const featuredData: FeaturedItem = {
  id: 'f1',
  title: 'The Director',
  image: homeScreenImage,
  rating: 4.8,
  genres: ['Action', 'Fantasy'],
};

// Genres data
export const genresData: GenreItem[] = [
  { id: 'g1', name: 'Romance' },
  { id: 'g2', name: 'Comedy' },
  { id: 'g3', name: 'Action' },
  { id: 'g4', name: 'Horror' },
];

// Sections before featured banner
export const sectionsBeforeFeatured: HomeSection[] = [
  {
    id: 'trending',
    title: 'Trending Now',
    subtitle: 'Top This Week',
    showFireIcon: true,
    showNumbering: true,
    showRating: false,
    variant: 'trending',
    data: trendingNowData,
  },
  {
    id: 'recommended',
    title: 'Recommended For You',
    showFireIcon: false,
    showNumbering: false,
    showRating: true,
    variant: 'recommended',
    data: recommendedData,
  },
  {
    id: 'newly',
    title: 'Newly On App',
    showFireIcon: false,
    showNumbering: false,
    showRating: true,
    variant: 'recommended',
    data: newlyOnAppData,
  },
];

// Sections after featured banner
export const sectionsAfterFeatured: HomeSection[] = [
  {
    id: 'completed',
    title: 'Competed Stories',
    showFireIcon: false,
    showNumbering: false,
    showRating: true,
    variant: 'recommended',
    data: completedStoriesData,
  },
];

// Rising Stars data
export interface RisingStarItem {
  id: string;
  title: string;
  genre: string;
  image: any;
  isBookmarked?: boolean;
}

export const risingStarsData: RisingStarItem[] = [
  { id: 'rs1', title: 'Chapter ONE', genre: 'Action', image: homeScreenImage },
  { id: 'rs2', title: 'Black Science', genre: 'Mystery', image: homeScreenImage },
  { id: 'rs3', title: 'Yucatan 1512', genre: 'Drama', image: homeScreenImage },
  { id: 'rs4', title: 'ARA The Mountain', genre: 'Adventure', image: homeScreenImage },
];

// All sections combined (for backward compatibility)
export const homeSections: HomeSection[] = [
  ...sectionsBeforeFeatured,
  ...sectionsAfterFeatured,
];
