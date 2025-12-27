import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/language/load
 * Load user's language preference from database
 * 
 * Response:
 * {
 *   success: boolean
 *   message: string
 *   language_preference?: string
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not authenticated',
          errorCode: 'general.unauthorized',
        },
        { status: 401 }
      )
    }

    // Fetch user profile with language preference
    const { data, error } = await supabase
      .from('profiles')
      .select('language_preference')
      .eq('auth_user_id', user.id)
      .single()

    if (error) {
      console.error('Error loading language preference:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to load language preference',
          errorCode: 'database.queryError',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Language preference loaded successfully',
        language_preference: data?.language_preference || 'en-IN',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in language load endpoint:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        errorCode: 'general.serverError',
      },
      { status: 500 }
    )
  }
}
