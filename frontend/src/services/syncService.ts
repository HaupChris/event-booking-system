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
import { API_URL } from '../config/env';

const API_BASE_URL = API_URL;
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
      this.syncAll();
    });

    // Listen for visibility change to sync when app comes to foreground
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && navigator.onLine) {
        this.syncAll();
      }
    });
  }

  /**
   * Sync all data from server to IndexedDB
   */
  async syncAll(token?: string): Promise<void> {
    if (this.syncInProgress) {
      return;
    }

    if (!navigator.onLine) {
      return;
    }

    this.syncInProgress = true;

    try {
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

    } catch {
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

      return profileData;
    } catch {

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

      return bookingData;
    } catch {

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

      return newsItems;
    } catch {

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
      return await NewsFeedDB.getAll();
    }
  }

  /**
   * Queue an operation for later sync (when offline)
   */
  async queueOperation(
    type: SyncOperation['type'],
    payload: SyncOperation['payload']
  ): Promise<string> {
    const operationId = await SyncQueueDB.add({ type, payload });

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
      return;
    }

    for (const operation of pendingOps) {
      try {
        await SyncQueueDB.updateStatus(operation.id, 'processing');
        await this.executeOperation(operation, token);
        await SyncQueueDB.remove(operation.id);
      } catch (error) {

        // Update retry count
        const newRetries = operation.retries + 1;

        if (newRetries >= MAX_RETRIES) {
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
    let body: string | null = null;
    const payload = operation.payload;

    switch (operation.type) {
      case 'ACCEPT_SHIFT':
        url = `${API_BASE_URL}/api/shifts/${String(payload.shiftId)}/accept`;
        body = JSON.stringify({ userId: payload.userId });
        break;

      case 'DECLINE_SHIFT':
        url = `${API_BASE_URL}/api/shifts/${String(payload.shiftId)}/decline`;
        body = JSON.stringify({
          userId: payload.userId,
          reason: payload.reason,
        });
        break;

      case 'UPDATE_PROFILE':
        url = `${API_BASE_URL}/api/profile/${String(payload.userId)}`;
        method = 'PUT';
        body = JSON.stringify(payload.data);
        break;

      case 'UPDATE_BOOKING':
        url = `${API_BASE_URL}/api/bookings/${String(payload.userId)}`;
        method = 'PUT';
        body = JSON.stringify(payload.data);
        break;

      case 'MARK_NEWS_READ':
        url = `${API_BASE_URL}/api/news/${String(payload.newsId)}/read`;
        body = JSON.stringify({ userId: payload.userId });
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
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance();
