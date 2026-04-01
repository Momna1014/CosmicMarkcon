import {useState, useEffect, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../redux/rootReducer';
import {setHoroscopeBundle} from '../redux/slices/horoscopeSlice';
import {
  conversationService,
  HoroscopeData,
} from '../services/ConversationService';
import {
  TODAY_HOROSCOPE,
  TOMORROW_HOROSCOPE,
  WEEKLY_HOROSCOPE,
} from '../components/mock/mockData';

const MAX_RETRIES = 2;

/**
 * Check if cached bundle has today's date key.
 */
function isBundleFresh(days: Record<string, HoroscopeData>): boolean {
  const todayKey = new Date().toISOString().slice(0, 10);
  return !!days[todayKey];
}

/**
 * Hook that provides horoscope data for today, tomorrow, and weekly.
 *
 * - Fetches today + tomorrow + weekly in one call
 * - Caches in Redux (persisted)
 * - Re-fetches only when today's key is missing from cache
 * - Retries up to 2 times on failure
 * - Returns mock data as fallback while loading or on error
 */
export function useHoroscopeData() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const bundle = useSelector((s: RootState) => s.horoscope.bundle);
  const keysLoaded = useSelector((s: RootState) => s.keys.isLoaded);

  const todayKey = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = tomorrow.toISOString().slice(0, 10);

  const needsFetch = useCallback(() => {
    if (!bundle) return true;
    return !isBundleFresh(bundle.days);
  }, [bundle]);

  useEffect(() => {
    if (!keysLoaded) return;
    if (!needsFetch()) return;

    let cancelled = false;

    const fetchBundle = async () => {
      setLoading(true);
      let lastError: any;

      for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
        try {
          const result = await conversationService.getWeeklyHoroscopeBundle();
          if (!cancelled) {
            dispatch(setHoroscopeBundle(result));
          }
          return; // success — exit
        } catch (err: any) {
          lastError = err;
          console.warn(
            `⚠️ [useHoroscopeData] Attempt ${attempt}/${MAX_RETRIES + 1} failed:`,
            err.message,
          );
          if (attempt <= MAX_RETRIES && !cancelled) {
            // Wait before retry (2s, then 4s)
            await new Promise<void>(resolve => setTimeout(resolve, attempt * 2000));
          }
        }
      }

      console.warn('⚠️ [useHoroscopeData] All retries exhausted, using fallback');
      if (lastError) {
        console.error('Last error:', lastError.message);
      }
    };

    fetchBundle().finally(() => {
      if (!cancelled) {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysLoaded]);

  // Resolve data — cached or fallback to mock
  const todayData: HoroscopeData = bundle?.days?.[todayKey] || TODAY_HOROSCOPE;
  const tomorrowData: HoroscopeData = bundle?.days?.[tomorrowKey] || TOMORROW_HOROSCOPE;
  const weeklyData: HoroscopeData = bundle?.weekly || WEEKLY_HOROSCOPE;

  return {todayData, tomorrowData, weeklyData, loading};
}
