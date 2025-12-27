import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { loadLanguageFromDatabase } from '@/lib/i18n-storage'

describe('i18n-storage Database Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Ensure window is defined for tests
    if (typeof window === 'undefined') {
      global.window = {} as any
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('loadLanguageFromDatabase', () => {
    it('should load language preference from database for authenticated user', async () => {
      // Mock fetch
      const mockJson = vi.fn().mockResolvedValue({
        success: true,
        language_preference: 'hi-IN',
      })
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: mockJson,
      })

      const result = await loadLanguageFromDatabase()

      expect(result).toBe('hi-IN')
      expect(global.fetch).toHaveBeenCalledWith('/api/language/load', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('should return null if API call fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      })

      const result = await loadLanguageFromDatabase()

      expect(result).toBeNull()
    })

    it('should return null if language preference is invalid', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          language_preference: 'invalid-lang',
        }),
      })

      const result = await loadLanguageFromDatabase()

      expect(result).toBeNull()
    })

    it('should return null if fetch throws error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const result = await loadLanguageFromDatabase()

      expect(result).toBeNull()
    })

    it('should return null if window is undefined (server-side)', async () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      const result = await loadLanguageFromDatabase()

      expect(result).toBeNull()

      global.window = originalWindow
    })

    it('should load valid language codes', async () => {
      const validLanguages = ['hi-IN', 'en-IN', 'bn-IN', 'te-IN']

      for (const lang of validLanguages) {
        const mockJson = vi.fn().mockResolvedValue({
          success: true,
          language_preference: lang,
        })
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: mockJson,
        })

        const result = await loadLanguageFromDatabase()
        expect(result).toBe(lang)
      }
    })
  })
})
