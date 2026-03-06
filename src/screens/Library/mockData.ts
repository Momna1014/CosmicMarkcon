import { ReadingItem } from './components/ReadingCard';
import { SavedItem } from './components/SavedCard';

const homeScreenImage = require('../../assets/icons/svgicons/HomeSvgIcons/HomeScreen.png');

// Reading tab data
export const readingData: ReadingItem[] = [
  { id: 'r1', title: "Hell's Paradise", image: homeScreenImage, rating: 4.6, progress: 56 },
  { id: 'r2', title: 'Dandadan', image: homeScreenImage, rating: 4.8, progress: 30 },
  { id: 'r3', title: 'Sakamoto Days', image: homeScreenImage, rating: 4.5, progress: 10 },
  { id: 'r4', title: 'Kaiju No. 8', image: homeScreenImage, rating: 4.7, progress: 90 },
  { id: 'r5', title: 'Blue Lock', image: homeScreenImage, rating: 4.9, progress: 75 },
  { id: 'r6', title: 'Chainsaw Man', image: homeScreenImage, rating: 4.8, progress: 45 },
  { id: 'r7', title: 'Jujutsu Kaisen', image: homeScreenImage, rating: 4.9, progress: 68 },
  { id: 'r8', title: 'One Piece', image: homeScreenImage, rating: 5.0, progress: 22 },
  { id: 'r9', title: 'Spy x Family', image: homeScreenImage, rating: 4.7, progress: 88 },
  { id: 'r10', title: 'Demon Slayer', image: homeScreenImage, rating: 4.8, progress: 33 },
];

// Saved tab data
export const savedData: SavedItem[] = [
  { id: 's1', title: 'Sakamoto Days', image: homeScreenImage, rating: 4.5 },
  { id: 's2', title: 'Kaiju No. 8', image: homeScreenImage, rating: 4.7 },
  { id: 's3', title: "Hell's Paradise", image: homeScreenImage, rating: 4.6 },
  { id: 's4', title: 'Dandadan', image: homeScreenImage, rating: 4.8 },
  { id: 's5', title: 'Blue Lock', image: homeScreenImage, rating: 4.9 },
  { id: 's6', title: 'Chainsaw Man', image: homeScreenImage, rating: 4.8 },
  { id: 's7', title: 'Jujutsu Kaisen', image: homeScreenImage, rating: 4.9 },
  { id: 's8', title: 'One Piece', image: homeScreenImage, rating: 5.0 },
];

// Download tab data
export const downloadData: SavedItem[] = [
  { id: 'd1', title: 'Sakamoto Days', image: homeScreenImage, rating: 4.5 },
  { id: 'd2', title: 'Kaiju No. 8', image: homeScreenImage, rating: 4.7 },
  { id: 'd3', title: "Hell's Paradise", image: homeScreenImage, rating: 4.6 },
  { id: 'd4', title: 'Dandadan', image: homeScreenImage, rating: 4.8 },
  { id: 'd5', title: 'Blue Lock', image: homeScreenImage, rating: 4.9 },
  { id: 'd6', title: 'Chainsaw Man', image: homeScreenImage, rating: 4.8 },
];
