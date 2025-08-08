'use client'

import React from 'react'
import { Globe } from 'lucide-react'
import { useLanguage } from './LanguageContext'

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'ko' | 'en')}
        className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-osu-pink focus:border-transparent transition-all duration-200 ease-in-out"
        title={t.language}
      >
        <option value="ko">{t.korean}</option>
        <option value="en">{t.english}</option>
      </select>
    </div>
  )
}
