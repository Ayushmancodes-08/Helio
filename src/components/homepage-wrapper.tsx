'use client'

import React from 'react'
import { LanguageProvider } from '@/context/language-context'
import LandingPage from '@/app/page'

/**
 * Wrapper component that provides LanguageProvider context to the homepage.
 * This ensures that useLanguage() hook works correctly on the homepage.
 */
export function HomepageWrapper() {
  return (
    <LanguageProvider>
      <LandingPage />
    </LanguageProvider>
  )
}
