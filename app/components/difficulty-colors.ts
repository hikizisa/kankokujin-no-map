/**
 * Difficulty color utilities
 * Implements a continuous color spectrum for star ratings using
 * a d3-like piecewise linear scale and gamma-corrected RGB interpolation (gamma=2.2).
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
// Domain and color range taken from user's requested scale
const DIFFICULTY_DOMAIN = [0.1, 1.25, 2, 2.5, 3.3, 4.2, 4.9, 5.8, 6.7, 7.7, 9]
const DIFFICULTY_RANGE = [
  '#4290FB', '#4FC0FF', '#4FFFD5', '#7CFF4F', '#F6F05C',
  '#FF8068', '#FF4E6F', '#C645B8', '#6563DE', '#18158E', '#000000'
]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return '#' + toHex(Math.round(r)) + toHex(Math.round(g)) + toHex(Math.round(b))
}

// Gamma-corrected interpolation (gamma = 2.2)
const GAMMA = 2.2
const gammaEnc = (v: number) => Math.pow(v / 255, GAMMA)
const gammaDec = (v: number) => Math.pow(v, 1 / GAMMA) * 255

function interpolateColor(c1: string, c2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(c1)
  const [r2, g2, b2] = hexToRgb(c2)
  const R = gammaDec((1 - t) * gammaEnc(r1) + t * gammaEnc(r2))
  const G = gammaDec((1 - t) * gammaEnc(g1) + t * gammaEnc(g2))
  const B = gammaDec((1 - t) * gammaEnc(b1) + t * gammaEnc(b2))
  return rgbToHex(R, G, B)
}

function getSpectrumColor(value: number): string {
  // Clamp into domain bounds
  const min = DIFFICULTY_DOMAIN[0]
  const max = DIFFICULTY_DOMAIN[DIFFICULTY_DOMAIN.length - 1]
  const v = clamp(value, min, max)

  // Find segment index
  let i = 0
  while (i < DIFFICULTY_DOMAIN.length - 1 && v > DIFFICULTY_DOMAIN[i + 1]) i++

  const d0 = DIFFICULTY_DOMAIN[i]
  const d1 = DIFFICULTY_DOMAIN[i + 1]
  const t = d1 - d0 === 0 ? 0 : (v - d0) / (d1 - d0)
  const c0 = DIFFICULTY_RANGE[i]
  const c1 = DIFFICULTY_RANGE[i + 1]
  return interpolateColor(c0, c1, clamp(t, 0, 1))
}

export function getDifficultyColor(stars: number): DifficultyColor {
  if (isNaN(stars)) return { color: '#AAAAAA', name: 'Unrated' }
  const color = getSpectrumColor(stars)
  // Name is optional; keep generic label
  return { color, name: 'Difficulty' }
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
  // Not used currently; return empty to avoid Tailwind safelist issues with arbitrary colors
  // Prefer using getDifficultyStyle for inline color styles.
  return ''
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
