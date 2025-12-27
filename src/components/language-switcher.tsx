'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Locale, languageMetadata, locales } from '@/config/i18n'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  variant?: 'homepage' | 'dashboard'
  showFlags?: boolean
  showNativeNames?: boolean
  className?: string
}

export function LanguageSwitcher({
  variant = 'homepage',
  showFlags = true,
  showNativeNames = true,
  className,
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(!isOpen)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Handle language selection
  const handleSelectLanguage = async (newLocale: Locale) => {
    await setLocale(newLocale)
    setIsOpen(false)
    // Announce change to screen readers
    announceToScreenReader(`Language changed to ${languageMetadata[newLocale].nativeName}`)
  }

  // Announce to screen readers
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    document.body.appendChild(announcement)
    setTimeout(() => announcement.remove(), 1000)
  }

  const currentLanguage = languageMetadata[locale]

  // Styles based on variant
  const buttonClasses = cn(
    'inline-flex items-center justify-center gap-2 px-3 rounded-md font-medium transition-all duration-200 border text-sm shadow-sm hover:shadow-md active:scale-95',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    // Responsive sizing to match Button component
    'h-9 sm:h-10',
    variant === 'homepage'
      ? 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
      : 'bg-muted text-muted-foreground hover:bg-muted/80',
    isOpen && 'bg-accent text-accent-foreground',
    className
  )

  const dropdownClasses = cn(
    'absolute right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-[100]',
    'min-w-max max-w-[90vw]',
    // Position dropdown upward for dashboard (in footer) and downward for homepage
    variant === 'dashboard' ? 'bottom-full mb-2' : 'top-full mt-2',
    // Better mobile sizing
    variant === 'homepage' ? 'w-56' : 'w-full sm:w-48'
  )

  const optionClasses = (isSelected: boolean) =>
    cn(
      'w-full text-left px-4 py-3 flex items-center gap-3 transition-colors duration-150',
      // Ensure minimum touch target size on mobile
      'min-h-[44px]',
      'hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500',
      isSelected ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-gray-700'
    )

  return (
    <div ref={dropdownRef} className="relative inline-block z-50">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={buttonClasses}
        aria-label={`Language: ${currentLanguage.nativeName}. Click to change language`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        type="button"
        data-testid="language-switcher"
      >
        {showFlags && <span className="text-lg">{currentLanguage.flag}</span>}
        <span className="text-sm font-medium">
          {showNativeNames ? currentLanguage.nativeName : currentLanguage.name}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className={dropdownClasses}
          role="listbox"
          aria-label="Select language"
        >
          {locales.map((lang) => {
            const metadata = languageMetadata[lang]
            const isSelected = lang === locale

            return (
              <button
                key={lang}
                onClick={() => handleSelectLanguage(lang)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectLanguage(lang)
                  } else if (e.key === 'Escape') {
                    setIsOpen(false)
                    buttonRef.current?.focus()
                  }
                }}
                className={optionClasses(isSelected)}
                role="option"
                aria-selected={isSelected}
                type="button"
                data-testid={`language-option-${lang}`}
              >
                {showFlags && <span className="text-lg">{metadata.flag}</span>}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{metadata.nativeName}</span>
                  {showNativeNames && metadata.nativeName !== metadata.name && (
                    <span className="text-xs text-gray-500">{metadata.name}</span>
                  )}
                </div>
                {isSelected && (
                  <span className="ml-auto text-blue-600" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
