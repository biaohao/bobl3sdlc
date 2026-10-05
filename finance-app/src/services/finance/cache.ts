const CACHE_TTL_MS = 5 * 60 * 1000;
const MEMORY_CACHE = new Map<string, { data: unknown; expires: number }>();

function getCacheKey(prefix: string, ...parts: string[]): string {
  return `${prefix}:${parts.join(':')}`;
}

export function getCached<T>(prefix: string, ...parts: string[]): T | null {
  const key = getCacheKey(prefix, ...parts);

  const memoryEntry = MEMORY_CACHE.get(key);
  if (memoryEntry && memoryEntry.expires > Date.now()) {
    return memoryEntry.data as T;
  }

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const { data, expires } = JSON.parse(stored);
      if (expires > Date.now()) {
        MEMORY_CACHE.set(key, { data, expires });
        return data as T;
      }
    }
  } catch {
    // Ignore localStorage errors
  }

  return null;
}

export function setCache(prefix: string, data: unknown, ...parts: string[]): void {
  const key = getCacheKey(prefix, ...parts);
  const expires = Date.now() + CACHE_TTL_MS;

  MEMORY_CACHE.set(key, { data, expires });

  try {
    localStorage.setItem(key, JSON.stringify({ data, expires }));
  } catch {
    // Ignore localStorage errors (e.g., quota exceeded)
  }
}

export function clearCache(prefix?: string): void {
  if (!prefix) {
    MEMORY_CACHE.clear();
    try {
      localStorage.clear();
    } catch {
      // Ignore
    }
    return;
  }

  const keysToDelete: string[] = [];
  MEMORY_CACHE.forEach((_, key) => {
    if (key.startsWith(`${prefix}:`)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => MEMORY_CACHE.delete(key));

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${prefix}:`)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore
  }
}