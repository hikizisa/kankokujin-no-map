'use client'

import { useState, useEffect } from 'react'
import { Search, User, Calendar, Trophy, ExternalLink, Github } from 'lucide-react'

interface Beatmap {
  beatmap_id: string
  beatmapset_id: string
  title: string
  artist: string
  version: string
  approved_date: string
  difficultyrating: string
  playcount: string
  favourite_count: string
  approved: string
}

interface Mapper {
  user_id: string
  username: string
  country: string
  pp_rank: string
  pp_raw: string
  join_date: string
  playcount: string
  beatmaps: Beatmap[]
}

export default function Home() {
  const [mappers, setMappers] = useState<Mapper[]>([])
  const [filteredMappers, setFilteredMappers] = useState<Mapper[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    // Load mapper data from JSON file
    fetch('/data/mappers.json')
      .then(res => res.json())
      .then(data => {
        setMappers(data.mappers || [])
        setFilteredMappers(data.mappers || [])
        setLastUpdated(data.lastUpdated || '')
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading mapper data:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = mappers.filter(mapper =>
        mapper.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapper.beatmaps.some(beatmap =>
          beatmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          beatmap.artist.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      setFilteredMappers(filtered)
    } else {
      setFilteredMappers(mappers)
    }
  }, [searchTerm, mappers])

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
            <User className="h-8 w-8 text-osu-pink mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {filteredMappers.length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Korean Mappers</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
            <Trophy className="h-8 w-8 text-osu-blue mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {filteredMappers.reduce((total, mapper) => total + mapper.beatmaps.length, 0)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Total Beatmaps</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
            <Calendar className="h-8 w-8 text-osu-purple mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              {new Date().getFullYear()}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Active Year</p>
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
                      <span>Rank: #{formatNumber(mapper.pp_rank)}</span>
                      <span>PP: {formatNumber(mapper.pp_raw)}</span>
                      <span>Joined: {formatDate(mapper.join_date)}</span>
                      <span>Playcount: {formatNumber(mapper.playcount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Beatmaps */}
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Ranked Beatmaps ({mapper.beatmaps.length})
                </h4>
                <div className="grid gap-4">
                  {mapper.beatmaps.map((beatmap) => {
                    const status = getApprovedStatus(beatmap.approved)
                    return (
                      <div key={beatmap.beatmap_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs text-white ${status.color}`}>
                                {status.text}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(beatmap.approved_date)}
                              </span>
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
