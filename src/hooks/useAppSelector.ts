import {useSelector, TypedUseSelectorHook} from 'react-redux';
import type {RootState} from '../redux/store';

/**
 * Type-safe useSelector hook
 * 
 * Usage:
 * const user = useAppSelector(state => state.auth.user);
 * const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
 * 
 * Benefits:
 * - Full TypeScript support
 * - Auto-completion for state properties
 * - Compile-time type checking
 * - Prevents typos in state selectors
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
