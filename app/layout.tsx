import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from './components/LanguageContext'

export const metadata: Metadata = {
  title: 'Korean Mappers Map | 한국인의 비트맵',
  description: 'Discover Korean osu! mappers and their ranked beatmaps',
  keywords: 'osu, korean mappers, beatmaps, 한국인 매퍼, 비트맵',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="font-korean bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
