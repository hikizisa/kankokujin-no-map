'use client'

import React, { useState, useEffect } from 'react'
import { Search, User, Calendar, Trophy, ExternalLink, Github } from 'lucide-react'

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
  const [showGuestDiffs, setShowGuestDiffs] = useState(true)
  const [sortBy, setSortBy] = useState<'beatmaps' | 'mapsets' | 'guestDiffs'>('mapsets')

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
      mapper.beatmaps.some(beatmap =>
        beatmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beatmap.artist.toLowerCase().includes(searchTerm.toLowerCase())
      )
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const formatNumber = (num: string) => {
    return parseInt(num).toLocaleString()
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
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Korean Mappers Map
            </h1>
            <h2 className="text-2xl font-medium text-gray-600 dark:text-gray-300 mb-4">
              한국인 매퍼 맵
            </h2>
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

        {/* View Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg mb-6">
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
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={showGuestDiffs}
                  onChange={(e) => setShowGuestDiffs(e.target.checked)}
                  className="rounded border-gray-300 text-osu-pink focus:ring-osu-pink"
                />
                Show Guest Difficulties
              </label>
              
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'beatmaps' | 'mapsets' | 'guestDiffs')}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-osu-pink focus:border-transparent"
              >
                <option value="mapsets">Beatmapsets</option>
                <option value="beatmaps">Total Beatmaps</option>
                <option value="guestDiffs">Guest Difficulties</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mappers List */}
        <div className="space-y-8">
          {filteredMappers.map((mapper) => (
            <div key={mapper.user_id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden card-hover">
              {/* Mapper Header */}
              <div className="bg-gradient-to-r from-osu-pink to-osu-purple p-6 text-white">
                <div className="flex items-center space-x-4">
                  <img
                    src={`https://a.ppy.sh/${mapper.user_id}`}
                    alt={mapper.username}
                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-avatar.png'
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-2xl font-bold">{mapper.username}</h3>
                      <a
                        href={`https://osu.ppy.sh/users/${mapper.user_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-gray-200 transition-colors"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span>🎵 {mapper.rankedBeatmaps || mapper.beatmaps?.length || 0} Beatmaps</span>
                      <span>📦 {mapper.rankedBeatmapsets || 0} Beatmapsets</span>
                      <span>🎯 {mapper.totalGuestDiffs || 0} Guest Diffs</span>
                      <span>🔧 {mapper.ownDifficulties || 0} Own Diffs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Beatmaps/Beatmapsets Display */}
              <div className="p-6">
                {viewMode === 'mapsets' ? (
                  // Beatmapsets View
                  <>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Beatmapsets ({(mapper.beatmapsets?.length || 0) + (showGuestDiffs && mapper.guestDifficulties ? mapper.guestDifficulties.reduce((acc, diff) => {
                        const setId = diff.beatmapset_id;
                        return acc.includes(setId) ? acc : [...acc, setId];
                      }, [] as string[]).length : 0)})
                    </h4>
                    <div className="grid gap-4">
                      {/* Own Beatmapsets */}
                      {mapper.beatmapsets?.map((beatmapset) => {
                        const status = getApprovedStatus(beatmapset.difficulties[0]?.mode || '1')
                        return (
                          <div key={beatmapset.beatmapset_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="px-2 py-1 rounded-full text-xs bg-blue-500 text-white">
                                    Own Mapset
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(beatmapset.approved_date)}
                                  </span>
                                </div>
                                <h5 className="font-semibold text-gray-800 dark:text-white">
                                  {beatmapset.artist} - {beatmapset.title}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {beatmapset.difficulties.length} difficulties
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  {beatmapset.difficulties.map((diff, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300">
                                      {diff.version} (★{parseFloat(diff.difficultyrating).toFixed(1)})
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <a
                                href={`https://osu.ppy.sh/beatmapsets/${beatmapset.beatmapset_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-4 text-osu-pink hover:text-osu-purple transition-colors"
                              >
                                <ExternalLink className="h-5 w-5" />
                              </a>
                            </div>
                          </div>
                        )
                      })}
                      
                      {/* Guest Difficulties (grouped by beatmapset) */}
                      {showGuestDiffs && mapper.guestDifficulties && (() => {
                        const guestMapsets = mapper.guestDifficulties.reduce((acc, diff) => {
                          const setId = diff.beatmapset_id;
                          if (!acc[setId]) {
                            acc[setId] = {
                              beatmapset_id: setId,
                              title: diff.title,
                              artist: diff.artist,
                              creator: diff.creator,
                              approved_date: diff.approved_date,
                              difficulties: []
                            };
                          }
                          acc[setId].difficulties.push(diff);
                          return acc;
                        }, {} as Record<string, any>);
                        
                        return Object.values(guestMapsets).map((guestSet: any) => (
                          <div key={guestSet.beatmapset_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="px-2 py-1 rounded-full text-xs bg-green-500 text-white">
                                    Guest Diffs
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Host: {guestSet.creator}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(guestSet.approved_date)}
                                  </span>
                                </div>
                                <h5 className="font-semibold text-gray-800 dark:text-white">
                                  {guestSet.artist} - {guestSet.title}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {guestSet.difficulties.length} guest {guestSet.difficulties.length === 1 ? 'difficulty' : 'difficulties'}
                                </p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  {guestSet.difficulties.map((diff: Beatmap, idx: number) => (
                                    <span key={idx} className="px-2 py-1 bg-green-100 dark:bg-green-800 rounded text-green-700 dark:text-green-300">
                                      {diff.version} (★{parseFloat(diff.difficultyrating).toFixed(1)})
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <a
                                href={`https://osu.ppy.sh/beatmapsets/${guestSet.beatmapset_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-4 text-osu-pink hover:text-osu-purple transition-colors"
                              >
                                <ExternalLink className="h-5 w-5" />
                              </a>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </>
                ) : (
                  // All Beatmaps View
                  <>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      All Beatmaps ({(mapper.beatmaps?.length || 0)})
                    </h4>
                    <div className="grid gap-4">
                      {mapper.beatmaps?.map((beatmap) => {
                        const status = getApprovedStatus(beatmap.approved)
                        const isGuest = beatmap.creator !== mapper.username
                        return (
                          <div key={beatmap.beatmap_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={`px-2 py-1 rounded-full text-xs text-white ${status.color}`}>
                                    {status.text}
                                  </span>
                                  {isGuest && (
                                    <span className="px-2 py-1 rounded-full text-xs bg-green-500 text-white">
                                      Guest Diff
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {formatDate(beatmap.approved_date)}
                                  </span>
                                  {isGuest && (
                                    <span className="text-xs text-gray-500">
                                      Host: {beatmap.creator}
                                    </span>
                                  )}
                                </div>
                                <h5 className="font-semibold text-gray-800 dark:text-white">
                                  {beatmap.artist} - {beatmap.title}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  [{beatmap.version}]
                                </p>
                                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                  <span>★ {parseFloat(beatmap.difficultyrating).toFixed(2)}</span>
                                  <span>▶ {formatNumber(beatmap.playcount)} plays</span>
                                  <span>♥ {formatNumber(beatmap.favourite_count)} favorites</span>
                                </div>
                              </div>
                              <a
                                href={`https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-4 text-osu-pink hover:text-osu-purple transition-colors"
                              >
                                <ExternalLink className="h-5 w-5" />
                              </a>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
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
