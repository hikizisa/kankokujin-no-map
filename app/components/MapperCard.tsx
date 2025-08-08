import React from 'react'
import { User, ChevronDown, ChevronUp } from 'lucide-react'
import { Mapper } from './types'
import { BeatmapsetCard } from './BeatmapsetCard'
import { formatNumber } from './utils'

interface MapperCardProps {
  mapper: Mapper
  selectedModes: Set<string>
  selectedStatuses?: Set<string>
  displayStyle?: 'card' | 'thumbnail' | 'minimal'
  isExpanded: boolean
  onToggle: (mapperId: string) => void
  viewMode: 'beatmaps' | 'mapsets'
  beatmapSortBy: 'date' | 'artist' | 'title'
}

export const MapperCard: React.FC<MapperCardProps> = ({
  mapper,
  selectedModes,
  selectedStatuses = new Set(['1', '4']),
  displayStyle = 'card',
  isExpanded,
  onToggle,
  viewMode,
  beatmapSortBy
}) => {
  // Filter beatmapsets based on selected modes and statuses
  const filteredBeatmapsets = mapper.beatmapsets.filter(set =>
    (set.modes && set.modes.some(mode => selectedModes.has(mode))) &&
    selectedStatuses.has(set.approved)
  )

  // Filter beatmaps based on selected modes
  const filteredBeatmaps = mapper.beatmaps.filter(beatmap => 
    selectedModes.has(beatmap.mode || '0')
  )

  // Sort beatmaps based on selected criteria
  const sortedBeatmaps = [...filteredBeatmaps].sort((a, b) => {
    switch (beatmapSortBy) {
      case 'date':
        return new Date(b.approved_date).getTime() - new Date(a.approved_date).getTime()
      case 'artist':
        return a.artist.localeCompare(b.artist)
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return new Date(b.approved_date).getTime() - new Date(a.approved_date).getTime()
    }
  })

  // Sort beatmapsets based on selected criteria  
  const sortedBeatmapsets = [...filteredBeatmapsets].sort((a, b) => {
    switch (beatmapSortBy) {
      case 'date':
        return new Date(b.approved_date).getTime() - new Date(a.approved_date).getTime()
      case 'artist':
        return a.artist.localeCompare(b.artist)
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return new Date(b.approved_date).getTime() - new Date(a.approved_date).getTime()
    }
  })

  const displayName = mapper.username
  const aliases = mapper.aliases && mapper.aliases.length > 0 ? mapper.aliases : []

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
      <div 
        className="p-6 cursor-pointer"
        onClick={() => onToggle(mapper.user_id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={`https://a.ppy.sh/${mapper.user_id}`}
              alt={`${mapper.username} avatar`}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="w-12 h-12 bg-gradient-to-r from-osu-pink to-purple-600 rounded-full flex items-center justify-center hidden">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {displayName}
              </h3>
              {aliases.length > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Also known as: {aliases.join(', ')}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-osu-pink">
                {formatNumber(filteredBeatmapsets.length)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Beatmapsets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(filteredBeatmaps.length)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Beatmaps</div>
            </div>
            <div className="ml-4">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          {viewMode === 'mapsets' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedBeatmapsets.map(beatmapset => (
                <BeatmapsetCard
                  key={beatmapset.beatmapset_id}
                  beatmapset={beatmapset}
                  selectedModes={selectedModes}
                  displayStyle={displayStyle}
                  showMapperName={false}
                  className="h-full"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedBeatmaps.map(beatmap => (
                <div key={beatmap.beatmap_id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        {beatmap.artist} - {beatmap.title} [{beatmap.version}]
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span>★{parseFloat(beatmap.difficultyrating).toFixed(1)}</span>
                        <span>❤️ {formatNumber(beatmap.favourite_count)}</span>
                        <span>▶️ {formatNumber(beatmap.playcount)}</span>
                      </div>
                    </div>
                    <a
                      href={`https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 text-osu-pink hover:text-osu-pink-dark transition-colors"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
