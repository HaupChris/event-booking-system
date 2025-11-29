/**
 * IndexedDB Utility for Offline Data Storage
 * Handles local storage of profile data, bookings, and sync queue
 */

const DB_NAME = 'WiesenwahnDB';
const DB_VERSION = 1;

// Object store names
export const STORES = {
  PROFILES: 'profiles',
  BOOKINGS: 'bookings',
  NEWS_FEED: 'newsFeed',
  SYNC_QUEUE: 'syncQueue',
  METADATA: 'metadata',
} as const;

export interface ProfileData {
  userId: string;
  email?: string;
  name?: string;
  role?: string;
  lastSync: string;
}

export interface BookingData {
  userId: string;
  tickets: any[];
  food: any[];
  beverages: any[];
  workShifts: any[];
  materials: any[];
  lastSync: string;
}

export interface NewsFeedItem {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  read?: boolean;
}

export interface SyncOperation {
  id: string;
  type: 'ACCEPT_SHIFT' | 'DECLINE_SHIFT' | 'UPDATE_PROFILE' | 'UPDATE_BOOKING' | 'MARK_NEWS_READ';
  payload: any;
  timestamp: string;
  retries: number;
  status: 'pending' | 'processing' | 'failed';
}

// Initialize the database
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[IndexedDB] Error opening database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('[IndexedDB] Database opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('[IndexedDB] Upgrading database...');

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.PROFILES)) {
        const profileStore = db.createObjectStore(STORES.PROFILES, { keyPath: 'userId' });
        profileStore.createIndex('email', 'email', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.BOOKINGS)) {
        db.createObjectStore(STORES.BOOKINGS, { keyPath: 'userId' });
      }

      if (!db.objectStoreNames.contains(STORES.NEWS_FEED)) {
        const newsStore = db.createObjectStore(STORES.NEWS_FEED, { keyPath: 'id' });
        newsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        syncStore.createIndex('status', 'status', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
      }

      console.log('[IndexedDB] Database upgrade complete');
    };
  });
}

// Generic get operation
export async function getItem<T>(storeName: string, key: string): Promise<T | null> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error(`[IndexedDB] Error getting item from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error in getItem:', error);
    return null;
  }
}

// Generic put operation
export async function putItem<T>(storeName: string, item: T): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error(`[IndexedDB] Error putting item to ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error in putItem:', error);
    throw error;
  }
}

// Generic delete operation
export async function deleteItem(storeName: string, key: string): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error(`[IndexedDB] Error deleting item from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error in deleteItem:', error);
    throw error;
  }
}

// Get all items from a store
export async function getAllItems<T>(storeName: string): Promise<T[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error(`[IndexedDB] Error getting all items from ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error in getAllItems:', error);
    return [];
  }
}

// Clear all data from a store
export async function clearStore(storeName: string): Promise<void> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        console.log(`[IndexedDB] Cleared store: ${storeName}`);
        resolve();
      };

      request.onerror = () => {
        console.error(`[IndexedDB] Error clearing store ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error in clearStore:', error);
    throw error;
  }
}

// Profile-specific operations
export const ProfileDB = {
  async save(profile: ProfileData): Promise<void> {
    return putItem(STORES.PROFILES, { ...profile, lastSync: new Date().toISOString() });
  },

  async get(userId: string): Promise<ProfileData | null> {
    return getItem<ProfileData>(STORES.PROFILES, userId);
  },

  async delete(userId: string): Promise<void> {
    return deleteItem(STORES.PROFILES, userId);
  },
};

// Booking-specific operations
export const BookingDB = {
  async save(booking: BookingData): Promise<void> {
    return putItem(STORES.BOOKINGS, { ...booking, lastSync: new Date().toISOString() });
  },

  async get(userId: string): Promise<BookingData | null> {
    return getItem<BookingData>(STORES.BOOKINGS, userId);
  },

  async delete(userId: string): Promise<void> {
    return deleteItem(STORES.BOOKINGS, userId);
  },
};

// News feed operations
export const NewsFeedDB = {
  async saveItems(items: NewsFeedItem[]): Promise<void> {
    const db = await initDB();
    const transaction = db.transaction([STORES.NEWS_FEED], 'readwrite');
    const store = transaction.objectStore(STORES.NEWS_FEED);

    for (const item of items) {
      store.put(item);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  async getAll(): Promise<NewsFeedItem[]> {
    return getAllItems<NewsFeedItem>(STORES.NEWS_FEED);
  },

  async markAsRead(id: string): Promise<void> {
    const item = await getItem<NewsFeedItem>(STORES.NEWS_FEED, id);
    if (item) {
      item.read = true;
      await putItem(STORES.NEWS_FEED, item);
    }
  },

  async clear(): Promise<void> {
    return clearStore(STORES.NEWS_FEED);
  },
};

// Sync queue operations
export const SyncQueueDB = {
  async add(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retries' | 'status'>): Promise<string> {
    const id = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const syncOp: SyncOperation = {
      id,
      ...operation,
      timestamp: new Date().toISOString(),
      retries: 0,
      status: 'pending',
    };

    await putItem(STORES.SYNC_QUEUE, syncOp);
    console.log('[SyncQueue] Added operation:', syncOp);
    return id;
  },

  async getAll(): Promise<SyncOperation[]> {
    return getAllItems<SyncOperation>(STORES.SYNC_QUEUE);
  },

  async getPending(): Promise<SyncOperation[]> {
    const all = await this.getAll();
    return all.filter((op) => op.status === 'pending');
  },

  async updateStatus(id: string, status: SyncOperation['status'], retries?: number): Promise<void> {
    const operation = await getItem<SyncOperation>(STORES.SYNC_QUEUE, id);
    if (operation) {
      operation.status = status;
      if (retries !== undefined) {
        operation.retries = retries;
      }
      await putItem(STORES.SYNC_QUEUE, operation);
    }
  },

  async remove(id: string): Promise<void> {
    return deleteItem(STORES.SYNC_QUEUE, id);
  },

  async clear(): Promise<void> {
    return clearStore(STORES.SYNC_QUEUE);
  },
};

// Metadata operations (for storing app state, last sync times, etc.)
export const MetadataDB = {
  async set(key: string, value: any): Promise<void> {
    return putItem(STORES.METADATA, { key, value, timestamp: new Date().toISOString() });
  },

  async get(key: string): Promise<any> {
    const result = await getItem<{ key: string; value: any; timestamp: string }>(STORES.METADATA, key);
    return result?.value || null;
  },

  async getLastSyncTime(): Promise<string | null> {
    return this.get('lastSyncTime');
  },

  async setLastSyncTime(time: string): Promise<void> {
    return this.set('lastSyncTime', time);
  },
};

// Clear all data (for logout/reset)
export async function clearAllData(): Promise<void> {
  await clearStore(STORES.PROFILES);
  await clearStore(STORES.BOOKINGS);
  await clearStore(STORES.NEWS_FEED);
  await clearStore(STORES.SYNC_QUEUE);
  await clearStore(STORES.METADATA);
  console.log('[IndexedDB] All data cleared');
}
