'use client'

import React, { useState, useEffect } from 'react'
import { Search, Calendar, Trophy, ExternalLink, Github, ArrowLeft } from 'lucide-react'
import { BeatmapsetGroup, SortOption } from '../components/types'
import { BeatmapsetCard } from '../components/BeatmapsetCard'
import { getModeIcon, getModeName, formatNumber, formatDate } from '../components/utils'
import { sortBeatmapsets, filterBeatmapsetsByModes } from '../components/sorting'
import Link from 'next/link'

interface Mapper {
  user_id: string
  username: string
  aliases?: string[]
  beatmaps: any[]
  beatmapsets: any[]
}

export default function AllMapsPage() {
  const [mappers, setMappers] = useState<Mapper[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModes, setSelectedModes] = useState<Set<string>>(new Set(['0', '1', '2', '3']))
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set(['1', '4'])) // ranked and loved
  const [displayStyle, setDisplayStyle] = useState<'card' | 'thumbnail' | 'minimal'>('card')
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMappers = async () => {
      try {
        const response = await fetch('/data/mappers.json')
        if (!response.ok) {
          throw new Error('Failed to fetch mappers data')
        }
        const data = await response.json()
        setMappers(data.mappers || data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchMappers()
  }, [])

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case '0': return '🔴' // osu! (filled red circle - cooler)
      case '1': return '🥁' // Taiko
      case '2': return '🍎' // Catch the Beat
      case '3': return '🎹' // osu!mania
      default: return '🔴'
    }
  }

  const getModeName = (mode: string) => {
    switch (mode) {
      case '0': return 'osu!'
      case '1': return 'Taiko'
      case '2': return 'Catch the Beat'
      case '3': return 'osu!mania'
      default: return 'osu!'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const toggleMode = (mode: string) => {
    const newSelectedModes = new Set(selectedModes)
    if (newSelectedModes.has(mode)) {
      newSelectedModes.delete(mode)
    } else {
      newSelectedModes.add(mode)
    }
    setSelectedModes(newSelectedModes)
  }

  // Get all beatmapsets from all mappers by constructing them from individual beatmaps
  const getAllBeatmapsets = (): BeatmapsetGroup[] => {
    const beatmapsetGroups = new Map<string, BeatmapsetGroup>()

    // Ensure mappers is an array before iterating
    if (!Array.isArray(mappers)) {
      return []
    }

    mappers.forEach(mapper => {
      const beatmaps = mapper.beatmaps || []
      
      beatmaps.forEach(beatmap => {
        const setId = beatmap.beatmapset_id
        
        if (!beatmapsetGroups.has(setId)) {
          // Create new beatmapset group
          beatmapsetGroups.set(setId, {
            beatmapset_id: setId,
            title: beatmap.title,
            artist: beatmap.artist,
            creator: beatmap.creator,
            approved_date: beatmap.approved_date,
            modes: [beatmap.mode],
            favourite_count: beatmap.favourite_count,
            playcount: beatmap.playcount,
            approved: beatmap.approved,
            isOwnMapset: true,
            difficulties: []
          })
        }
        
        const beatmapset = beatmapsetGroups.get(setId)!
        
        // Add mode if not already present
        if (!beatmapset.modes.includes(beatmap.mode)) {
          beatmapset.modes.push(beatmap.mode)
        }
        
        // Add difficulty and sum playcount
        beatmapset.difficulties.push({
          beatmap_id: beatmap.beatmap_id,
          version: beatmap.version,
          difficultyrating: beatmap.difficultyrating,
          mode: beatmap.mode,
          playcount: beatmap.playcount,
          favourite_count: beatmap.favourite_count
        })
        
        // Sum playcount from all difficulties in the set
        const currentPlaycount = parseInt(beatmapset.playcount || '0')
        const additionalPlaycount = parseInt(beatmap.playcount || '0')
        beatmapset.playcount = (currentPlaycount + additionalPlaycount).toString()
      })
    })

    return Array.from(beatmapsetGroups.values())
  }

  const filteredAndSortedBeatmapsets = (() => {
    let beatmapsets = getAllBeatmapsets()

    // Filter by search term
    if (searchTerm) {
      beatmapsets = beatmapsets.filter(set =>
        (set.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (set.artist || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (set.creator || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by selected modes
    beatmapsets = beatmapsets.filter(set =>
      set.modes.some(mode => selectedModes.has(mode))
    )

    // Filter by selected statuses
    beatmapsets = beatmapsets.filter(set =>
      selectedStatuses.has(set.approved)
    )

    // Sort beatmapsets
    beatmapsets.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.approved_date).getTime() - new Date(a.approved_date).getTime()
        case 'artist':
          return a.artist.localeCompare(b.artist)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'favorite':
          return parseInt(b.favourite_count) - parseInt(a.favourite_count)
        case 'playcount':
          return parseInt(b.playcount) - parseInt(a.playcount)
        default:
          return 0
      }
    })

    return beatmapsets
  })()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-osu-pink mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading beatmaps...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-osu-pink text-white rounded-lg hover:bg-osu-purple transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-osu-pink hover:text-osu-purple transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Mappers
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            All Korean Beatmaps
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse all ranked beatmaps from Korean mappers
          </p>
        </div>

        {/* Controls - Sticky */}
        <div className="sticky top-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="space-y-4">
            {/* First Row: Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search beatmapsets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-osu-pink focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 ease-in-out"
                />
              </div>
              
              {/* Sort */}
              <div className="flex items-center gap-2 min-w-fit">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'artist' | 'title' | 'favorite' | 'playcount')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-osu-pink focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 ease-in-out"
                >
                  <option value="date">Date</option>
                  <option value="artist">Artist</option>
                  <option value="title">Title</option>
                  <option value="favorite">Favorite Count</option>
                  <option value="playcount">Play Count</option>
                </select>
              </div>
            </div>

            {/* Second Row: Mode Filter and Status Filter */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Mode Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Modes:</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { mode: '0', name: 'osu!', icon: '🔴' },
                    { mode: '1', name: 'Taiko', icon: '🥁' },
                    { mode: '2', name: 'Catch', icon: '🍎' },
                    { mode: '3', name: 'Mania', icon: '🎹' }
                  ].map(({ mode, name, icon }) => (
                    <button
                      key={mode}
                      onClick={() => {
                        const newModes = new Set(selectedModes)
                        if (newModes.has(mode)) {
                          newModes.delete(mode)
                        } else {
                          newModes.add(mode)
                        }
                        setSelectedModes(newModes)
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out ${
                        selectedModes.has(mode)
                          ? 'bg-osu-pink text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      title={name}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

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
            </div>

            {/* Third Row: Display Style */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-600">
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

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedBeatmapsets.length} beatmapsets
          </div>
        </div>

        {/* Beatmapsets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAndSortedBeatmapsets.map((beatmapset) => (
            <BeatmapsetCard
              key={beatmapset.beatmapset_id}
              beatmapset={beatmapset}
              selectedModes={selectedModes}
              displayStyle={displayStyle}
              showMapperName={true}
            />
          ))}
        </div>

        {filteredAndSortedBeatmapsets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No beatmapsets found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
