'use client'

import React, { useState, useEffect } from 'react'
import { Search, Calendar, ExternalLink, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Beatmap {
  beatmap_id: string
  beatmapset_id: string
  title: string
  artist: string
  creator: string
  mode: string
  approved_date: string
  difficultyrating?: string
  version?: string
}

interface Difficulty {
  beatmap_id: string
  version: string
  difficultyrating?: string
  mode?: string
}

interface Beatmapset {
  beatmapset_id: string
  title: string
  artist: string
  creator: string
  approved_date: string
  difficulties?: Difficulty[]
}

interface Mapper {
  user_id: string
  username: string
  rankedBeatmaps: number
  rankedBeatmapsets: number
  beatmaps?: Beatmap[]
  beatmapsets?: Beatmapset[]
}

interface BeatmapsetGroup {
  beatmapset_id: string
  title: string
  artist: string
  creator: string
  approved_date: string
  modes: string[]
  difficulties: Beatmap[]
}

export default function AllMapsPage() {
  const [mappers, setMappers] = useState<Mapper[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModes, setSelectedModes] = useState<Set<string>>(new Set(['0', '1', '2', '3']))
  const [sortBy, setSortBy] = useState<'date' | 'artist' | 'title'>('date')
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
      case '0': return '🩷' // osu! (pink circle)
      case '1': return '🥁' // Taiko
      case '2': return '🍎' // Catch the Beat
      case '3': return '🎹' // osu!mania
      default: return '🩷'
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

  // Get all beatmapsets from all mappers
  const getAllBeatmapsets = (): BeatmapsetGroup[] => {
    const beatmapsetMap = new Map<string, BeatmapsetGroup>()

    // Ensure mappers is an array before iterating
    if (!Array.isArray(mappers)) {
      return []
    }

    mappers.forEach(mapper => {
      // Use beatmapsets array if available, otherwise fall back to beatmaps
      const beatmapsets = (mapper as any).beatmapsets || []
      
      beatmapsets.forEach(beatmapset => {
        const setId = beatmapset.beatmapset_id
        if (!beatmapsetMap.has(setId)) {
          // Get all modes from difficulties
          const modes = beatmapset.difficulties?.map(diff => diff.mode || '0') || ['0']
          const modeSet = new Set<string>()
          modes.forEach(mode => modeSet.add(mode))
          const uniqueModes: string[] = []
          modeSet.forEach(mode => uniqueModes.push(mode))
          
          beatmapsetMap.set(setId, {
            beatmapset_id: setId,
            title: beatmapset.title,
            artist: beatmapset.artist,
            creator: beatmapset.creator,
            approved_date: beatmapset.approved_date,
            modes: uniqueModes,
            difficulties: beatmapset.difficulties?.map(diff => ({
              beatmap_id: diff.beatmap_id,
              beatmapset_id: setId,
              title: beatmapset.title,
              artist: beatmapset.artist,
              creator: beatmapset.creator,
              mode: diff.mode || '0',
              approved_date: beatmapset.approved_date,
              difficultyrating: diff.difficultyrating,
              version: diff.version
            })) || []
          })
        }
      })
    })

    return Array.from(beatmapsetMap.values())
  }

  const filteredAndSortedBeatmapsets = (() => {
    let beatmapsets = getAllBeatmapsets()

    // Filter by search term
    if (searchTerm) {
      beatmapsets = beatmapsets.filter(set =>
        set.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        set.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        set.creator.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by selected modes
    beatmapsets = beatmapsets.filter(set =>
      set.modes.some(mode => selectedModes.has(mode))
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
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search beatmaps, artists, or mappers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-osu-pink focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Mode Filter */}
            <div className="flex gap-2">
              {[
                { mode: '0', name: 'osu!' },
                { mode: '1', name: 'Taiko' },
                { mode: '2', name: 'Catch' },
                { mode: '3', name: 'Mania' }
              ].map(({ mode, name }) => (
                <button
                  key={mode}
                  onClick={() => toggleMode(mode)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    selectedModes.has(mode)
                      ? 'bg-osu-pink text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{getModeIcon(mode)}</span>
                  <span>{name}</span>
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'artist' | 'title')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="date">Sort by Date</option>
              <option value="artist">Sort by Artist</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedBeatmapsets.length} beatmapsets
          </div>
        </div>

        {/* Beatmapsets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAndSortedBeatmapsets.map((beatmapset) => (
            <div
              key={beatmapset.beatmapset_id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Cover Image */}
              <div className="relative h-24 bg-gradient-to-r from-osu-pink to-osu-purple">
                <img
                  src={`https://assets.ppy.sh/beatmaps/${beatmapset.beatmapset_id}/covers/cover.jpg`}
                  alt={`${beatmapset.title} cover`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                
                {/* Mode indicators */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {beatmapset.modes.map(mode => (
                    <span
                      key={mode}
                      className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                      title={getModeName(mode)}
                    >
                      {getModeIcon(mode)}
                    </span>
                  ))}
                </div>

                {/* External link */}
                <a
                  href={`https://osu.ppy.sh/beatmapsets/${beatmapset.beatmapset_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded hover:bg-black/70 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">
                    {beatmapset.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 truncate">
                    by {beatmapset.artist}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(beatmapset.approved_date)}
                  </span>
                  <span>Mapped by {beatmapset.creator}</span>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {beatmapset.difficulties.length} {beatmapset.difficulties.length === 1 ? 'difficulty' : 'difficulties'}
                </div>

                {/* Difficulties list */}
                <div className="mt-3 space-y-1">
                  {beatmapset.difficulties
                    .filter(diff => selectedModes.has(diff.mode || '0'))
                    .slice(0, 3)
                    .map((difficulty, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{getModeIcon(difficulty.mode || '0')}</span>
                        <span className="truncate">{difficulty.version || 'Normal'}</span>
                        {difficulty.difficultyrating && (
                          <span className="text-osu-pink">★{parseFloat(difficulty.difficultyrating).toFixed(2)}</span>
                        )}
                      </div>
                    ))}
                  {beatmapset.difficulties.filter(diff => selectedModes.has(diff.mode || '0')).length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{beatmapset.difficulties.filter(diff => selectedModes.has(diff.mode || '0')).length - 3} more...
                    </div>
                  )}
                </div>
              </div>
            </div>
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
