import { Mapper, BeatmapsetGroup, Beatmapset, SortOption, MapperSortOption } from './types'

/**
 * Check if a mapper has a recently ranked map (within last 30 days)
 * @param mapper Mapper object
 * @returns boolean indicating if mapper has recent ranked map
 */
export const hasRecentRankedMap = (mapper: Mapper): boolean => {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  
  const mostRecentDate = mapper.mostRecentRankedDate
  if (!mostRecentDate) return false
  
  const recentDate = new Date(mostRecentDate)
  return recentDate > oneMonthAgo
}

/**
 * Sort beatmapsets within a mapper by favorite count or playcount
 * @param beatmapsets Array of beatmapsets (BeatmapsetGroup)
 * @param sortBy Sort criteria ('favorite' or 'playcount')
 * @returns Sorted array of beatmapsets
 */
export const sortMapperBeatmapsets = (beatmapsets: BeatmapsetGroup[], sortBy: 'favorite' | 'playcount' | 'date'): BeatmapsetGroup[] => {
  return [...beatmapsets].sort((a, b) => {
    switch (sortBy) {
      case 'favorite':
        const aFav = parseInt(a.favourite_count || '0')
        const bFav = parseInt(b.favourite_count || '0')
        return bFav - aFav
      case 'playcount':
        const aPlay = parseInt(a.playcount || '0')
        const bPlay = parseInt(b.playcount || '0')
        return bPlay - aPlay
      case 'date':
      default:
        return new Date(b.approved_date).getTime() - new Date(a.approved_date).getTime()
    }
  })
}

/**
 * Sort beatmapsets within a mapper by favorite count or playcount (for Beatmapset type)
 * @param beatmapsets Array of beatmapsets (Beatmapset)
 * @param sortBy Sort criteria ('favorite' or 'playcount')
 * @returns Sorted array of beatmapsets
 */
export const sortMapperBeatmapsetsV2 = (beatmapsets: Beatmapset[], sortBy: 'favorite' | 'playcount' | 'date'): Beatmapset[] => {
  return [...beatmapsets].sort((a, b) => {
    switch (sortBy) {
      case 'favorite':
        const aFav = parseInt(a.favourite_count || '0')
        const bFav = parseInt(b.favourite_count || '0')
        return bFav - aFav
      case 'playcount':
        const aPlay = parseInt(a.playcount || '0')
        const bPlay = parseInt(b.playcount || '0')
        return bPlay - aPlay
      case 'date':
      default:
        return new Date(b.approved_date).getTime() - new Date(a.approved_date).getTime()
    }
  })
}

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
        const aFav = parseInt(a.favourite_count || '0')
        const bFav = parseInt(b.favourite_count || '0')
        return bFav - aFav
      case 'playcount':
        const aPlay = parseInt(a.playcount || '0')
        const bPlay = parseInt(b.playcount || '0')
        return bPlay - aPlay
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
