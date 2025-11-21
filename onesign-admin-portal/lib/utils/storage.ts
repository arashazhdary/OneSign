/**
 * Storage helper utilities for localStorage and sessionStorage
 */

export type StorageType = 'local' | 'session';

/**
 * Get storage object based on type
 */
function getStorage(type: StorageType = 'local'): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return type === 'local' ? window.localStorage : window.sessionStorage;
}

/**
 * Set item in storage with JSON serialization
 */
export function setItem<T>(
  key: string,
  value: T,
  type: StorageType = 'local'
): boolean {
  try {
    const storage = getStorage(type);
    if (!storage) return false;

    const serialized = JSON.stringify(value);
    storage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error setting ${type}Storage item "${key}":`, error);
    return false;
  }
}

/**
 * Get item from storage with JSON deserialization
 */
export function getItem<T>(
  key: string,
  defaultValue: T | null = null,
  type: StorageType = 'local'
): T | null {
  try {
    const storage = getStorage(type);
    if (!storage) return defaultValue;

    const item = storage.getItem(key);
    if (item === null) return defaultValue;

    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error getting ${type}Storage item "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Remove item from storage
 */
export function removeItem(key: string, type: StorageType = 'local'): boolean {
  try {
    const storage = getStorage(type);
    if (!storage) return false;

    storage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${type}Storage item "${key}":`, error);
    return false;
  }
}

/**
 * Clear all items from storage
 */
export function clear(type: StorageType = 'local'): boolean {
  try {
    const storage = getStorage(type);
    if (!storage) return false;

    storage.clear();
    return true;
  } catch (error) {
    console.error(`Error clearing ${type}Storage:`, error);
    return false;
  }
}

/**
 * Check if key exists in storage
 */
export function hasItem(key: string, type: StorageType = 'local'): boolean {
  const storage = getStorage(type);
  if (!storage) return false;

  return storage.getItem(key) !== null;
}

/**
 * Get all keys from storage
 */
export function getKeys(type: StorageType = 'local'): string[] {
  const storage = getStorage(type);
  if (!storage) return [];

  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key) keys.push(key);
  }

  return keys;
}

/**
 * Get all items from storage as object
 */
export function getAll(type: StorageType = 'local'): Record<string, any> {
  const storage = getStorage(type);
  if (!storage) return {};

  const items: Record<string, any> = {};
  const keys = getKeys(type);

  for (const key of keys) {
    items[key] = getItem(key, null, type);
  }

  return items;
}

/**
 * Get storage size in bytes
 */
export function getSize(type: StorageType = 'local'): number {
  const storage = getStorage(type);
  if (!storage) return 0;

  let size = 0;
  const keys = getKeys(type);

  for (const key of keys) {
    const item = storage.getItem(key);
    if (item) {
      size += key.length + item.length;
    }
  }

  return size;
}

/**
 * Get storage size in human-readable format
 */
export function getSizeFormatted(type: StorageType = 'local'): string {
  const bytes = getSize(type);

  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Check if storage is available
 */
export function isAvailable(type: StorageType = 'local'): boolean {
  try {
    const storage = getStorage(type);
    if (!storage) return false;

    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Set item with expiration time
 */
export function setItemWithExpiry<T>(
  key: string,
  value: T,
  expiryInMs: number,
  type: StorageType = 'local'
): boolean {
  const now = new Date().getTime();
  const item = {
    value,
    expiry: now + expiryInMs,
  };

  return setItem(key, item, type);
}

/**
 * Get item with expiration check
 */
export function getItemWithExpiry<T>(
  key: string,
  defaultValue: T | null = null,
  type: StorageType = 'local'
): T | null {
  const item = getItem<{ value: T; expiry: number }>(key, null, type);

  if (!item) return defaultValue;

  const now = new Date().getTime();

  if (now > item.expiry) {
    removeItem(key, type);
    return defaultValue;
  }

  return item.value;
}

/**
 * localStorage helpers
 */
export const localStorage = {
  set: <T>(key: string, value: T) => setItem(key, value, 'local'),
  get: <T>(key: string, defaultValue: T | null = null) =>
    getItem<T>(key, defaultValue, 'local'),
  remove: (key: string) => removeItem(key, 'local'),
  clear: () => clear('local'),
  has: (key: string) => hasItem(key, 'local'),
  getKeys: () => getKeys('local'),
  getAll: () => getAll('local'),
  getSize: () => getSize('local'),
  setWithExpiry: <T>(key: string, value: T, expiryInMs: number) =>
    setItemWithExpiry(key, value, expiryInMs, 'local'),
  getWithExpiry: <T>(key: string, defaultValue: T | null = null) =>
    getItemWithExpiry<T>(key, defaultValue, 'local'),
};

/**
 * sessionStorage helpers
 */
export const sessionStorage = {
  set: <T>(key: string, value: T) => setItem(key, value, 'session'),
  get: <T>(key: string, defaultValue: T | null = null) =>
    getItem<T>(key, defaultValue, 'session'),
  remove: (key: string) => removeItem(key, 'session'),
  clear: () => clear('session'),
  has: (key: string) => hasItem(key, 'session'),
  getKeys: () => getKeys('session'),
  getAll: () => getAll('session'),
  getSize: () => getSize('session'),
  setWithExpiry: <T>(key: string, value: T, expiryInMs: number) =>
    setItemWithExpiry(key, value, expiryInMs, 'session'),
  getWithExpiry: <T>(key: string, defaultValue: T | null = null) =>
    getItemWithExpiry<T>(key, defaultValue, 'session'),
};

/**
 * Cookie storage helpers
 */
export const cookieStorage = {
  set: (name: string, value: string, days = 7) => {
    if (typeof document === 'undefined') return false;

    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    return true;
  },

  get: (name: string): string | null => {
    if (typeof document === 'undefined') return null;

    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }

    return null;
  },

  remove: (name: string) => {
    if (typeof document === 'undefined') return false;

    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    return true;
  },

  has: (name: string): boolean => {
    return cookieStorage.get(name) !== null;
  },
};

/**
 * Clear storage by prefix
 */
export function clearByPrefix(prefix: string, type: StorageType = 'local'): boolean {
  try {
    const keys = getKeys(type);
    const keysToRemove = keys.filter((key) => key.startsWith(prefix));

    keysToRemove.forEach((key) => removeItem(key, type));
    return true;
  } catch (error) {
    console.error(`Error clearing ${type}Storage by prefix "${prefix}":`, error);
    return false;
  }
}

/**
 * Get items by prefix
 */
export function getByPrefix<T>(
  prefix: string,
  type: StorageType = 'local'
): Record<string, T> {
  const keys = getKeys(type);
  const items: Record<string, T> = {};

  keys
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => {
      const value = getItem<T>(key, null, type);
      if (value !== null) {
        items[key] = value;
      }
    });

  return items;
}
