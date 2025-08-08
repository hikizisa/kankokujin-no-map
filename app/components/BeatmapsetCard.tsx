import React, { useState } from 'react'
import { Calendar, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { Beatmapset, Difficulty } from './types'
import { getModeIcon, getModeName, getApprovedStatus, formatDate, formatNumber } from './utils'

interface BeatmapsetCardProps {
  beatmapset: Beatmapset
  selectedModes: Set<string>
  displayStyle?: 'card' | 'thumbnail' | 'minimal'
  showMapperName?: boolean
  className?: string
}

export const BeatmapsetCard: React.FC<BeatmapsetCardProps> = ({
  beatmapset,
  selectedModes,
  displayStyle = 'card',
  showMapperName = true,
  className = ''
}) => {
  const [showAllDifficulties, setShowAllDifficulties] = useState(false)
  // Filter difficulties based on selected modes
  const filteredDifficulties = beatmapset.difficulties.filter(diff => 
    selectedModes.has(diff.mode)
  )

  if (filteredDifficulties.length === 0) return null

  const status = getApprovedStatus(beatmapset.approved)
  
  // Calculate total stats for the beatmapset
  const totalPlaycount = filteredDifficulties.reduce((sum, diff) => {
    const beatmap = beatmapset.difficulties.find(d => d.beatmap_id === diff.beatmap_id)
    return sum + (beatmap ? parseInt((beatmap as any).playcount || '0') : 0)
  }, 0)
  
  const favoriteCount = filteredDifficulties.length > 0 ? 
    parseInt((filteredDifficulties[0] as any).favourite_count || '0') : 0

  // Minimal display style
  if (displayStyle === 'minimal') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded border-l-4 border-osu-pink p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded ${status.color}`}>
                {status.emoji} {status.text}
              </span>
              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {beatmapset.title}
              </h4>
              <span className="text-sm text-gray-500 dark:text-gray-400">by {beatmapset.artist}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              {showMapperName && <span>Mapped by {beatmapset.creator}</span>}
              <span>{formatDate(beatmapset.approved_date)}</span>
              <span>{filteredDifficulties.length} diffs</span>
              <span>❤️ {formatNumber(favoriteCount)}</span>
              <span>▶️ {formatNumber(totalPlaycount)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4">
            {Array.from(new Set(filteredDifficulties.map(d => d.mode))).map(mode => (
              <span key={mode} className="text-sm">{getModeIcon(mode)}</span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Thumbnail display style
  if (displayStyle === 'thumbnail') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
        <div className="flex gap-3 p-3">
          <div className="relative flex-shrink-0">
            <a
              href={`https://osu.ppy.sh/beatmapsets/${beatmapset.beatmapset_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={`https://assets.ppy.sh/beatmaps/${beatmapset.beatmapset_id}/covers/list.jpg`}
                alt={`${beatmapset.title} cover`}
                className="w-16 h-16 object-cover rounded"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </a>
            <div className="absolute -top-1 -left-1">
              <span className={`text-xs px-1 py-0.5 rounded ${status.color}`}>
                {status.emoji}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white truncate mb-1">
              {beatmapset.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
              by {beatmapset.artist}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-3">
                {showMapperName && <span>{beatmapset.creator}</span>}
                <span>{formatDate(beatmapset.approved_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>❤️ {formatNumber(favoriteCount)}</span>
                <span>▶️ {formatNumber(totalPlaycount)}</span>
                {Array.from(new Set(filteredDifficulties.map(d => d.mode))).map(mode => (
                  <span key={mode}>{getModeIcon(mode)}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Card display style (default)
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden ${className}`}>
      {/* Cover Image */}
      <div className="relative h-32 bg-gradient-to-r from-osu-pink to-purple-600">
        <a
          href={`https://osu.ppy.sh/beatmapsets/${beatmapset.beatmapset_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <img
            src={`https://assets.ppy.sh/beatmaps/${beatmapset.beatmapset_id}/covers/cover.jpg`}
            alt={`${beatmapset.title} cover`}
            className="w-full h-full object-cover hover:opacity-90 transition-opacity"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </a>
        
        {/* Status and Mode indicators */}
        <div className="absolute top-2 left-2 flex gap-1">
          <span className={`bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1 ${status.color}`}>
            {status.emoji} {status.text}
          </span>
        </div>
        
        <div className="absolute top-2 right-2 flex gap-1">
          {Array.from(new Set(filteredDifficulties.map(d => d.mode))).map(mode => (
            <span
              key={mode}
              className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
              title={getModeName(mode)}
            >
              {getModeIcon(mode)}
            </span>
          ))}
        </div>
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
          {showMapperName && (
            <span>Mapped by {beatmapset.creator}</span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>
            {filteredDifficulties.length} {filteredDifficulties.length === 1 ? 'difficulty' : 'difficulties'}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span>❤️</span>
              <span>{formatNumber(favoriteCount)}</span>
            </span>
            <span className="flex items-center gap-1">
              <span>▶️</span>
              <span>{formatNumber(totalPlaycount)}</span>
            </span>
          </div>
        </div>

        {/* Difficulties list */}
        <div className="mt-3 space-y-1">
          {(showAllDifficulties ? filteredDifficulties : filteredDifficulties.slice(0, 3)).map((difficulty, index) => (
            <div key={difficulty.beatmap_id} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{getModeIcon(difficulty.mode)}</span>
              <span className="truncate flex-1">{difficulty.version}</span>
              <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                ★{parseFloat(difficulty.difficultyrating).toFixed(1)}
              </span>
            </div>
          ))}
          {filteredDifficulties.length > 3 && (
            <button
              onClick={() => setShowAllDifficulties(!showAllDifficulties)}
              className="flex items-center gap-1 text-xs text-osu-pink hover:text-osu-purple transition-colors cursor-pointer"
            >
              {showAllDifficulties ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  +{filteredDifficulties.length - 3} more...
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
