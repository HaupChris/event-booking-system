/**
 * React Hook for Offline Data Management
 * Provides easy access to cached data and sync operations
 */

import { useState, useEffect, useCallback } from 'react';
import { syncService } from '../services/syncService';
import { ProfileData, BookingData, NewsFeedItem } from '../utils/indexedDB';

export interface UseOfflineDataOptions {
  userId?: string;
  token?: string;
  autoSync?: boolean;
}

export interface UseOfflineDataReturn {
  // Online/offline state
  isOnline: boolean;
  isSyncing: boolean;

  // Data
  profile: ProfileData | null;
  booking: BookingData | null;
  newsFeed: NewsFeedItem[];

  // Loading states
  isLoadingProfile: boolean;
  isLoadingBooking: boolean;
  isLoadingNews: boolean;

  // Errors
  profileError: Error | null;
  bookingError: Error | null;
  newsError: Error | null;

  // Actions
  refreshProfile: () => Promise<void>;
  refreshBooking: () => Promise<void>;
  refreshNews: () => Promise<void>;
  queueOperation: (type: any, payload: any) => Promise<string>;
  syncNow: () => Promise<void>;

  // Sync queue
  pendingOperations: number;
}

/**
 * Hook for managing offline data
 */
export function useOfflineData(options: UseOfflineDataOptions = {}): UseOfflineDataReturn {
  const { userId, token, autoSync = true } = options;

  // State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState(0);

  // Profile state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<Error | null>(null);

  // Booking state
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<Error | null>(null);

  // News feed state
  const [newsFeed, setNewsFeed] = useState<NewsFeedItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState<Error | null>(null);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (autoSync) {
        syncNow();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleDataSynced = () => {
      updatePendingCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('datasynced', handleDataSynced);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('datasynced', handleDataSynced);
    };
  }, [autoSync]);

  // Update pending operations count
  const updatePendingCount = useCallback(async () => {
    const count = await syncService.getPendingCount();
    setPendingOperations(count);
  }, []);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (!userId || !token) return;

    setIsLoadingProfile(true);
    setProfileError(null);

    try {
      const data = await syncService.getProfile(userId, token);
      setProfile(data);
    } catch (error) {
      setProfileError(error as Error);
      console.error('[useOfflineData] Failed to refresh profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [userId, token]);

  // Refresh booking data
  const refreshBooking = useCallback(async () => {
    if (!userId || !token) return;

    setIsLoadingBooking(true);
    setBookingError(null);

    try {
      const data = await syncService.getBooking(userId, token);
      setBooking(data);
    } catch (error) {
      setBookingError(error as Error);
      console.error('[useOfflineData] Failed to refresh booking:', error);
    } finally {
      setIsLoadingBooking(false);
    }
  }, [userId, token]);

  // Refresh news feed
  const refreshNews = useCallback(async () => {
    if (!token) return;

    setIsLoadingNews(true);
    setNewsError(null);

    try {
      const data = await syncService.getNewsFeed(token);
      setNewsFeed(data);
    } catch (error) {
      setNewsError(error as Error);
      console.error('[useOfflineData] Failed to refresh news:', error);
    } finally {
      setIsLoadingNews(false);
    }
  }, [token]);

  // Queue an operation
  const queueOperation = useCallback(async (type: any, payload: any): Promise<string> => {
    const operationId = await syncService.queueOperation(type, payload);
    await updatePendingCount();
    return operationId;
  }, [updatePendingCount]);

  // Sync all data now
  const syncNow = useCallback(async () => {
    if (!token) return;

    setIsSyncing(true);

    try {
      await syncService.syncAll(token);
      await Promise.all([
        refreshProfile(),
        refreshBooking(),
        refreshNews(),
      ]);
      await updatePendingCount();
    } catch (error) {
      console.error('[useOfflineData] Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [token, refreshProfile, refreshBooking, refreshNews, updatePendingCount]);

  // Initial load
  useEffect(() => {
    if (userId && token && autoSync) {
      refreshProfile();
      refreshBooking();
      refreshNews();
      updatePendingCount();
    }
  }, [userId, token, autoSync, refreshProfile, refreshBooking, refreshNews, updatePendingCount]);

  return {
    // State
    isOnline,
    isSyncing,

    // Data
    profile,
    booking,
    newsFeed,

    // Loading
    isLoadingProfile,
    isLoadingBooking,
    isLoadingNews,

    // Errors
    profileError,
    bookingError,
    newsError,

    // Actions
    refreshProfile,
    refreshBooking,
    refreshNews,
    queueOperation,
    syncNow,

    // Queue
    pendingOperations,
  };
}

/**
 * Hook for just tracking online/offline state
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
