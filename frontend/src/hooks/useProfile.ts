/**
 * useProfile Hook
 * ===============
 * Custom hook for managing profile data with offline support
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getProfile,
  getShifts,
  acceptShift as acceptShiftAPI,
  declineShift as declineShiftAPI,
  getNewsFeed,
  markNewsAsRead as markNewsAsReadAPI,
  getUnreadNewsCount,
  ProfileData,
  ShiftAssignment,
  NewsItem,
} from '../services/profileService';
import { syncService } from '../services/syncService';
import { ProfileDB, BookingDB, NewsFeedDB } from '../utils/indexedDB';

export interface UseProfileOptions {
  profileUuid: string;
  enableOffline?: boolean;
}

export interface UseProfileReturn {
  // Data
  profile: ProfileData | null;
  shifts: ShiftAssignment[];
  news: NewsItem[];
  unreadCount: number;

  // Loading states
  isLoading: boolean;
  isLoadingShifts: boolean;
  isLoadingNews: boolean;

  // Error states
  error: Error | null;
  shiftError: Error | null;
  newsError: Error | null;

  // Online/offline
  isOnline: boolean;

  // Actions
  refreshProfile: () => Promise<void>;
  refreshShifts: () => Promise<void>;
  refreshNews: () => Promise<void>;
  acceptShift: (assignmentId: number) => Promise<void>;
  declineShift: (assignmentId: number, reason?: string, alternatives?: string) => Promise<void>;
  markNewsAsRead: (newsId: number) => Promise<void>;
}

/**
 * Hook for managing profile data
 */
export const useProfile = (options: UseProfileOptions): UseProfileReturn => {
  const { profileUuid, enableOffline = true } = options;

  // State
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [shifts, setShifts] = useState<ShiftAssignment[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  const [error, setError] = useState<Error | null>(null);
  const [shiftError, setShiftError] = useState<Error | null>(null);
  const [newsError, setNewsError] = useState<Error | null>(null);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('[useProfile] Back online, syncing data...');
      setIsOnline(true);
      if (enableOffline) {
        syncService.syncAll();
      }
    };

    const handleOffline = () => {
      console.log('[useProfile] Gone offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableOffline]);

  /**
   * Load profile from cache (offline-first)
   */
  const loadFromCache = useCallback(async () => {
    if (!enableOffline) return null;

    try {
      // Try to load from IndexedDB
      const cachedProfile = await ProfileDB.get(profileUuid);
      if (cachedProfile) {
        console.log('[useProfile] Loaded profile from cache');
        return cachedProfile;
      }
    } catch (err) {
      console.error('[useProfile] Error loading from cache:', err);
    }
    return null;
  }, [profileUuid, enableOffline]);

  /**
   * Refresh profile data
   */
  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // If offline, try to load from cache
      if (!isOnline && enableOffline) {
        const cached = await loadFromCache();
        if (cached) {
          setProfile(cached as any); // Type assertion needed
          setIsLoading(false);
          return;
        }
        throw new Error('No cached profile data available offline');
      }

      // Fetch from API
      const data = await getProfile(profileUuid);
      setProfile(data);

      // Cache if offline support is enabled
      if (enableOffline) {
        await ProfileDB.save({
          userId: profileUuid,
          email: data.user.email,
          name: `${data.user.first_name} ${data.user.last_name}`,
          role: data.user.is_artist ? 'artist' : 'user',
          lastSync: new Date().toISOString(),
        });

        await BookingDB.save({
          userId: profileUuid,
          tickets: data.booking.ticket ? [data.booking.ticket] : [],
          food: data.booking.food ? [data.booking.food] : [],
          beverages: data.booking.beverage ? [data.booking.beverage] : [],
          workShifts: data.shifts,
          materials: data.materials,
          lastSync: new Date().toISOString(),
        });
      }

      console.log('[useProfile] Profile loaded successfully');
    } catch (err) {
      console.error('[useProfile] Error loading profile:', err);
      setError(err as Error);

      // Try cache as fallback
      if (enableOffline) {
        const cached = await loadFromCache();
        if (cached) {
          setProfile(cached as any);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [profileUuid, isOnline, enableOffline, loadFromCache]);

  /**
   * Refresh shifts
   */
  const refreshShifts = useCallback(async () => {
    setIsLoadingShifts(true);
    setShiftError(null);

    try {
      if (!isOnline && !profile) {
        throw new Error('Cannot load shifts while offline without cached profile');
      }

      const data = isOnline ? await getShifts(profileUuid) : (profile?.shifts || []);
      setShifts(data);
      console.log('[useProfile] Shifts loaded successfully');
    } catch (err) {
      console.error('[useProfile] Error loading shifts:', err);
      setShiftError(err as Error);
    } finally {
      setIsLoadingShifts(false);
    }
  }, [profileUuid, isOnline, profile]);

  /**
   * Refresh news feed
   */
  const refreshNews = useCallback(async () => {
    setIsLoadingNews(true);
    setNewsError(null);

    try {
      // If offline, try to load from cache
      if (!isOnline && enableOffline) {
        const cachedNews = await NewsFeedDB.getAll();
        if (cachedNews.length > 0) {
          // Map cached NewsFeedItem to NewsItem format
          const mappedNews: NewsItem[] = cachedNews
            .filter(item => item.id.startsWith(profileUuid))
            .map(item => ({
              id: parseInt(item.id.split('-')[1]) || 0,
              title: item.title,
              content: item.content,
              category: null,
              published_date: item.timestamp,
              is_read: item.read || false,
              read_date: item.read ? item.timestamp : null,
              author: null,
            }));

          if (mappedNews.length > 0) {
            setNews(mappedNews);
            setIsLoadingNews(false);
            return;
          }
        }
        throw new Error('No cached news available offline');
      }

      const [newsData, count] = await Promise.all([
        getNewsFeed(profileUuid),
        getUnreadNewsCount(profileUuid),
      ]);

      setNews(newsData);
      setUnreadCount(count);

      // Cache news - map NewsItem to NewsFeedItem format
      if (enableOffline) {
        await NewsFeedDB.saveItems(
          newsData.map(item => ({
            id: `${profileUuid}-${item.id}`,
            title: item.title,
            content: item.content,
            timestamp: item.published_date,
            read: item.is_read,
          }))
        );
      }

      console.log('[useProfile] News loaded successfully');
    } catch (err) {
      console.error('[useProfile] Error loading news:', err);
      setNewsError(err as Error);

      // Try cache as fallback
      if (enableOffline) {
        const cachedNews = await NewsFeedDB.getAll();
        // Map cached NewsFeedItem to NewsItem format
        const mappedNews: NewsItem[] = cachedNews
          .filter(item => item.id.startsWith(profileUuid))
          .map(item => ({
            id: parseInt(item.id.split('-')[1]) || 0,
            title: item.title,
            content: item.content,
            category: null,
            published_date: item.timestamp,
            is_read: item.read || false,
            read_date: item.read ? item.timestamp : null,
            author: null,
          }));

        if (mappedNews.length > 0) {
          setNews(mappedNews);
        }
      }
    } finally {
      setIsLoadingNews(false);
    }
  }, [profileUuid, isOnline, enableOffline]);

  /**
   * Accept a shift assignment
   */
  const acceptShift = useCallback(async (assignmentId: number) => {
    try {
      if (isOnline) {
        await acceptShiftAPI(profileUuid, assignmentId);
        await refreshShifts();
      } else if (enableOffline) {
        // Queue for offline sync
        await syncService.queueOperation('ACCEPT_SHIFT', {
          profileUuid,
          assignmentId,
        });

        // Optimistically update UI
        setShifts(prev =>
          prev.map(shift =>
            shift.assignment_id === assignmentId
              ? { ...shift, status: 'accepted' as const, response_date: new Date().toISOString() }
              : shift
          )
        );

        console.log('[useProfile] Shift acceptance queued for sync');
      } else {
        throw new Error('Cannot accept shift while offline');
      }
    } catch (err) {
      console.error('[useProfile] Error accepting shift:', err);
      throw err;
    }
  }, [profileUuid, isOnline, enableOffline, refreshShifts]);

  /**
   * Decline a shift assignment
   */
  const declineShift = useCallback(async (
    assignmentId: number,
    reason?: string,
    alternatives?: string
  ) => {
    try {
      if (isOnline) {
        await declineShiftAPI(profileUuid, assignmentId, reason, alternatives);
        await refreshShifts();
      } else if (enableOffline) {
        // Queue for offline sync
        await syncService.queueOperation('DECLINE_SHIFT', {
          profileUuid,
          assignmentId,
          rejectionReason: reason,
          alternativePreferences: alternatives,
        });

        // Optimistically update UI
        setShifts(prev =>
          prev.map(shift =>
            shift.assignment_id === assignmentId
              ? {
                  ...shift,
                  status: 'declined' as const,
                  response_date: new Date().toISOString(),
                  rejection_reason: reason || null,
                  alternative_preferences: alternatives || null,
                }
              : shift
          )
        );

        console.log('[useProfile] Shift decline queued for sync');
      } else {
        throw new Error('Cannot decline shift while offline');
      }
    } catch (err) {
      console.error('[useProfile] Error declining shift:', err);
      throw err;
    }
  }, [profileUuid, isOnline, enableOffline, refreshShifts]);

  /**
   * Mark news as read
   */
  const markNewsAsRead = useCallback(async (newsId: number) => {
    try {
      if (isOnline) {
        await markNewsAsReadAPI(profileUuid, newsId);
      } else if (enableOffline) {
        // Queue for offline sync
        await syncService.queueOperation('MARK_NEWS_READ', {
          profileUuid,
          newsId,
        });
      }

      // Optimistically update UI
      setNews(prev =>
        prev.map(item =>
          item.id === newsId
            ? { ...item, is_read: true, read_date: new Date().toISOString() }
            : item
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Update cache
      if (enableOffline) {
        await NewsFeedDB.markAsRead(`${profileUuid}-${newsId}`);
      }

      console.log('[useProfile] News marked as read');
    } catch (err) {
      console.error('[useProfile] Error marking news as read:', err);
      throw err;
    }
  }, [profileUuid, isOnline, enableOffline]);

  // Initial load
  useEffect(() => {
    if (profileUuid) {
      refreshProfile();
      refreshShifts();
      refreshNews();
    }
  }, [profileUuid]); // Only run on profileUuid change

  return {
    // Data
    profile,
    shifts,
    news,
    unreadCount,

    // Loading states
    isLoading,
    isLoadingShifts,
    isLoadingNews,

    // Error states
    error,
    shiftError,
    newsError,

    // Online/offline
    isOnline,

    // Actions
    refreshProfile,
    refreshShifts,
    refreshNews,
    acceptShift,
    declineShift,
    markNewsAsRead,
  };
};
