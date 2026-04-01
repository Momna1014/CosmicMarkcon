import {useState, useEffect, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../redux/rootReducer';
import {setCosmicData} from '../redux/slices/cosmicDataSlice';
import {
  conversationService,
} from '../services/ConversationService';

/**
 * Hook that fetches daily energy + transits from ChatGPT
 * when the user lands on Home screen.
 *
 * - Caches in Redux (persisted via redux-persist) — survives app restarts.
 * - Only hits the API once per day — checks fetchedDate against today.
 * - Waits until GPT keys are loaded before calling.
 * - Never blocks UI — returns loading/data/error states.
 * - Exposes refresh() for pull-to-refresh (always fetches fresh).
 */
export function useCosmicData() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cached = useSelector((s: RootState) => s.cosmicData);
  const keysLoaded = useSelector((s: RootState) => s.keys.isLoaded);

  const todayKey = new Date().toISOString().slice(0, 10);
  const needsFetch = !cached.data || cached.fetchedDate !== todayKey;

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const result = await conversationService.getCosmicHomeData();
      dispatch(setCosmicData(result));
    } catch (err: any) {
      setError(err.message || 'Failed to load cosmic data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!keysLoaded) return;
    if (!needsFetch) return;

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysLoaded]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {data: cached.data, loading: loading && needsFetch, refreshing, error, refresh};
}
