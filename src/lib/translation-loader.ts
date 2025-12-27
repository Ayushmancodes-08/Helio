/**
 * Translation Loader Utility
 * Implements lazy loading and code splitting for translation files
 * 
 * Features:
 * - Lazy load translation files on demand
 * - Preload translations for better UX
 * - Retry logic with exponential backoff
 * - Performance tracking
 */

import { Locale } from '@/config/i18n'
import { translationCache } from './translation-cache'

interface LoaderMetrics {
  totalLoads: number
  successfulLoads: number
  failedLoads: number
  totalLoadTime: number
  averageLoadTime: number
}

const RETRY_ATTEMPTS = 3
const INITIAL_RETRY_DELAY_MS = 100
const MAX_RETRY_DELAY_MS = 1000

class TranslationLoader {
  private loadingPromises: Map<string, Promise<Record<string, any>>> = new Map()
  private metrics: LoaderMetrics = {
    totalLoads: 0,
    successfulLoads: 0,
    failedLoads: 0,
    totalLoadTime: 0,
    averageLoadTime: 0,
  }

  /**
   * Load translation file with caching and retry logic
   * @param locale - The locale to load
   * @param namespace - The namespace to load
   * @returns The loaded translation data
   */
  async load(locale: Locale, namespace: string): Promise<Record<string, any>> {
    const cacheKey = `${locale}:${namespace}`

    // Check cache first
    const cached = translationCache.get(locale, namespace)
    if (cached) {
      return cached
    }

    // Check if already loading to avoid duplicate requests
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!
    }

    // Create loading promise
    const loadPromise = this.loadWithRetry(locale, namespace)
    this.loadingPromises.set(cacheKey, loadPromise)

    try {
      const data = await loadPromise
      this.metrics.successfulLoads++
      return data
    } catch (error) {
      this.metrics.failedLoads++
      throw error
    } finally {
      this.loadingPromises.delete(cacheKey)
    }
  }

  /**
   * Load multiple translation namespaces in parallel
   * @param locale - The locale to load
   * @param namespaces - The namespaces to load
   * @returns Object with namespace keys and translation data values
   */
  async loadMultiple(
    locale: Locale,
    namespaces: string[]
  ): Promise<Record<string, Record<string, any>>> {
    const results: Record<string, Record<string, any>> = {}

    const promises = namespaces.map(async (namespace) => {
      try {
        const data = await this.load(locale, namespace)
        results[namespace] = data
      } catch (error) {
        console.warn(`Failed to load ${namespace} for ${locale}:`, error)
        results[namespace] = {}
      }
    })

    await Promise.all(promises)
    return results
  }

  /**
   * Preload translations for better UX
   * @param locale - The locale to preload
   * @param namespaces - The namespaces to preload
   */
  async preload(locale: Locale, namespaces: string[]): Promise<void> {
    try {
      await this.loadMultiple(locale, namespaces)
    } catch (error) {
      console.warn('Failed to preload translations:', error)
    }
  }

  /**
   * Load with retry logic and exponential backoff
   * @param locale - The locale to load
   * @param namespace - The namespace to load
   * @returns The loaded translation data
   */
  private async loadWithRetry(
    locale: Locale,
    namespace: string,
    attempt: number = 0
  ): Promise<Record<string, any>> {
    const startTime = performance.now()
    this.metrics.totalLoads++

    try {
      const response = await fetch(`/locales/${locale}/${namespace}.json`, {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'force-cache',
      })

      if (!response.ok) {
        throw new Error(`Failed to load ${namespace} for ${locale}: ${response.status}`)
      }

      const data = await response.json()

      // Cache the loaded data
      translationCache.set(locale, namespace, data)

      // Record load time
      const loadTime = performance.now() - startTime
      this.metrics.totalLoadTime += loadTime
      this.metrics.averageLoadTime = this.metrics.totalLoadTime / this.metrics.successfulLoads
      translationCache.recordLoadTime(loadTime)

      return data
    } catch (error) {
      if (attempt < RETRY_ATTEMPTS - 1) {
        // Calculate exponential backoff delay
        const delay = Math.min(
          INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt),
          MAX_RETRY_DELAY_MS
        )

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay))

        // Retry
        return this.loadWithRetry(locale, namespace, attempt + 1)
      }

      throw error
    }
  }

  /**
   * Get loader metrics
   * @returns Loader metrics including success rate and average load time
   */
  getMetrics(): LoaderMetrics & { successRate: number } {
    const successRate =
      this.metrics.totalLoads > 0
        ? (this.metrics.successfulLoads / this.metrics.totalLoads) * 100
        : 0

    return {
      ...this.metrics,
      successRate,
    }
  }

  /**
   * Clear all loading promises
   */
  clearLoadingPromises(): void {
    this.loadingPromises.clear()
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalLoads: 0,
      successfulLoads: 0,
      failedLoads: 0,
      totalLoadTime: 0,
      averageLoadTime: 0,
    }
  }
}

// Export singleton instance
export const translationLoader = new TranslationLoader()

export type { LoaderMetrics }
