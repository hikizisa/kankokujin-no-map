// Internationalization utilities and translations

export type Language = 'ko' | 'en'

export interface Translations {
  // Header and Navigation
  title: string
  subtitle: string
  backToHome: string
  allBeatmaps: string
  browseAllBeatmaps: string
  
  // Search and Filters
  searchPlaceholder: string
  noResults: string
  filterByMode: string
  filterByStatus: string
  ranked: string
  loved: string
  
  // Sorting
  sortBy: string
  sortMappers: string
  sortBeatmaps: string
  sortByName: string
  sortByBeatmapsets: string
  sortByBeatmaps: string
  sortByRecent: string
  sortByDate: string
  sortByArtist: string
  sortByTitle: string
  sortByFavorites: string
  sortByPlaycount: string
  
  // Mapper Info
  beatmapsets: string
  beatmaps: string
  favorites: string
  playcount: string
  newMapper: string
  
  // Beatmap Info
  starRating: string
  length: string
  bpm: string
  approvedDate: string
  
  // Display Options
  cardView: string
  thumbnailView: string
  minimalView: string
  
  // Stats
  totalMappers: string
  totalBeatmapsets: string
  
  // Language Toggle
  language: string
  korean: string
  english: string
  
  // Modes
  osuStandard: string
  taiko: string
  catchTheBeat: string
  osuMania: string
  
  // Footer
  lastUpdated: string
  noMappersFound: string
  viewOnGitHub: string
  footerText: string
  
  // Footer/Description
  description: string
}

export const translations: Record<Language, Translations> = {
  ko: {
    // Header and Navigation
    title: '한국인 매퍼 지도',
    subtitle: 'osu! 커뮤니티의 재능있는 한국 매퍼들의 랭크 비트맵을 발견하세요',
    backToHome: '홈으로 돌아가기',
    allBeatmaps: '모든 비트맵',
    browseAllBeatmaps: '모든 비트맵 보기',
    
    // Search and Filters
    searchPlaceholder: '비트맵셋 검색...',
    noResults: '결과가 없습니다',
    filterByMode: '모드별 필터',
    filterByStatus: '상태별 필터',
    ranked: '랭크',
    loved: '러브드',
    
    // Sorting
    sortBy: '정렬',
    sortMappers: '매퍼 정렬:',
    sortBeatmaps: '비트맵 정렬:',
    sortByName: '이름',
    sortByBeatmapsets: '비트맵셋',
    sortByBeatmaps: '총 비트맵',
    sortByRecent: '최근 랭크',
    sortByDate: '날짜',
    sortByArtist: '아티스트',
    sortByTitle: '제목',
    sortByFavorites: '즐겨찾기',
    sortByPlaycount: '플레이 수',
    
    // Mapper Info
    beatmapsets: '비트맵셋',
    beatmaps: '비트맵',
    favorites: '즐겨찾기',
    playcount: '플레이 수',
    newMapper: '신규',
    
    // Beatmap Info
    starRating: '별 난이도',
    length: '길이',
    bpm: 'BPM',
    approvedDate: '승인일',
    
    // Display Options
    cardView: '카드 보기',
    thumbnailView: '썸네일 보기',
    minimalView: '간단 보기',
    
    // Stats
    totalMappers: '총 매퍼 수',
    totalBeatmapsets: '총 비트맵셋 수',
    
    // Language Toggle
    language: '언어',
    korean: '한국어',
    english: 'English',
    
    // Modes
    osuStandard: '스탠다드',
    taiko: '태고',
    catchTheBeat: '캐치',
    osuMania: '매니아',
    
    // Footer
    lastUpdated: '마지막 업데이트',
    noMappersFound: '검색 조건에 맞는 매퍼를 찾을 수 없습니다.',
    viewOnGitHub: 'GitHub에서 보기',
    footerText: 'osu! API에서 데이터 수집 • GitHub Actions로 매일 업데이트',
    
    // Footer/Description
    description: '재능있는 한국 osu! 매퍼들과 그들의 랭크 비트맵을 발견하세요. 이 사이트는 한국 매핑 커뮤니티의 창작물을 소개하고 새로운 비트맵을 찾는 데 도움을 줍니다.'
  },
  
  en: {
    // Header and Navigation
    title: 'Korean Mappers Map',
    subtitle: 'Discover ranked beatmaps from talented Korean mappers in the osu! community',
    backToHome: 'Back to Home',
    allBeatmaps: 'All Beatmaps',
    browseAllBeatmaps: 'Browse All Beatmaps',
    
    // Search and Filters
    searchPlaceholder: 'Search beatmapsets...',
    noResults: 'No results found',
    filterByMode: 'Filter by Mode',
    filterByStatus: 'Filter by Status',
    ranked: 'Ranked',
    loved: 'Loved',
    
    // Sorting
    sortBy: 'Sort by',
    sortMappers: 'Sort mappers:',
    sortBeatmaps: 'Sort beatmaps:',
    sortByName: 'Name',
    sortByBeatmapsets: 'Beatmapsets',
    sortByBeatmaps: 'Total Beatmaps',
    sortByRecent: 'Recent Activity',
    sortByDate: 'Date',
    sortByArtist: 'Artist',
    sortByTitle: 'Title',
    sortByFavorites: 'Favorites',
    sortByPlaycount: 'Playcount',
    
    // Mapper Info
    beatmapsets: 'beatmapsets',
    beatmaps: 'beatmaps',
    favorites: 'favorites',
    playcount: 'playcount',
    newMapper: 'New',
    
    // Beatmap Info
    starRating: 'Star Rating',
    length: 'Length',
    bpm: 'BPM',
    approvedDate: 'Approved Date',
    
    // Display Options
    cardView: 'Card View',
    thumbnailView: 'Thumbnail View',
    minimalView: 'Minimal View',
    
    // Stats
    totalMappers: 'Total Mappers',
    totalBeatmapsets: 'Total Beatmapsets',
    
    // Language Toggle
    language: 'Language',
    korean: '한국어',
    english: 'English',
    
    // Modes
    osuStandard: 'osu!',
    taiko: 'Taiko',
    catchTheBeat: 'Catch',
    osuMania: 'Mania',
    
    // Footer
    lastUpdated: 'Last updated',
    noMappersFound: 'No mappers found matching your search.',
    viewOnGitHub: 'View on GitHub',
    footerText: 'Data sourced from osu! API • Updated daily via GitHub Actions',
    
    // Footer/Description
    description: 'Discover talented Korean osu! mappers and their ranked beatmaps. This site showcases the Korean mapping community\'s creations and helps you find new beatmaps to play.'
  }
}

// Get mode name in the selected language
export const getModeName = (mode: string, language: Language = 'ko'): string => {
  const t = translations[language]
  switch (mode) {
    case '0': return t.osuStandard
    case '1': return t.taiko
    case '2': return t.catchTheBeat
    case '3': return t.osuMania
    default: return t.osuStandard
  }
}

// Hook for using translations
export const useTranslations = (language: Language) => {
  return translations[language]
}
