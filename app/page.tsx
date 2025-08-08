'use client'

import React, { useState, useEffect } from 'react'
import { Search, User, Calendar, Trophy, ExternalLink, Github, ChevronDown, ChevronUp } from 'lucide-react'
import { Mapper, MapperSortOption, SortOption, BeatmapsetGroup } from './components/types'
import { MapperCard } from './components/MapperCard'
import { processMapperData } from './components/beatmapset-utils'
import { getModeIcon, getModeName, formatNumber, formatDate, searchInMapper } from './components/utils'
import { sortMappers, calculateMostRecentRankedDate } from './components/sorting'

// Interfaces moved to shared components/types.ts

export default function Home() {
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

  const [mapperSortBy, setMapperSortBy] = useState<MapperSortOption>('name')
  const [expandedMappers, setExpandedMappers] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load mapper data from JSON file
    fetch('/data/mappers.json')
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
    // Filter mappers based on search term using shared utility
    let filtered = mappers.filter(mapper => searchInMapper(mapper, searchTerm))
    
    // Sort mappers using shared sorting utility
    filtered = sortMappers(filtered, mapperSortBy)
    
    setFilteredMappers(filtered)
  }, [searchTerm, mappers, mapperSortBy])

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
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-4">
              Korean Mapper's Map
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Discover ranked beatmaps from talented Korean mappers in the osu! community
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <a
                href="/all-maps"
                className="px-6 py-3 bg-osu-pink text-white rounded-lg hover:bg-osu-purple transition-all duration-200 ease-in-out font-medium flex items-center gap-2 hover:scale-105 hover:shadow-lg"
              >
                <Calendar className="h-5 w-5" />
                Browse All Beatmaps
              </a>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover talented Korean osu! mappers and their ranked beatmaps. 
              This site is automatically updated daily to showcase the latest contributions from the Korean mapping community.
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {formatDate(lastUpdated)}
              </p>
            )}
          </div>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search mappers or beatmaps..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-osu-pink focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 ease-in-out"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {(() => {
                // Count mappers who have beatmaps matching the current mode filter
                if (selectedModes.size === 0) {
                  return totalStats.totalMappers || filteredMappers.length
                }
                return filteredMappers.filter(mapper => 
                  mapper.beatmaps?.some(beatmap => selectedModes.has(beatmap.mode || '0'))
                ).length
              })()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Korean Mappers</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
            <Trophy className="h-6 w-6 text-osu-blue mx-auto mb-2" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {(() => {
                if (selectedModes.size === 0) {
                  return totalStats.totalBeatmaps || filteredMappers.reduce((total, mapper) => total + (mapper.rankedBeatmaps || mapper.beatmaps?.length || 0), 0)
                }
                return filteredMappers.reduce((total, mapper) => {
                  const filteredBeatmaps = mapper.beatmaps?.filter(beatmap => selectedModes.has(beatmap.mode || '0')) || []
                  return total + filteredBeatmaps.length
                }, 0)
              })()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Beatmaps</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
            <div className="h-6 w-6 text-osu-purple mx-auto mb-2 flex items-center justify-center font-bold text-lg">📦</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {(() => {
                if (selectedModes.size === 0) {
                  return totalStats.totalBeatmapsets || filteredMappers.reduce((total, mapper) => total + (mapper.rankedBeatmapsets || 0), 0)
                }
                // Count unique beatmapsets that have difficulties in selected modes
                const beatmapsetIds = new Set()
                filteredMappers.forEach(mapper => {
                  mapper.beatmaps?.forEach(beatmap => {
                    if (selectedModes.has(beatmap.mode || '0')) {
                      beatmapsetIds.add(beatmap.beatmapset_id)
                    }
                  })
                })
                return beatmapsetIds.size
              })()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Beatmapsets</p>
          </div>
        </div>

        {/* Controls - Sticky */}
        <div className="sticky top-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            {/* Display Style */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Display:</label>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setDisplayStyle('card')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ease-in-out ${
                      displayStyle === 'card'
                        ? 'bg-osu-pink text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    onClick={() => setDisplayStyle('thumbnail')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ease-in-out ${
                      displayStyle === 'thumbnail'
                        ? 'bg-osu-pink text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    Thumbnail
                  </button>
                  <button
                    onClick={() => setDisplayStyle('minimal')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ease-in-out ${
                      displayStyle === 'minimal'
                        ? 'bg-osu-pink text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    Minimal
                  </button>
                </div>
              </div>
            </div>

            {/* Second Row: Status Filter and Game Modes */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Status Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Status:</label>
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
                    <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">🏆 Ranked</span>
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
                    <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">💖 Loved</span>
                  </label>
                </div>
              </div>

              {/* Game Mode Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Modes:</label>
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
                      title={getModeName(mode)}
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Sort mappers:</label>
                <select
                  value={mapperSortBy}
                  onChange={(e) => setMapperSortBy(e.target.value as MapperSortOption)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-osu-pink focus:border-transparent transition-all duration-200 ease-in-out"
                >
                  <option value="name">Name</option>
                  <option value="mapsets">Beatmapsets</option>
                  <option value="beatmaps">Total Beatmaps</option>
                  <option value="recent">Most Recent</option>
                </select>
              </div>

              {/* Beatmap Sort */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Sort beatmaps:</label>
                <select
                  value={beatmapSortBy}
                  onChange={(e) => setBeatmapSortBy(e.target.value as SortOption)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-osu-pink focus:border-transparent transition-all duration-200 ease-in-out"
                >
                  <option value="date">Date</option>
                  <option value="artist">Artist</option>
                  <option value="title">Title</option>
                  <option value="favorite">Favorites</option>
                  <option value="playcount">Playcount</option>
                </select>
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
            />
          ))}
        </div>

        {filteredMappers.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No mappers found matching your search.
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
              href="https://github.com/passe/kankokujin-no-map"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-osu-pink transition-colors"
            >
              View on GitHub
            </a>
          </div>
          <p className="text-sm text-gray-500">
            Data sourced from osu! API • Updated daily via GitHub Actions
          </p>
        </div>
      </footer>
    </div>
  )
}
