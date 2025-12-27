import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/language/save
 * Save user's language preference to database
 * 
 * Request body:
 * {
 *   language_preference: 'hi-IN' | 'en-IN' | 'bn-IN' | 'te-IN'
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   message: string
 *   language_preference?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { language_preference } = await request.json()

    // Validate language preference
    const validLanguages = ['hi-IN', 'en-IN', 'bn-IN', 'te-IN']
    if (!language_preference || !validLanguages.includes(language_preference)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid language preference. Must be one of: ${validLanguages.join(', ')}`,
          errorCode: 'validation.pattern',
        },
        { status: 400 }
      )
    }

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

    // Update user profile with language preference
    const { data, error } = await supabase
      .from('profiles')
      .update({ language_preference })
      .eq('auth_user_id', user.id)
      .select('language_preference')
      .single()

    if (error) {
      console.error('Error saving language preference:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to save language preference',
          errorCode: 'database.queryError',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Language preference saved successfully',
        language_preference: data?.language_preference,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in language save endpoint:', error)
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
