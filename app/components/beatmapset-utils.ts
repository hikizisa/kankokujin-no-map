import { BeatmapsetGroup } from './types'

/**
 * Constructs beatmapsets from individual beatmaps by grouping them by beatmapset_id
 * and properly aggregating playcount and favourite_count values.
 * 
 * @param beatmaps Array of individual beatmap objects
 * @returns Array of constructed BeatmapsetGroup objects
 */
export function constructBeatmapsetsFromBeatmaps(beatmaps: any[]): BeatmapsetGroup[] {
  const beatmapsetGroups = new Map<string, BeatmapsetGroup>()
  
  beatmaps.forEach(beatmap => {
    const setId = beatmap.beatmapset_id
    
    if (!beatmapsetGroups.has(setId)) {
      // Create new beatmapset group
      beatmapsetGroups.set(setId, {
        beatmapset_id: setId,
        title: beatmap.title,
        artist: beatmap.artist,
        creator: beatmap.creator,
        approved_date: beatmap.approved_date,
        approved: beatmap.approved,
        favourite_count: beatmap.favourite_count, // Use first beatmap's favorite count (same for all diffs in set)
        playcount: '0', // Will be summed from all difficulties as string
        modes: [],
        difficulties: [],
        isOwnMapset: true
      })
    }
    
    const beatmapset = beatmapsetGroups.get(setId)!
    
    // Add mode if not already present
    if (!beatmapset.modes.includes(beatmap.mode)) {
      beatmapset.modes.push(beatmap.mode)
    }
    
    // Add difficulty with proper playcount and favourite_count
    beatmapset.difficulties.push({
      beatmap_id: beatmap.beatmap_id,
      version: beatmap.version,
      difficultyrating: beatmap.difficultyrating,
      mode: beatmap.mode,
      playcount: beatmap.playcount,
      favourite_count: beatmap.favourite_count
    })
    
    // Sum playcount from all difficulties in the set
    const currentPlaycount = parseInt(beatmapset.playcount || '0')
    const additionalPlaycount = parseInt(beatmap.playcount || '0')
    beatmapset.playcount = (currentPlaycount + additionalPlaycount).toString()
  })
  
  return Array.from(beatmapsetGroups.values())
}

/**
 * Processes mapper data to construct beatmapsets and calculate most recent ranked date
 * 
 * @param mapper Raw mapper data from JSON
 * @returns Processed mapper with constructed beatmapsets
 */
export function processMapperData(mapper: any) {
  let beatmapsets: BeatmapsetGroup[] = []
  
  // Always construct beatmapsets from individual beatmaps to ensure proper playcount/favourite_count
  if (mapper.beatmaps && mapper.beatmaps.length > 0) {
    beatmapsets = constructBeatmapsetsFromBeatmaps(mapper.beatmaps)
  }
  
  return {
    ...mapper,
    beatmapsets,
    mostRecentRankedDate: calculateMostRecentRankedDate(mapper),
    aliases: mapper.aliases || [] // Ensure aliases array exists
  }
}

/**
 * Calculate the most recent ranked date for a mapper
 * 
 * @param mapper Mapper data
 * @returns Most recent ranked date as string
 */
function calculateMostRecentRankedDate(mapper: any): string {
  if (!mapper.beatmaps || mapper.beatmaps.length === 0) {
    return ''
  }
  
  const rankedBeatmaps = mapper.beatmaps.filter((beatmap: any) => 
    beatmap.approved === '1' || beatmap.approved === '4' // ranked or loved
  )
  
  if (rankedBeatmaps.length === 0) {
    return ''
  }
  
  const mostRecent = rankedBeatmaps.reduce((latest: any, current: any) => {
    const currentDate = new Date(current.approved_date)
    const latestDate = new Date(latest.approved_date)
    return currentDate > latestDate ? current : latest
  })
  
  return mostRecent.approved_date
}
