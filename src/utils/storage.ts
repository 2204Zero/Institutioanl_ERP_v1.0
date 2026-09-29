/**
 * Enterprise Safe Storage Utilities with Fallback & Namespace Isolation
 */

const APP_PREFIX = 'erp_suite_';

class SafeStorage {
  private inMemoryStore = new Map<string, string>();

  private getStorage(type: 'local' | 'session'): Storage | null {
    try {
      const storage = type === 'local' ? window.localStorage : window.sessionStorage;
      const testKey = `${APP_PREFIX}test`;
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      return storage;
    } catch {
      return null;
    }
  }

  public getItem<T>(key: string, storageType: 'local' | 'session' = 'local'): T | null {
    const fullKey = `${APP_PREFIX}${key}`;
    const storage = this.getStorage(storageType);

    try {
      const raw = storage ? storage.getItem(fullKey) : this.inMemoryStore.get(fullKey) || null;
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[SafeStorage] Failed to parse item for key "${key}":`, err);
      return null;
    }
  }

  public setItem<T>(key: string, value: T, storageType: 'local' | 'session' = 'local'): boolean {
    const fullKey = `${APP_PREFIX}${key}`;
    const storage = this.getStorage(storageType);

    try {
      const serialized = JSON.stringify(value);
      if (storage) {
        storage.setItem(fullKey, serialized);
      } else {
        this.inMemoryStore.set(fullKey, serialized);
      }
      return true;
    } catch (err) {
      console.warn(`[SafeStorage] Failed to write item for key "${key}":`, err);
      return false;
    }
  }

  public removeItem(key: string, storageType: 'local' | 'session' = 'local'): void {
    const fullKey = `${APP_PREFIX}${key}`;
    const storage = this.getStorage(storageType);

    try {
      if (storage) {
        storage.removeItem(fullKey);
      }
      this.inMemoryStore.delete(fullKey);
    } catch (err) {
      console.warn(`[SafeStorage] Failed to remove key "${key}":`, err);
    }
  }

  public clear(storageType?: 'local' | 'session'): void {
    try {
      if (!storageType || storageType === 'local') {
        const local = this.getStorage('local');
        if (local) {
          Object.keys(local).forEach((k) => {
            if (k.startsWith(APP_PREFIX)) local.removeItem(k);
          });
        }
      }
      if (!storageType || storageType === 'session') {
        const session = this.getStorage('session');
        if (session) {
          Object.keys(session).forEach((k) => {
            if (k.startsWith(APP_PREFIX)) session.removeItem(k);
          });
        }
      }
      this.inMemoryStore.clear();
    } catch (err) {
      console.warn('[SafeStorage] Failed during clear:', err);
    }
  }
}

export const safeStorage = new SafeStorage();
