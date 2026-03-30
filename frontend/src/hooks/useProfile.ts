import { useCallback, useEffect, useState } from 'react';
import type {
  NewsItem,
  ProfileData,
  ShiftAssignment,
  ShiftMessage,
} from '../services/profileService';
import {
  acceptShift as acceptShiftAPI,
  declineShift as declineShiftAPI,
  getNewsFeed,
  getProfile,
  getShiftMessages as getShiftMessagesAPI,
  getShifts,
  getUnreadNewsCount,
  markNewsAsRead as markNewsAsReadAPI,
} from '../services/profileService';
import { syncService } from '../services/syncService';
import { NewsFeedDB, ProfileDB } from '../utils/indexedDB';
import {
  extractProfileDataFromCache,
  mapCachedNews,
  persistProfileCache,
} from './useProfile.helpers';

export interface UseProfileOptions {
  profileUuid: string;
  enableOffline?: boolean;
}

export interface UseProfileReturn {
  profile: ProfileData | null;
  shifts: ShiftAssignment[];
  shiftMessages: ShiftMessage[];
  news: NewsItem[];
  unreadCount: number;
  isLoading: boolean;
  isLoadingShifts: boolean;
  isLoadingNews: boolean;
  error: Error | null;
  shiftError: Error | null;
  newsError: Error | null;
  isOnline: boolean;
  refreshProfile: () => Promise<void>;
  refreshShifts: () => Promise<void>;
  refreshNews: () => Promise<void>;
  acceptShift: (assignmentId: number) => Promise<void>;
  declineShift: (assignmentId: number, reason?: string, alternatives?: string) => Promise<void>;
  markNewsAsRead: (newsId: number) => Promise<void>;
}

export const useProfile = (options: UseProfileOptions): UseProfileReturn => {
  const { profileUuid, enableOffline = true } = options;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [shifts, setShifts] = useState<ShiftAssignment[]>([]);
  const [shiftMessages, setShiftMessages] = useState<ShiftMessage[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [shiftError, setShiftError] = useState<Error | null>(null);
  const [newsError, setNewsError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (enableOffline) {
        syncService.syncAll();
      }
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableOffline]);

  const loadFromCache = useCallback(async (): Promise<ProfileData | null> => {
    if (!enableOffline) {
      return null;
    }
    try {
      const cachedProfile = await ProfileDB.get(profileUuid);
      return extractProfileDataFromCache(cachedProfile);
    } catch {
      return null;
    }
  }, [enableOffline, profileUuid]);

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isOnline && enableOffline) {
        const cached = await loadFromCache();
        if (!cached) {
          throw new Error('No cached profile data available offline');
        }
        setProfile(cached);
        return;
      }

      const data = await getProfile(profileUuid);
      setProfile(data);
      if (!enableOffline) {
        return;
      }
      await persistProfileCache(profileUuid, data);
    } catch (err) {
      setError(err as Error);
      if (enableOffline) {
        const cached = await loadFromCache();
        if (cached) {
          setProfile(cached);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [enableOffline, isOnline, loadFromCache, profileUuid]);

  const refreshShifts = useCallback(async () => {
    setIsLoadingShifts(true);
    setShiftError(null);
    try {
      if (!isOnline && !profile) {
        throw new Error('Cannot load shifts while offline without cached profile');
      }
      if (isOnline) {
        const [shiftData, messageData] = await Promise.all([
          getShifts(profileUuid),
          getShiftMessagesAPI(profileUuid),
        ]);
        setShifts(shiftData);
        setShiftMessages(messageData);
      } else {
        setShifts(profile?.shifts || []);
        setShiftMessages([]);
      }
    } catch (err) {
      setShiftError(err as Error);
    } finally {
      setIsLoadingShifts(false);
    }
  }, [isOnline, profile, profileUuid]);

  const refreshNews = useCallback(async () => {
    setIsLoadingNews(true);
    setNewsError(null);
    try {
      if (!isOnline && enableOffline) {
        const mappedNews = mapCachedNews(await NewsFeedDB.getAll(), profileUuid);
        if (mappedNews.length === 0) {
          throw new Error('No cached news available offline');
        }
        setNews(mappedNews);
        return;
      }

      const [newsData, count] = await Promise.all([
        getNewsFeed(profileUuid),
        getUnreadNewsCount(profileUuid),
      ]);
      setNews(newsData);
      setUnreadCount(count);
      if (enableOffline) {
        await NewsFeedDB.saveItems(
          newsData.map((item) => ({
            id: `${profileUuid}-${item.id}`,
            title: item.title,
            content: item.content,
            timestamp: item.published_date,
            read: item.is_read,
          }))
        );
      }
    } catch (err) {
      setNewsError(err as Error);
      if (enableOffline) {
        const mappedNews = mapCachedNews(await NewsFeedDB.getAll(), profileUuid);
        if (mappedNews.length > 0) {
          setNews(mappedNews);
        }
      }
    } finally {
      setIsLoadingNews(false);
    }
  }, [enableOffline, isOnline, profileUuid]);

  const acceptShift = useCallback(
    async (assignmentId: number) => {
      if (isOnline) {
        await acceptShiftAPI(profileUuid, assignmentId);
        await refreshShifts();
        return;
      }
      if (!enableOffline) {
        throw new Error('Cannot accept shift while offline');
      }
      await syncService.queueOperation('ACCEPT_SHIFT', { profileUuid, assignmentId });
      setShifts((prev) =>
        prev.map((shift) =>
          shift.assignment_id === assignmentId
            ? { ...shift, status: 'accepted' as const, response_date: new Date().toISOString() }
            : shift
        )
      );
    },
    [enableOffline, isOnline, profileUuid, refreshShifts]
  );

  const declineShift = useCallback(
    async (assignmentId: number, reason?: string, alternatives?: string) => {
      if (isOnline) {
        await declineShiftAPI(profileUuid, assignmentId, reason, alternatives);
        await refreshShifts();
        return;
      }
      if (!enableOffline) {
        throw new Error('Cannot decline shift while offline');
      }
      await syncService.queueOperation('DECLINE_SHIFT', {
        profileUuid,
        assignmentId,
        rejectionReason: reason,
        alternativePreferences: alternatives,
      });
      setShifts((prev) =>
        prev.map((shift) =>
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
    },
    [enableOffline, isOnline, profileUuid, refreshShifts]
  );

  const markNewsAsRead = useCallback(
    async (newsId: number) => {
      if (isOnline) {
        await markNewsAsReadAPI(profileUuid, newsId);
      } else if (enableOffline) {
        await syncService.queueOperation('MARK_NEWS_READ', { profileUuid, newsId });
      }
      setNews((prev) =>
        prev.map((item) =>
          item.id === newsId
            ? { ...item, is_read: true, read_date: new Date().toISOString() }
            : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (enableOffline) {
        await NewsFeedDB.markAsRead(`${profileUuid}-${newsId}`);
      }
    },
    [enableOffline, isOnline, profileUuid]
  );

  useEffect(() => {
    if (!profileUuid) {
      return;
    }
    refreshProfile().then();
    refreshShifts().then();
    refreshNews().then();
    // Initial load should only run when UUID changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileUuid]);

  return {
    profile,
    shifts,
    shiftMessages,
    news,
    unreadCount,
    isLoading,
    isLoadingShifts,
    isLoadingNews,
    error,
    shiftError,
    newsError,
    isOnline,
    refreshProfile,
    refreshShifts,
    refreshNews,
    acceptShift,
    declineShift,
    markNewsAsRead,
  };
};
