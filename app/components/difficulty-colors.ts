/**
 * Difficulty color utilities based on osu! standard difficulty colors
 * Reference: https://geiboi77.pages.dev/Other/Difficulty_Colour/
 */

export interface DifficultyColor {
  color: string
  name: string
}

/**
 * Get the difficulty color based on star rating
 * @param stars Star rating as number
 * @returns Object with color hex code and difficulty name
 */
export function getDifficultyColor(stars: number): DifficultyColor {
  if (stars < 0.1) return { color: '#AAAAAA', name: 'Unrated' }
  if (stars < 1.27) return { color: '#4FC0FF', name: 'Easy' }
  if (stars < 2.4) return { color: '#4FFFD5', name: 'Normal' }
  if (stars < 3.5) return { color: '#7CFF4F', name: 'Hard' }
  if (stars < 5.3) return { color: '#F6F05C', name: 'Insane' }
  if (stars < 6.5) return { color: '#FF6666', name: 'Expert' }
  if (stars < 8.0) return { color: '#C645C6', name: 'Expert+' }
  if (stars < 9.0) return { color: '#FFFFFF', name: 'Beyond' }
  return { color: '#000000', name: 'Aspire' }
}

/**
 * Get difficulty color as CSS style object
 * @param stars Star rating as number
 * @returns CSS style object with color
 */
export function getDifficultyStyle(stars: number): { color: string } {
  return { color: getDifficultyColor(stars).color }
}

/**
 * Get difficulty color as Tailwind CSS class
 * @param stars Star rating as number
 * @returns Tailwind CSS color class
 */
export function getDifficultyTailwindClass(stars: number): string {
  if (stars < 0.1) return 'text-gray-400'
  if (stars < 1.27) return 'text-sky-400'
  if (stars < 2.4) return 'text-teal-400'
  if (stars < 3.5) return 'text-lime-400'
  if (stars < 5.3) return 'text-yellow-400'
  if (stars < 6.5) return 'text-red-400'
  if (stars < 8.0) return 'text-purple-400'
  if (stars < 9.0) return 'text-white'
  return 'text-black'
}

/**
 * Format star rating with appropriate precision
 * @param stars Star rating as string or number
 * @returns Formatted star rating string
 */
export function formatStarRating(stars: string | number): string {
  const numStars = typeof stars === 'string' ? parseFloat(stars) : stars
  if (isNaN(numStars)) return '0.00'
  return numStars.toFixed(2)
}
