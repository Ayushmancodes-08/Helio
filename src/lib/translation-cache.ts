/**
 * Translation Cache Utility
 * Implements caching strategy for translation files to optimize performance
 * 
 * Features:
 * - In-memory cache for loaded translations
 * - localStorage cache for offline access
 * - Cache invalidation and expiration
 * - Performance metrics tracking
 */

import { Locale } from '@/config/i18n'

interface CacheEntry {
  data: Record<string, any>
  timestamp: number
  size: number
}

interface CacheMetrics {
  hits: number
  misses: number
  totalLoadTime: number
  averageLoadTime: number
}

const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000 // 24 hours
const LOCALSTORAGE_CACHE_PREFIX = 'translation_cache_'
const CACHE_METRICS_KEY = 'translation_cache_metrics'

class TranslationCache {
  private memoryCache: Map<string, CacheEntry> = new Map()
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    totalLoadTime: 0,
    averageLoadTime: 0,
  }

  /**
   * Get translation from cache (memory first, then localStorage)
   * @param locale - The locale to get
   * @param namespace - The namespace to get
   * @returns The cached translation or null if not found
   */
  get(locale: Locale, namespace: string): Record<string, any> | null {
    const cacheKey = `${locale}:${namespace}`

    // Check memory cache first
    const memoryEntry = this.memoryCache.get(cacheKey)
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      this.metrics.hits++
      return memoryEntry.data
    }

    // Check localStorage cache
    const localStorageEntry = this.getFromLocalStorage(locale, namespace)
    if (localStorageEntry && !this.isExpired(localStorageEntry)) {
      this.metrics.hits++
      // Restore to memory cache
      this.memoryCache.set(cacheKey, localStorageEntry)
      return localStorageEntry.data
    }

    this.metrics.misses++
    return null
  }

  /**
   * Set translation in cache (both memory and localStorage)
   * @param locale - The locale to set
   * @param namespace - The namespace to set
   * @param data - The translation data
   */
  set(locale: Locale, namespace: string, data: Record<string, any>): void {
    const cacheKey = `${locale}:${namespace}`
    const size = JSON.stringify(data).length

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      size,
    }

    // Store in memory cache
    this.memoryCache.set(cacheKey, entry)

    // Store in localStorage for offline access
    this.setToLocalStorage(locale, namespace, entry)
  }

  /**
   * Clear cache for a specific locale
   * @param locale - The locale to clear
   */
  clearLocale(locale: Locale): void {
    // Clear memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(`${locale}:`)) {
        this.memoryCache.delete(key)
      }
    }

    // Clear localStorage cache
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(`${LOCALSTORAGE_CACHE_PREFIX}${locale}:`)) {
          localStorage.removeItem(key)
        }
      }
    }
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.memoryCache.clear()
    this.metrics = {
      hits: 0,
      misses: 0,
      totalLoadTime: 0,
      averageLoadTime: 0,
    }

    if (typeof window !== 'undefined') {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key?.startsWith(LOCALSTORAGE_CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      }
    }
  }

  /**
   * Get cache metrics
   * @returns Cache metrics including hit rate and average load time
   */
  getMetrics(): CacheMetrics & { hitRate: number } {
    const totalRequests = this.metrics.hits + this.metrics.misses
    const hitRate = totalRequests > 0 ? (this.metrics.hits / totalRequests) * 100 : 0

    return {
      ...this.metrics,
      hitRate,
    }
  }

  /**
   * Record load time for performance tracking
   * @param loadTime - The time taken to load in milliseconds
   */
  recordLoadTime(loadTime: number): void {
    this.metrics.totalLoadTime += loadTime
    const totalRequests = this.metrics.hits + this.metrics.misses
    this.metrics.averageLoadTime = this.metrics.totalLoadTime / totalRequests
  }

  /**
   * Get cache size in bytes
   * @returns Total size of all cached translations
   */
  getCacheSize(): number {
    let totalSize = 0
    for (const entry of this.memoryCache.values()) {
      totalSize += entry.size
    }
    return totalSize
  }

  /**
   * Check if cache entry is expired
   * @param entry - The cache entry to check
   * @returns true if expired, false otherwise
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > CACHE_EXPIRATION_MS
  }

  /**
   * Get translation from localStorage
   * @param locale - The locale to get
   * @param namespace - The namespace to get
   * @returns The cached entry or null if not found
   */
  private getFromLocalStorage(locale: Locale, namespace: string): CacheEntry | null {
    try {
      if (typeof window === 'undefined') {
        return null
      }

      const key = `${LOCALSTORAGE_CACHE_PREFIX}${locale}:${namespace}`
      const stored = localStorage.getItem(key)

      if (!stored) {
        return null
      }

      return JSON.parse(stored) as CacheEntry
    } catch (error) {
      console.warn('Failed to get translation from localStorage:', error)
      return null
    }
  }

  /**
   * Set translation in localStorage
   * @param locale - The locale to set
   * @param namespace - The namespace to set
   * @param entry - The cache entry to store
   */
  private setToLocalStorage(locale: Locale, namespace: string, entry: CacheEntry): void {
    try {
      if (typeof window === 'undefined') {
        return
      }

      const key = `${LOCALSTORAGE_CACHE_PREFIX}${locale}:${namespace}`
      localStorage.setItem(key, JSON.stringify(entry))
    } catch (error) {
      // Silently fail if localStorage is full or unavailable
      console.warn('Failed to set translation in localStorage:', error)
    }
  }
}

// Export singleton instance
export const translationCache = new TranslationCache()

export type { CacheEntry, CacheMetrics }
