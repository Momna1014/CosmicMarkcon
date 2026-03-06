import {useDispatch} from 'react-redux';
import type {AppDispatch} from '../redux/store';

/**
 * Type-safe useDispatch hook
 * 
 * Usage:
 * const dispatch = useAppDispatch();
 * dispatch(loginUser({ email, password }));
 * 
 * Benefits:
 * - Full TypeScript support for async thunks
 * - Auto-completion for dispatched actions
 * - Compile-time type checking
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
