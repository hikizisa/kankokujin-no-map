import { Mapper, BeatmapsetGroup } from './types'
import { constructBeatmapsetsFromBeatmaps } from './beatmapset-utils'
import { searchInMapper } from './utils'

/**
 * Filters mappers based on search term and mode/status filters
 * Only includes mappers that have beatmapsets matching the selected modes and statuses
 * 
 * @param mappers Array of mappers to filter
 * @param searchTerm Search term to filter by
 * @param selectedModes Set of selected game modes
 * @param selectedStatuses Set of selected beatmap statuses
 * @returns Filtered array of mappers
 */
export function filterMappers(
  mappers: Mapper[],
  searchTerm: string,
  selectedModes: Set<string>,
  selectedStatuses: Set<string>
): Mapper[] {
  // Filter mappers based on search term using shared utility
  let filtered = mappers.filter(mapper => searchInMapper(mapper, searchTerm))
  
  // Filter out mappers who have no beatmapsets matching the selected modes and statuses
  filtered = filtered.filter(mapper => {
    const matchingBeatmapsets = (mapper.beatmapsets || []).filter(set => {
      // Check if beatmapset status is selected
      const hasMatchingStatus = selectedStatuses.has(set.approved || '1')
      
      // Check if beatmapset has difficulties that match selected modes
      // We need to check the difficulties array, not just the modes array
      const hasMatchingMode = set.difficulties && set.difficulties.some(diff => 
        selectedModes.has(diff.mode)
      )
      
      // Fallback: if no difficulties array, check modes array
      const hasModeInArray = !hasMatchingMode && set.modes && set.modes.some(mode => 
        selectedModes.has(mode)
      )
      
      return hasMatchingStatus && (hasMatchingMode || hasModeInArray)
    })
    
    return matchingBeatmapsets.length > 0
  })
  
  return filtered
}

/**
 * Filters beatmapsets based on search term, modes, and statuses
 * 
 * @param beatmapsets Array of beatmapsets to filter
 * @param searchTerm Search term to filter by
 * @param selectedModes Set of selected game modes
 * @param selectedStatuses Set of selected beatmap statuses
 * @returns Filtered array of beatmapsets
 */
export function filterBeatmapsets(
  beatmapsets: BeatmapsetGroup[],
  searchTerm: string,
  selectedModes: Set<string>,
  selectedStatuses: Set<string>
): BeatmapsetGroup[] {
  let filtered = beatmapsets

  // Filter by search term
  if (searchTerm) {
    filtered = filtered.filter(set =>
      (set.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (set.artist || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (set.creator || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Filter by selected modes
  filtered = filtered.filter(set =>
    set.modes.some(mode => selectedModes.has(mode))
  )

  // Filter by selected statuses
  filtered = filtered.filter(set =>
    selectedStatuses.has(set.approved)
  )

  return filtered
}

/**
 * Collects all beatmapsets from all mappers by constructing them from individual beatmaps
 * 
 * @param mappers Array of mappers
 * @returns Array of all beatmapsets from all mappers
 */
export function getAllBeatmapsetsFromMappers(mappers: Mapper[]): BeatmapsetGroup[] {
  // Ensure mappers is an array before iterating
  if (!Array.isArray(mappers)) {
    return []
  }

  // Collect all beatmaps from all mappers
  const allBeatmaps: any[] = []
  mappers.forEach(mapper => {
    const beatmaps = mapper.beatmaps || []
    allBeatmaps.push(...beatmaps)
  })

  // Use shared utility to construct beatmapsets
  return constructBeatmapsetsFromBeatmaps(allBeatmaps)
}

/**
 * Calculates statistics for filtered mappers based on selected modes
 * 
 * @param filteredMappers Array of filtered mappers
 * @param selectedModes Set of selected game modes
 * @param totalStats Total stats from the data file
 * @returns Object containing calculated statistics
 */
export function calculateFilteredStats(
  filteredMappers: Mapper[],
  selectedModes: Set<string>,
  totalStats: any
) {
  const mapperCount = (() => {
    // Count mappers who have beatmaps matching the current mode filter
    if (selectedModes.size === 0) {
      return totalStats.totalMappers || filteredMappers.length
    }
    return filteredMappers.filter(mapper => 
      mapper.beatmaps?.some(beatmap => selectedModes.has(beatmap.mode || '0'))
    ).length
  })()

  const beatmapCount = (() => {
    if (selectedModes.size === 0) {
      return totalStats.totalBeatmaps || filteredMappers.reduce((total, mapper) => total + (mapper.rankedBeatmaps || mapper.beatmaps?.length || 0), 0)
    }
    return filteredMappers.reduce((total, mapper) => {
      const filteredBeatmaps = mapper.beatmaps?.filter(beatmap => selectedModes.has(beatmap.mode || '0')) || []
      return total + filteredBeatmaps.length
    }, 0)
  })()

  const beatmapsetCount = (() => {
    if (selectedModes.size === 0) {
      return totalStats.totalBeatmapsets || filteredMappers.reduce((total, mapper) => total + (mapper.rankedBeatmapsets || 0), 0)
    }
    // Count unique beatmapsets that have difficulties in selected modes
    const beatmapsetIds = new Set()
    filteredMappers.forEach(mapper => {
      mapper.beatmaps?.forEach(beatmap => {
        if (selectedModes.has(beatmap.mode || '0')) {
          beatmapsetIds.add(beatmap.beatmapset_id)
        }
      })
    })
    return beatmapsetIds.size
  })()

  return {
    mapperCount,
    beatmapCount,
    beatmapsetCount
  }
}

/**
 * Common toggle function for mode selection
 * 
 * @param mode Mode to toggle
 * @param selectedModes Current set of selected modes
 * @returns New set of selected modes
 */
export function toggleMode(mode: string, selectedModes: Set<string>): Set<string> {
  const newModes = new Set(selectedModes)
  if (newModes.has(mode)) {
    newModes.delete(mode)
  } else {
    newModes.add(mode)
  }
  return newModes
}

/**
 * Common toggle function for status selection
 * 
 * @param status Status to toggle
 * @param selectedStatuses Current set of selected statuses
 * @returns New set of selected statuses
 */
export function toggleStatus(status: string, selectedStatuses: Set<string>): Set<string> {
  const newStatuses = new Set(selectedStatuses)
  if (newStatuses.has(status)) {
    newStatuses.delete(status)
  } else {
    newStatuses.add(status)
  }
  return newStatuses
}
