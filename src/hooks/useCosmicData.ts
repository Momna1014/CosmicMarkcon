import {useState, useEffect, useRef, useCallback} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/rootReducer';
import {
  conversationService,
  CosmicHomeData,
} from '../services/ConversationService';

/**
 * Hook that fetches daily energy + transits from ChatGPT
 * when the user lands on Home screen.
 *
 * - Fires only once per day (caches by date string).
 * - Waits until GPT keys are loaded before calling.
 * - Never blocks UI — returns loading/data/error states.
 * - Exposes refresh() for pull-to-refresh.
 */
export function useCosmicData() {
  const [data, setData] = useState<CosmicHomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedDateRef = useRef<string | null>(null);

  const keysLoaded = useSelector((s: RootState) => s.keys.isLoaded);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const result = await conversationService.getCosmicHomeData();
      setData(result);
      fetchedDateRef.current = new Date().toISOString().slice(0, 10);
    } catch (err: any) {
      setError(err.message || 'Failed to load cosmic data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!keysLoaded) return;

    const todayKey = new Date().toISOString().slice(0, 10);
    if (fetchedDateRef.current === todayKey && data) return;

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysLoaded]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return {data, loading, refreshing, error, refresh};
}
