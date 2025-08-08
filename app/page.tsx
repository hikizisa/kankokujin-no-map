'use client'

import React, { useState, useEffect } from 'react'
import { Search, User, Calendar, Trophy, ExternalLink, Github, ChevronDown, ChevronUp } from 'lucide-react'

interface Beatmap {
  beatmap_id: string
  beatmapset_id: string
  title: string
  artist: string
  version: string
  creator: string
  approved_date: string
  difficultyrating: string
  playcount: string
  favourite_count: string
  approved: string
  mode?: string
  isGuestDiff?: boolean
  hostMapper?: string
}

interface Difficulty {
  beatmap_id: string
  version: string
  difficultyrating: string
  mode: string
  isGuestDiff: boolean
}

interface Beatmapset {
  beatmapset_id: string
  title: string
  artist: string
  creator: string
  approved_date: string
  difficulties: Difficulty[]
  isOwnMapset: boolean
}

interface MapperStats {
  totalBeatmaps: number
  totalBeatmapsets: number
  ownBeatmapsets: number
  guestBeatmapsets: number
  totalGuestDiffs: number
  ownDifficulties: number
}

interface Mapper {
  user_id: string
  username: string
  country: string
  rankedBeatmaps: number
  rankedBeatmapsets: number
  ownBeatmapsets: number
  guestBeatmapsets: number
  totalGuestDiffs: number
  ownDifficulties: number
  beatmaps: Beatmap[]
  beatmapsets: Beatmapset[]
  guestDifficulties: Beatmap[]
  stats: MapperStats
  lastUpdated: string
}

export default function Home() {
  const [mappers, setMappers] = useState<Mapper[]>([])
  const [filteredMappers, setFilteredMappers] = useState<Mapper[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [totalStats, setTotalStats] = useState<any>({})
  const [viewMode, setViewMode] = useState<'beatmaps' | 'mapsets'>('mapsets')
  const [showGuestDiffs, setShowGuestDiffs] = useState(false)
  const [sortBy, setSortBy] = useState<'beatmaps' | 'mapsets' | 'guestDiffs'>('mapsets')
  const [mapperSortBy, setMapperSortBy] = useState<'name' | 'beatmaps' | 'mapsets'>('name')
  const [beatmapSortBy, setBeatmapSortBy] = useState<'date' | 'artist' | 'title'>('date')
  const [selectedModes, setSelectedModes] = useState<Set<string>>(new Set(['0', '1', '2', '3']))
  const [expandedMappers, setExpandedMappers] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load mapper data from JSON file
    fetch('/data/mappers.json')
      .then(res => res.json())
      .then(data => {
        setMappers(data.mappers || [])
        setFilteredMappers(data.mappers || [])
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
    // Filter and sort mappers based on search term and sort criteria
    let filtered = mappers.filter(mapper =>
      mapper.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mapper.beatmaps && mapper.beatmaps.some(beatmap =>
        beatmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beatmap.artist.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    )
    
    // Sort mappers based on selected criteria
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'beatmaps':
          return (b.rankedBeatmaps || 0) - (a.rankedBeatmaps || 0)
        case 'mapsets':
          return (b.rankedBeatmapsets || 0) - (a.rankedBeatmapsets || 0)
        case 'guestDiffs':
          return (b.totalGuestDiffs || 0) - (a.totalGuestDiffs || 0)
        default:
          return (b.rankedBeatmapsets || 0) - (a.rankedBeatmapsets || 0)
      }
    })
    
    setFilteredMappers(filtered)
  }, [searchTerm, mappers, sortBy])

  const getApprovedStatus = (approved: string) => {
    switch (approved) {
      case '4': return { text: 'Loved', color: 'bg-pink-500' }
      case '3': return { text: 'Qualified', color: 'bg-blue-500' }
      case '2': return { text: 'Approved', color: 'bg-green-500' }
      case '1': return { text: 'Ranked', color: 'bg-yellow-500' }
      default: return { text: 'Unknown', color: 'bg-gray-500' }
    }
  }

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseInt(num) : num
    return n.toLocaleString()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

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
      case '2': return 'Catch'
      case '3': return 'Mania'
      default: return 'Unknown'
    }
  }

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
                className="px-6 py-3 bg-osu-pink text-white rounded-lg hover:bg-osu-purple transition-colors font-medium flex items-center gap-2"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-osu-pink focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
            <User className="h-6 w-6 text-osu-pink mx-auto mb-2" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {totalStats.totalMappers || filteredMappers.length}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Korean Mappers</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
            <Trophy className="h-6 w-6 text-osu-blue mx-auto mb-2" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {totalStats.totalBeatmaps || filteredMappers.reduce((total, mapper) => total + (mapper.rankedBeatmaps || mapper.beatmaps?.length || 0), 0)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Beatmaps</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
            <div className="h-6 w-6 text-osu-purple mx-auto mb-2 flex items-center justify-center font-bold text-lg">📦</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {totalStats.totalBeatmapsets || filteredMappers.reduce((total, mapper) => total + (mapper.rankedBeatmapsets || 0), 0)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Beatmapsets</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg text-center">
            <div className="h-6 w-6 text-osu-green mx-auto mb-2 flex items-center justify-center font-bold text-lg">🎯</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {totalStats.totalGuestDiffs || filteredMappers.reduce((total, mapper) => total + (mapper.totalGuestDiffs || 0), 0)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Guest Difficulties</p>
          </div>
        </div>

        {/* Controls - Sticky */}
        <div className="sticky top-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">View Mode:</label>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('mapsets')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'mapsets'
                      ? 'bg-osu-pink text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                  }`}
                >
                  Beatmapsets
                </button>
                <button
                  onClick={() => setViewMode('beatmaps')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'beatmaps'
                      ? 'bg-osu-pink text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white'
                  }`}
                >
                  All Beatmaps
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Mapper Sort */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort mappers:</label>
                <select
                  value={mapperSortBy}
                  onChange={(e) => setMapperSortBy(e.target.value as 'name' | 'beatmaps' | 'mapsets')}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-osu-pink focus:border-transparent"
                >
                  <option value="name">Name</option>
                  <option value="mapsets">Beatmapsets</option>
                  <option value="beatmaps">Total Beatmaps</option>
                </select>
              </div>

              {/* Beatmap Sort */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort beatmaps:</label>
                <select
                  value={beatmapSortBy}
                  onChange={(e) => setBeatmapSortBy(e.target.value as 'date' | 'artist' | 'title')}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-osu-pink focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="artist">Artist</option>
                  <option value="title">Title</option>
                </select>
              </div>

              {/* Game Mode Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Modes:</label>
                <div className="flex gap-1">
                  {['0', '1', '2', '3'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => toggleMode(mode)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        selectedModes.has(mode)
                          ? 'bg-osu-pink text-white'
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
          </div>
        </div>

        {/* Mappers List */}
        <div className="space-y-8">
          {(() => {
            // Filter and sort mappers
            let processedMappers = mappers.filter(mapper => {
              // Search filter
              if (searchTerm) {
                const searchLower = searchTerm.toLowerCase()
                const matchesMapper = mapper.username.toLowerCase().includes(searchLower)
                const matchesBeatmap = mapper.beatmaps?.some(beatmap => 
                  beatmap.title.toLowerCase().includes(searchLower) ||
                  beatmap.artist.toLowerCase().includes(searchLower)
                ) || false
                if (!matchesMapper && !matchesBeatmap) return false
              }
              
              // Mode filter - check if mapper has beatmaps in selected modes
              if (selectedModes.size < 4) {
                const hasSelectedMode = mapper.beatmaps?.some(beatmap => 
                  selectedModes.has(beatmap.mode || '0')
                ) || false
                if (!hasSelectedMode) return false
              }
              
              return true
            })
            
            // Sort mappers
            processedMappers.sort((a, b) => {
              switch (mapperSortBy) {
                case 'name':
                  return a.username.localeCompare(b.username)
                case 'beatmaps':
                  return (b.rankedBeatmaps || b.beatmaps?.length || 0) - (a.rankedBeatmaps || a.beatmaps?.length || 0)
                case 'mapsets':
                  return (b.rankedBeatmapsets || 0) - (a.rankedBeatmapsets || 0)
                default:
                  return 0
              }
            })
            
            return processedMappers
          })().map((mapper) => (
            <div key={mapper.user_id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden card-hover">
              {/* Mapper Header */}
              <div className="bg-gradient-to-r from-osu-pink to-osu-purple p-6 text-white">
                <div className="flex items-center space-x-3">
                  <img
                    src={`https://a.ppy.sh/${mapper.user_id}`}
                    alt={`${mapper.username} avatar`}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">
                        {mapper.username}
                      </h3>
                      {/* Mode icons for mapped modes */}
                      <div className="flex gap-1">
                        {(() => {
                          const mappedModes = new Set<string>()
                          mapper.beatmaps?.forEach(beatmap => {
                            mappedModes.add(beatmap.mode || '0')
                          })
                          return Array.from(mappedModes).sort().map(mode => (
                            <span key={mode} className="text-sm" title={getModeName(mode)}>
                              {getModeIcon(mode)}
                            </span>
                          ))
                        })()}
                      </div>
                    </div>
                    <p className="text-sm text-white/80">
                      User ID: {mapper.user_id}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-white/20 text-white rounded-full text-xs">
                        🎵 {mapper.rankedBeatmaps} Ranked
                      </span>
                      <span className="px-2 py-1 bg-white/20 text-white rounded-full text-xs">
                        📦 {mapper.rankedBeatmapsets} Sets
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://osu.ppy.sh/users/${mapper.user_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                    <button
                      onClick={() => toggleMapper(mapper.user_id)}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                    >
                      {expandedMappers.has(mapper.user_id) ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Show
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Beatmaps/Beatmapsets Display - Only show when expanded */}
              {expandedMappers.has(mapper.user_id) && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  {(() => {
                    // Group beatmaps by beatmapset_id and filter by selected modes
                    const beatmapsBySet = new Map<string, {
                      beatmapset_id: string
                      title: string
                      artist: string
                      approved_date: string
                      beatmaps: Beatmap[]
                      modes: Set<string>
                    }>()
                    
                    mapper.beatmaps?.forEach(beatmap => {
                      const setId = beatmap.beatmapset_id
                      if (!beatmapsBySet.has(setId)) {
                        beatmapsBySet.set(setId, {
                          beatmapset_id: setId,
                          title: beatmap.title,
                          artist: beatmap.artist,
                          approved_date: beatmap.approved_date,
                          beatmaps: [],
                          modes: new Set()
                        })
                      }
                      const setData = beatmapsBySet.get(setId)!
                      setData.beatmaps.push(beatmap)
                      setData.modes.add(beatmap.mode || '0')
                    })
                    
                    // Filter beatmapsets that have at least one difficulty in selected modes
                    let filteredBeatmapsets = Array.from(beatmapsBySet.values()).filter(beatmapset => {
                      return Array.from(beatmapset.modes).some(mode => selectedModes.has(mode))
                    })
                    
                    // Sort beatmapsets
                    filteredBeatmapsets.sort((a, b) => {
                      switch (beatmapSortBy) {
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
                    
                    const totalBeatmaps = filteredBeatmapsets.reduce((sum, set) => 
                      sum + set.beatmaps.filter(b => selectedModes.has(b.mode || '0')).length, 0
                    )
                    
                    return (
                      <>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                          Beatmapsets ({filteredBeatmapsets.length}) • {totalBeatmaps} difficulties
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredBeatmapsets.map((beatmapset) => {
                            // Filter difficulties by selected modes
                            const filteredDifficulties = beatmapset.beatmaps.filter(beatmap => 
                              selectedModes.has(beatmap.mode || '0')
                            )
                            
                            return (
                              <div key={beatmapset.beatmapset_id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                {/* Cover Image and Header */}
                                <div className="relative">
                                  <img
                                    src={`https://assets.ppy.sh/beatmaps/${beatmapset.beatmapset_id}/covers/cover.jpg`}
                                    alt={`${beatmapset.artist} - ${beatmapset.title}`}
                                    className="w-full h-24 object-cover"
                                    onError={(e) => {
                                      // Fallback to a solid color background if image fails to load
                                      const target = e.target as HTMLImageElement
                                      target.style.display = 'none'
                                      target.nextElementSibling?.classList.remove('hidden')
                                    }}
                                  />
                                  {/* Fallback background */}
                                  <div className="hidden absolute inset-0 bg-gradient-to-br from-osu-pink to-osu-purple opacity-20"></div>
                                  
                                  {/* Mode indicators overlay */}
                                  <div className="absolute top-2 left-2 flex gap-1">
                                    {Array.from(beatmapset.modes).map(mode => (
                                      <span key={mode} className="text-white text-lg drop-shadow-lg" title={getModeName(mode)}>
                                        {getModeIcon(mode)}
                                      </span>
                                    ))}
                                  </div>
                                  
                                  {/* External link */}
                                  <a
                                    href={`https://osu.ppy.sh/beatmapsets/${beatmapset.beatmapset_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-2 right-2 text-white hover:text-osu-pink transition-colors drop-shadow-lg"
                                  >
                                    <ExternalLink className="h-5 w-5" />
                                  </a>
                                </div>
                                
                                {/* Content */}
                                <div className="p-3">
                                  <div className="mb-2">
                                    <h5 className="font-medium text-gray-800 dark:text-white text-sm truncate" title={`${beatmapset.artist} - ${beatmapset.title}`}>
                                      {beatmapset.artist} - {beatmapset.title}
                                    </h5>
                                    <p className="text-xs text-gray-500">
                                      {formatDate(beatmapset.approved_date)} • {filteredDifficulties.length} difficulties
                                    </p>
                                  </div>
                                  
                                  {/* Difficulties */}
                                  <div className="space-y-1">
                                    {filteredDifficulties.map((beatmap) => (
                                      <div key={beatmap.beatmap_id} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <span className="text-sm" title={getModeName(beatmap.mode || '0')}>
                                            {getModeIcon(beatmap.mode || '0')}
                                          </span>
                                          <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                                            ★{parseFloat(beatmap.difficultyrating).toFixed(1)}
                                          </span>
                                          <span className="truncate text-gray-700 dark:text-gray-300" title={beatmap.version}>
                                            {beatmap.version}
                                          </span>
                                        </div>
                                        <div className="flex gap-2 text-gray-500 flex-shrink-0">
                                          <span>▶{formatNumber(beatmap.playcount)}</span>
                                          <span>♥{formatNumber(beatmap.favourite_count)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
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
