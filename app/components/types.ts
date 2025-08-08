// Shared type definitions for the Korean Mapper's Map application

export interface Beatmap {
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

export interface Difficulty {
  beatmap_id: string
  version: string
  difficultyrating: string
  mode: string
  isGuestDiff: boolean
}

export interface Beatmapset {
  beatmapset_id: string
  title: string
  artist: string
  creator: string
  approved_date: string
  difficulties: Difficulty[]
  isOwnMapset: boolean
  approved: string
}

export interface MapperStats {
  totalBeatmaps: number
  totalBeatmapsets: number
  ownBeatmapsets: number
  guestBeatmapsets: number
  totalGuestDiffs: number
  ownDifficulties: number
}

export interface Mapper {
  user_id: string
  username: string
  aliases?: string[] // Support for multiple usernames
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
  mostRecentRankedDate?: string // For new sorting option
}

export interface BeatmapsetGroup {
  beatmapset_id: string
  title: string
  artist: string
  creator: string
  approved_date: string
  modes: string[]
  favourite_count: number
  total_playcount: number
  approved: string
  difficulties: Beatmap[]
}

export type SortOption = 'date' | 'artist' | 'title' | 'favorite' | 'playcount'
export type MapperSortOption = 'name' | 'beatmaps' | 'mapsets' | 'recent'
