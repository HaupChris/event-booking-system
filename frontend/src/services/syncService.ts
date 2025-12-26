/**
 * Sync Service for Online/Offline Data Synchronization
 * Handles syncing data between server and IndexedDB
 */

import type {
  ProfileData,
  BookingData,
  NewsFeedItem,
  SyncOperation} from '../utils/indexedDB';
import {
  ProfileDB,
  BookingDB,
  NewsFeedDB,
  SyncQueueDB,
  MetadataDB
} from '../utils/indexedDB';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';
const MAX_RETRIES = 3;

export class SyncService {
  private static instance: SyncService;
  private isSyncing = false;
  private syncInProgress = false;

  private constructor() {
    this.setupEventListeners();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private setupEventListeners() {
    // Listen for online event to trigger sync
    window.addEventListener('online', () => {
      console.log('[SyncService] Connection restored, starting sync...');
      this.syncAll();
    });

    // Listen for visibility change to sync when app comes to foreground
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && navigator.onLine) {
        console.log('[SyncService] App visible and online, checking for updates...');
        this.syncAll();
      }
    });
  }

  /**
   * Sync all data from server to IndexedDB
   */
  async syncAll(token?: string): Promise<void> {
    if (this.syncInProgress) {
      console.log('[SyncService] Sync already in progress, skipping...');
      return;
    }

    if (!navigator.onLine) {
      console.log('[SyncService] Offline, skipping sync');
      return;
    }

    this.syncInProgress = true;

    try {
      console.log('[SyncService] Starting full sync...');

      // Process pending operations first
      await this.processSyncQueue(token);

      // Update last sync time
      await MetadataDB.setLastSyncTime(new Date().toISOString());

      // Dispatch sync event
      window.dispatchEvent(
        new CustomEvent('datasynced', {
          detail: { timestamp: new Date().toISOString() },
        })
      );

      console.log('[SyncService] Sync completed successfully');
    } catch (error) {
      console.error('[SyncService] Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Fetch and cache profile data
   */
  async syncProfile(userId: string, token: string): Promise<ProfileData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const profileData: ProfileData = await response.json();
      await ProfileDB.save(profileData);
      console.log('[SyncService] Profile synced successfully');

      return profileData;
    } catch (error) {
      console.error('[SyncService] Failed to sync profile:', error);

      // Return cached data if available
      return await ProfileDB.get(userId);
    }
  }

  /**
   * Fetch and cache booking data
   */
  async syncBooking(userId: string, token: string): Promise<BookingData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch booking: ${response.statusText}`);
      }

      const bookingData: BookingData = await response.json();
      await BookingDB.save(bookingData);
      console.log('[SyncService] Booking synced successfully');

      return bookingData;
    } catch (error) {
      console.error('[SyncService] Failed to sync booking:', error);

      // Return cached data if available
      return await BookingDB.get(userId);
    }
  }

  /**
   * Fetch and cache news feed
   */
  async syncNewsFeed(token: string): Promise<NewsFeedItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/news`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch news feed: ${response.statusText}`);
      }

      const newsItems: NewsFeedItem[] = await response.json();
      await NewsFeedDB.saveItems(newsItems);
      console.log('[SyncService] News feed synced successfully');

      return newsItems;
    } catch (error) {
      console.error('[SyncService] Failed to sync news feed:', error);

      // Return cached data if available
      return await NewsFeedDB.getAll();
    }
  }

  /**
   * Get profile data (from cache if offline, from server if online)
   */
  async getProfile(userId: string, token: string): Promise<ProfileData | null> {
    if (navigator.onLine) {
      return await this.syncProfile(userId, token);
    } else {
      console.log('[SyncService] Offline, returning cached profile');
      return await ProfileDB.get(userId);
    }
  }

  /**
   * Get booking data (from cache if offline, from server if online)
   */
  async getBooking(userId: string, token: string): Promise<BookingData | null> {
    if (navigator.onLine) {
      return await this.syncBooking(userId, token);
    } else {
      console.log('[SyncService] Offline, returning cached booking');
      return await BookingDB.get(userId);
    }
  }

  /**
   * Get news feed (from cache if offline, from server if online)
   */
  async getNewsFeed(token: string): Promise<NewsFeedItem[]> {
    if (navigator.onLine) {
      return await this.syncNewsFeed(token);
    } else {
      console.log('[SyncService] Offline, returning cached news feed');
      return await NewsFeedDB.getAll();
    }
  }

  /**
   * Queue an operation for later sync (when offline)
   */
  async queueOperation(
    type: SyncOperation['type'],
    payload: any
  ): Promise<string> {
    const operationId = await SyncQueueDB.add({ type, payload });
    console.log(`[SyncService] Operation queued: ${type}`);

    // If online, try to sync immediately
    if (navigator.onLine) {
      this.processSyncQueue();
    }

    return operationId;
  }

  /**
   * Process all pending operations in the sync queue
   */
  async processSyncQueue(token?: string): Promise<void> {
    const pendingOps = await SyncQueueDB.getPending();

    if (pendingOps.length === 0) {
      console.log('[SyncService] No pending operations to sync');
      return;
    }

    console.log(`[SyncService] Processing ${pendingOps.length} pending operations...`);

    for (const operation of pendingOps) {
      try {
        await SyncQueueDB.updateStatus(operation.id, 'processing');
        await this.executeOperation(operation, token);
        await SyncQueueDB.remove(operation.id);
        console.log(`[SyncService] Operation ${operation.id} completed successfully`);
      } catch (error) {
        console.error(`[SyncService] Operation ${operation.id} failed:`, error);

        // Update retry count
        const newRetries = operation.retries + 1;

        if (newRetries >= MAX_RETRIES) {
          console.error(`[SyncService] Operation ${operation.id} failed after ${MAX_RETRIES} retries`);
          await SyncQueueDB.updateStatus(operation.id, 'failed', newRetries);

          // Dispatch event for failed operation
          window.dispatchEvent(
            new CustomEvent('syncoperationfailed', {
              detail: { operation, error },
            })
          );
        } else {
          await SyncQueueDB.updateStatus(operation.id, 'pending', newRetries);
        }
      }
    }
  }

  /**
   * Execute a single sync operation
   */
  private async executeOperation(operation: SyncOperation, token?: string): Promise<void> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let url = '';
    let method = 'POST';
    let body: any = null;

    switch (operation.type) {
      case 'ACCEPT_SHIFT':
        url = `${API_BASE_URL}/api/shifts/${operation.payload.shiftId}/accept`;
        body = JSON.stringify({ userId: operation.payload.userId });
        break;

      case 'DECLINE_SHIFT':
        url = `${API_BASE_URL}/api/shifts/${operation.payload.shiftId}/decline`;
        body = JSON.stringify({
          userId: operation.payload.userId,
          reason: operation.payload.reason,
        });
        break;

      case 'UPDATE_PROFILE':
        url = `${API_BASE_URL}/api/profile/${operation.payload.userId}`;
        method = 'PUT';
        body = JSON.stringify(operation.payload.data);
        break;

      case 'UPDATE_BOOKING':
        url = `${API_BASE_URL}/api/bookings/${operation.payload.userId}`;
        method = 'PUT';
        body = JSON.stringify(operation.payload.data);
        break;

      case 'MARK_NEWS_READ':
        url = `${API_BASE_URL}/api/news/${operation.payload.newsId}/read`;
        body = JSON.stringify({ userId: operation.payload.userId });
        break;

      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    // Update local cache with the response
    const result = await response.json();
    return result;
  }

  /**
   * Check if there are pending operations
   */
  async hasPendingOperations(): Promise<boolean> {
    const pending = await SyncQueueDB.getPending();
    return pending.length > 0;
  }

  /**
   * Get count of pending operations
   */
  async getPendingCount(): Promise<number> {
    const pending = await SyncQueueDB.getPending();
    return pending.length;
  }

  /**
   * Clear all sync data (for logout)
   */
  async clearAllData(): Promise<void> {
    await ProfileDB.delete('current');
    await BookingDB.delete('current');
    await NewsFeedDB.clear();
    await SyncQueueDB.clear();
    console.log('[SyncService] All sync data cleared');
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance();
