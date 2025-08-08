import { Mapper, BeatmapsetGroup, Beatmapset, SortOption, MapperSortOption } from './types'

/**
 * Check if a mapper has a recently ranked map (within last 30 days)
 * @param mapper Mapper object
 * @param selectedModes Optional mode filter
 * @param selectedStatuses Optional status filter
 * @returns boolean indicating if mapper has recent ranked map
 */
export const hasRecentRankedMap = (
  mapper: Mapper,
  selectedModes?: Set<string>,
  selectedStatuses?: Set<string>
): boolean => {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  
  // Use filtered recent date calculation
  const mostRecentDate = calculateMostRecentRankedDateFiltered(mapper, selectedModes, selectedStatuses)
  if (!mostRecentDate || mostRecentDate === '1970-01-01') return false
  
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

export const sortMappers = (
  mappers: Mapper[], 
  sortBy: MapperSortOption,
  selectedModes?: Set<string>,
  selectedStatuses?: Set<string>
): Mapper[] => {
  return [...mappers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.username.localeCompare(b.username)
      case 'beatmaps':
        const aFilteredBeatmaps = getFilteredBeatmapCount(a, selectedModes, selectedStatuses)
        const bFilteredBeatmaps = getFilteredBeatmapCount(b, selectedModes, selectedStatuses)
        return bFilteredBeatmaps - aFilteredBeatmaps
      case 'mapsets':
        const aFilteredMapsets = getFilteredBeatmapsetCount(a, selectedModes, selectedStatuses)
        const bFilteredMapsets = getFilteredBeatmapsetCount(b, selectedModes, selectedStatuses)
        return bFilteredMapsets - aFilteredMapsets
      case 'recent':
        // Sort by most recently ranked beatmapset (considering filters)
        const aRecentDate = calculateMostRecentRankedDateFiltered(a, selectedModes, selectedStatuses)
        const bRecentDate = calculateMostRecentRankedDateFiltered(b, selectedModes, selectedStatuses)
        return new Date(bRecentDate).getTime() - new Date(aRecentDate).getTime()
      default:
        const aDefaultMapsets = getFilteredBeatmapsetCount(a, selectedModes, selectedStatuses)
        const bDefaultMapsets = getFilteredBeatmapsetCount(b, selectedModes, selectedStatuses)
        return bDefaultMapsets - aDefaultMapsets
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

/**
 * Calculate most recent ranked date considering only beatmapsets matching filters
 */
export const calculateMostRecentRankedDateFiltered = (
  mapper: Mapper,
  selectedModes?: Set<string>,
  selectedStatuses?: Set<string>
): string => {
  if (!mapper.beatmapsets || mapper.beatmapsets.length === 0) {
    return '1970-01-01'
  }
  
  let filteredBeatmapsets = mapper.beatmapsets.filter(beatmapset => beatmapset.approved_date)
  
  // Apply status filter if provided
  if (selectedStatuses && selectedStatuses.size > 0) {
    filteredBeatmapsets = filteredBeatmapsets.filter(beatmapset => 
      selectedStatuses.has(beatmapset.approved.toString())
    )
  }
  
  // Apply mode filter if provided
  if (selectedModes && selectedModes.size > 0) {
    filteredBeatmapsets = filteredBeatmapsets.filter(beatmapset => {
      // Check difficulties array first
      const hasMatchingMode = beatmapset.difficulties && beatmapset.difficulties.some(diff => 
        selectedModes.has(diff.mode)
      )
      
      // Fallback: check modes array
      const hasModeInArray = !hasMatchingMode && beatmapset.modes && beatmapset.modes.some(mode => 
        selectedModes.has(mode)
      )
      
      return hasMatchingMode || hasModeInArray
    })
  }
  
  const sortedByDate = filteredBeatmapsets
    .sort((a, b) => new Date(b.approved_date).getTime() - new Date(a.approved_date).getTime())
  
  return sortedByDate.length > 0 ? sortedByDate[0].approved_date : '1970-01-01'
}

/**
 * Get count of beatmaps matching current filters
 */
export const getFilteredBeatmapCount = (
  mapper: Mapper,
  selectedModes?: Set<string>,
  selectedStatuses?: Set<string>
): number => {
  if (!mapper.beatmaps || mapper.beatmaps.length === 0) {
    return 0
  }
  
  let filteredBeatmaps = mapper.beatmaps
  
  // Apply status filter if provided
  if (selectedStatuses && selectedStatuses.size > 0) {
    filteredBeatmaps = filteredBeatmaps.filter(beatmap => 
      selectedStatuses.has(beatmap.approved.toString())
    )
  }
  
  // Apply mode filter if provided
  if (selectedModes && selectedModes.size > 0) {
    filteredBeatmaps = filteredBeatmaps.filter(beatmap => 
      selectedModes.has(beatmap.mode)
    )
  }
  
  return filteredBeatmaps.length
}

/**
 * Get count of beatmapsets matching current filters
 */
export const getFilteredBeatmapsetCount = (
  mapper: Mapper,
  selectedModes?: Set<string>,
  selectedStatuses?: Set<string>
): number => {
  if (!mapper.beatmapsets || mapper.beatmapsets.length === 0) {
    return 0
  }
  
  let filteredBeatmapsets = mapper.beatmapsets
  
  // Apply status filter if provided
  if (selectedStatuses && selectedStatuses.size > 0) {
    filteredBeatmapsets = filteredBeatmapsets.filter(beatmapset => 
      selectedStatuses.has(beatmapset.approved.toString())
    )
  }
  
  // Apply mode filter if provided
  if (selectedModes && selectedModes.size > 0) {
    filteredBeatmapsets = filteredBeatmapsets.filter(beatmapset => {
      // Check difficulties array first
      const hasMatchingMode = beatmapset.difficulties && beatmapset.difficulties.some(diff => 
        selectedModes.has(diff.mode)
      )
      
      // Fallback: check modes array
      const hasModeInArray = !hasMatchingMode && beatmapset.modes && beatmapset.modes.some(mode => 
        selectedModes.has(mode)
      )
      
      return hasMatchingMode || hasModeInArray
    })
  }
  
  return filteredBeatmapsets.length
}
