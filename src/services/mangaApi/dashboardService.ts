/**
 * Dashboard Service
 *
 * Handles dashboard data API calls for the Home screen
 */

import {MANGA_API_ENDPOINTS} from '../../api/apiEndpoints';
import {mangaApi} from './mangaAxiosInstance';
import {
  DashboardResponse,
  GetDashboardParams,
} from './types';

/**
 * Dashboard Service
 * Provides methods for fetching dashboard data
 */
export const DashboardService = {
  /**
   * Fetch dashboard data for home screen
   * @param params - Contains user_id
   * @returns Promise<DashboardResponse> - Dashboard data with all sections
   */
  getDashboardData: async (
    params: GetDashboardParams,
  ): Promise<DashboardResponse> => {
    return mangaApi.post<DashboardResponse>(
      MANGA_API_ENDPOINTS.DASHBOARD.DATA,
      params,
    );
  },
};

export default DashboardService;
