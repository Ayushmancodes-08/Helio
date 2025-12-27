import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  })),
}))

describe('Language API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/language/save', () => {
    it('should save language preference for authenticated user', async () => {
      const { POST } = await import('../save/route')
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { language_preference: 'hi-IN' },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }

      vi.mocked(require('@/lib/supabase/server').createClient).mockReturnValue(mockSupabase)

      const request = new NextRequest('http://localhost:3000/api/language/save', {
        method: 'POST',
        body: JSON.stringify({ language_preference: 'hi-IN' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.language_preference).toBe('hi-IN')
    })

    it('should reject invalid language preference', async () => {
      const { POST } = await import('../save/route')

      const request = new NextRequest('http://localhost:3000/api/language/save', {
        method: 'POST',
        body: JSON.stringify({ language_preference: 'invalid-lang' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should return 401 if user is not authenticated', async () => {
      const { POST } = await import('../save/route')
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Not authenticated'),
          }),
        },
      }

      vi.mocked(require('@/lib/supabase/server').createClient).mockReturnValue(mockSupabase)

      const request = new NextRequest('http://localhost:3000/api/language/save', {
        method: 'POST',
        body: JSON.stringify({ language_preference: 'hi-IN' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })

  describe('GET /api/language/load', () => {
    it('should load language preference for authenticated user', async () => {
      const { GET } = await import('../load/route')
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { language_preference: 'bn-IN' },
                error: null,
              }),
            }),
          }),
        }),
      }

      vi.mocked(require('@/lib/supabase/server').createClient).mockReturnValue(mockSupabase)

      const request = new NextRequest('http://localhost:3000/api/language/load', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.language_preference).toBe('bn-IN')
    })

    it('should return default language if not set', async () => {
      const { GET } = await import('../load/route')
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'test-user-id' } },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { language_preference: null },
                error: null,
              }),
            }),
          }),
        }),
      }

      vi.mocked(require('@/lib/supabase/server').createClient).mockReturnValue(mockSupabase)

      const request = new NextRequest('http://localhost:3000/api/language/load', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.language_preference).toBe('en-IN')
    })

    it('should return 401 if user is not authenticated', async () => {
      const { GET } = await import('../load/route')
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Not authenticated'),
          }),
        },
      }

      vi.mocked(require('@/lib/supabase/server').createClient).mockReturnValue(mockSupabase)

      const request = new NextRequest('http://localhost:3000/api/language/load', {
        method: 'GET',
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })
})
