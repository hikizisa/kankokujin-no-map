'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, User, Calendar, Trophy, ExternalLink, Github, ChevronDown, ChevronUp } from 'lucide-react'
import { Mapper, MapperSortOption, SortOption, BeatmapsetGroup } from './components/types'
import { MapperCard } from './components/MapperCard'
import { processMapperData } from './components/beatmapset-utils'
import { getModeIcon, formatNumber, formatDate } from './components/utils'
import { sortMappers, calculateMostRecentRankedDate } from './components/sorting'
import { fetchData } from './components/api-utils'
import { filterMappers, calculateFilteredStats, toggleMode as toggleModeUtil } from './components/page-utils'
import { useLanguage } from './components/LanguageContext'
import { LanguageToggle } from './components/LanguageToggle'
import { FloatingDisplayToggle } from './components/FloatingDisplayToggle'
import { getModeName } from './components/i18n'

// Interfaces moved to shared components/types.ts

export default function Home() {
  const { language, t } = useLanguage()
  const [mappers, setMappers] = useState<Mapper[]>([])
  const [filteredMappers, setFilteredMappers] = useState<Mapper[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [totalStats, setTotalStats] = useState<any>({})
  const [selectedModes, setSelectedModes] = useState<Set<string>>(new Set(['0', '1', '2', '3']))
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set(['1', '4'])) // ranked and loved
  const [displayStyle, setDisplayStyle] = useState<'card' | 'thumbnail' | 'minimal'>('card')

  const [beatmapSortBy, setBeatmapSortBy] = useState<SortOption>('date')
  const [beatmapSortDirection, setBeatmapSortDirection] = useState<'asc' | 'desc'>('desc')

  const [mapperSortBy, setMapperSortBy] = useState<MapperSortOption>('name')
  const [mapperSortDirection, setMapperSortDirection] = useState<'asc' | 'desc'>('asc')
  const [expandedMappers, setExpandedMappers] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load mapper data from JSON file
    fetchData('data/mappers.json')
      .then(res => res.json())
      .then(data => {
        // Process mappers using shared utility function
        const processedMappers = data.mappers.map(processMapperData)
        
        setMappers(processedMappers)
        setFilteredMappers(processedMappers)
        setLastUpdated(data.lastUpdated || '')
        setTotalStats({
          totalMappers: data.totalMappers || 0,
          totalBeatmaps: data.totalBeatmaps || 0,
          totalBeatmapsets: data.totalBeatmapsets || 0,
          totalOwnBeatmapsets: data.totalOwnBeatmapsets || 0,
          totalGuestBeatmapsets: data.totalGuestBeatmapsets || 0,
          totalGuestDiffs: data.totalGuestDiffs || 0,
          totalOwnDifficulties: data.totalOwnDifficulties || 0
        })
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading mapper data:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    // Filter mappers using shared utility
    let filtered = filterMappers(mappers, searchTerm, selectedModes, selectedStatuses)
    
    // Sort mappers using shared sorting utility (considering current filters)
    filtered = sortMappers(filtered, mapperSortBy, mapperSortDirection, selectedModes, selectedStatuses)
    
    setFilteredMappers(filtered)
  }, [searchTerm, mappers, mapperSortBy, mapperSortDirection, selectedModes, selectedStatuses])

  const toggleMapper = (mapperId: string) => {
    const newExpanded = new Set(expandedMappers)
    if (newExpanded.has(mapperId)) {
      newExpanded.delete(mapperId)
    } else {
      newExpanded.add(mapperId)
    }
    setExpandedMappers(newExpanded)
  }

  const toggleMode = (mode: string) => {
    const newModes = new Set(selectedModes)
    if (newModes.has(mode)) {
      newModes.delete(mode)
    } else {
      newModes.add(mode)
    }
    setSelectedModes(newModes)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-osu-pink mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading Korean mappers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-end mb-4">
            <LanguageToggle />
          </div>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Github className="h-8 w-8 text-osu-pink" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-osu-pink via-osu-purple to-osu-blue bg-clip-text text-transparent">
                {t.title}
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              {t.subtitle}
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <Link
                href="/all-maps"
                className="px-6 py-3 bg-osu-pink text-white rounded-lg hover:bg-osu-purple transition-all duration-200 ease-in-out font-medium flex items-center gap-2 hover:scale-105 hover:shadow-lg"
              >
                <Calendar className="h-5 w-5" />
                {t.browseAllBeatmaps}
              </Link>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t.description}
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-2">
{t.lastUpdated}: {formatDate(lastUpdated)}
              </p>
            )}
          </div>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-osu-pink focus:border-transparent bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 ease-in-out"
            />
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
            <User className="h-6 w-6 text-osu-pink mx-auto mb-2" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {calculateFilteredStats(filteredMappers, selectedModes, totalStats).mapperCount}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{language === 'ko' ? '한국 매퍼' : 'Korean Mappers'}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
            <Trophy className="h-6 w-6 text-osu-blue mx-auto mb-2" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {calculateFilteredStats(filteredMappers, selectedModes, totalStats).beatmapCount}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{language === 'ko' ? '총 비트맵' : 'Total Beatmaps'}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
            <div className="h-6 w-6 text-osu-purple mx-auto mb-2 flex items-center justify-center font-bold text-lg">📦</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {calculateFilteredStats(filteredMappers, selectedModes, totalStats).beatmapsetCount}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalBeatmapsets}</p>
          </div>
        </div>

        {/* Controls - Sticky */}
        <div className="sticky top-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">


            {/* Second Row: Status Filter and Game Modes */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Status Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{t.filterByStatus}:</label>
                <div className="flex gap-3 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.has('1')}
                      onChange={(e) => {
                        const newStatuses = new Set(selectedStatuses)
                        if (e.target.checked) {
                          newStatuses.add('1')
                        } else {
                          newStatuses.delete('1')
                        }
                        setSelectedStatuses(newStatuses)
                      }}
                      className="rounded border-gray-300 text-osu-pink focus:ring-osu-pink"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">🏆 {t.ranked}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.has('4')}
                      onChange={(e) => {
                        const newStatuses = new Set(selectedStatuses)
                        if (e.target.checked) {
                          newStatuses.add('4')
                        } else {
                          newStatuses.delete('4')
                        }
                        setSelectedStatuses(newStatuses)
                      }}
                      className="rounded border-gray-300 text-osu-pink focus:ring-osu-pink"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">💖 {t.loved}</span>
                  </label>
                </div>
              </div>

              {/* Game Mode Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{t.filterByMode}:</label>
                <div className="flex gap-1 flex-wrap">
                  {['0', '1', '2', '3'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => toggleMode(mode)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ease-in-out hover:scale-105 ${
                        selectedModes.has(mode)
                          ? 'bg-osu-pink text-white shadow-md'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                       title={getModeName(mode, language)}
                    >
                      {getModeIcon(mode)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Third Row: Sorting Options */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
              {/* Mapper Sort */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{t.sortMappers}:</label>
                <div className="flex items-center gap-1">
                  <select
                    value={mapperSortBy}
                    onChange={(e) => setMapperSortBy(e.target.value as MapperSortOption)}
                    className="px-3 py-1 border border-gray-300 rounded-l-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-osu-pink focus:border-transparent transition-all duration-200 ease-in-out"
                  >
                    <option value="name">{t.sortByName}</option>
                    <option value="mapsets">{t.sortByBeatmapsets}</option>
                    {/* <option value="beatmaps">Total Beatmaps</option> */}
                    <option value="recent">{t.sortByRecent}</option>
                  </select>
                  <button
                    onClick={() => setMapperSortDirection(mapperSortDirection === 'asc' ? 'desc' : 'asc')}
                    className="px-2 py-1 border border-l-0 border-gray-300 rounded-r-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-osu-pink focus:border-transparent transition-all duration-200 ease-in-out"
                    title={mapperSortDirection === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {mapperSortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Beatmap Sort */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{t.sortBeatmaps}:</label>
                <div className="flex items-center gap-1">
                  <select
                    value={beatmapSortBy}
                    onChange={(e) => setBeatmapSortBy(e.target.value as SortOption)}
                    className="px-3 py-1 border border-gray-300 rounded-l-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-osu-pink focus:border-transparent transition-all duration-200 ease-in-out"
                  >
                    <option value="date">{t.sortByDate}</option>
                    <option value="artist">{t.sortByArtist}</option>
                    <option value="title">{t.sortByTitle}</option>
                    <option value="favorite">{t.sortByFavorites}</option>
                    <option value="playcount">{t.sortByPlaycount}</option>
                  </select>
                  <button
                    onClick={() => setBeatmapSortDirection(beatmapSortDirection === 'asc' ? 'desc' : 'asc')}
                    className="px-2 py-1 border border-l-0 border-gray-300 rounded-r-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-osu-pink focus:border-transparent transition-all duration-200 ease-in-out"
                    title={beatmapSortDirection === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    {beatmapSortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mappers List */}
        <div className="space-y-8">
          {filteredMappers.map((mapper) => (
            <MapperCard
              key={mapper.user_id}
              mapper={mapper}
              selectedModes={selectedModes}
              selectedStatuses={selectedStatuses}
              displayStyle={displayStyle}
              isExpanded={expandedMappers.has(mapper.user_id)}
              onToggle={toggleMapper}
              beatmapSortBy={beatmapSortBy}
              beatmapSortDirection={beatmapSortDirection}
            />
          ))}
        </div>

        {filteredMappers.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">
{t.noMappersFound}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Github className="h-5 w-5 text-gray-600" />
            <a
              href="https://github.com/hikizisa/kankokujin-no-map"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-osu-pink transition-colors"
            >
{t.viewOnGitHub}
            </a>
          </div>
          <p className="text-sm text-gray-500">
{t.footerText}
          </p>
        </div>
      </footer>
      
      {/* Floating Display Toggle */}
      <FloatingDisplayToggle
        displayStyle={displayStyle}
        onDisplayStyleChange={setDisplayStyle}
      />
    </div>
  )
}
