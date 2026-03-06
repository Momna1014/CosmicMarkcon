/**
 * Manga API Service
 *
 * Central export point for all Manga API services and types
 *
 * Usage:
 * import { CategoryService, MangaCategory } from '../services/mangaApi';
 *
 * // Fetch categories
 * const response = await CategoryService.getCategories();
 */

// Services
export {CategoryService, default as categoryService} from './categoryService';
export {MangaService, default as mangaService} from './mangaService';
export {CommentService, default as commentService} from './commentService';
export {DashboardService, default as dashboardService} from './dashboardService';

// API Instance
export {mangaApi, default as mangaAxiosInstance} from './mangaAxiosInstance';

// Types
export * from './types';
