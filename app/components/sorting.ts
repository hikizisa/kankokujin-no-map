import { Mapper, BeatmapsetGroup, SortOption, MapperSortOption } from './types'

export const sortMappers = (mappers: Mapper[], sortBy: MapperSortOption): Mapper[] => {
  return [...mappers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.username.localeCompare(b.username)
      case 'beatmaps':
        return (b.rankedBeatmaps || 0) - (a.rankedBeatmaps || 0)
      case 'mapsets':
        return (b.rankedBeatmapsets || 0) - (a.rankedBeatmapsets || 0)
      case 'recent':
        // Sort by most recently ranked beatmapset
        const aRecentDate = a.mostRecentRankedDate || a.beatmapsets[0]?.approved_date || '1970-01-01'
        const bRecentDate = b.mostRecentRankedDate || b.beatmapsets[0]?.approved_date || '1970-01-01'
        return new Date(bRecentDate).getTime() - new Date(aRecentDate).getTime()
      default:
        return (b.rankedBeatmapsets || 0) - (a.rankedBeatmapsets || 0)
    }
  })
}

export const sortBeatmapsets = (beatmapsets: BeatmapsetGroup[], sortBy: SortOption): BeatmapsetGroup[] => {
  return [...beatmapsets].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.approved_date).getTime() - new Date(a.approved_date).getTime()
      case 'artist':
        return a.artist.localeCompare(b.artist)
      case 'title':
        return a.title.localeCompare(b.title)
      case 'favorite':
        return b.favourite_count - a.favourite_count
      case 'playcount':
        return b.total_playcount - a.total_playcount
      default:
        return new Date(b.approved_date).getTime() - new Date(a.approved_date).getTime()
    }
  })
}

export const filterBeatmapsetsByModes = (
  beatmapsets: BeatmapsetGroup[], 
  selectedModes: Set<string>
): BeatmapsetGroup[] => {
  return beatmapsets.filter(beatmapset => 
    beatmapset.modes.some(mode => selectedModes.has(mode))
  )
}

export const calculateMostRecentRankedDate = (mapper: Mapper): string => {
  if (!mapper.beatmapsets || mapper.beatmapsets.length === 0) {
    return '1970-01-01'
  }
  
  const sortedByDate = mapper.beatmapsets
    .filter(beatmapset => beatmapset.approved_date)
    .sort((a, b) => new Date(b.approved_date).getTime() - new Date(a.approved_date).getTime())
  
  return sortedByDate.length > 0 ? sortedByDate[0].approved_date : '1970-01-01'
}
