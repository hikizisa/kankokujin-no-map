// Utility functions for API calls that respect basePath configuration

/**
 * Get the correct base path for API calls
 * This ensures that data fetching works correctly both in development and on GitHub Pages
 */
export function getBasePath(): string {
  // Check if we're in GitHub Pages environment (same logic as next.config.js)
  const isGitHubPages = process.env.GITHUB_ACTIONS || process.env.NODE_ENV === 'production'
  return isGitHubPages ? '/kankokujin-no-map' : ''
}

/**
 * Construct a full URL for data fetching that respects the basePath
 */
export function getDataUrl(path: string): string {
  const basePath = getBasePath()
  // Remove leading slash from path if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${basePath}/${cleanPath}`
}

/**
 * Fetch data with correct basePath handling
 */
export async function fetchData(path: string): Promise<Response> {
  const url = getDataUrl(path)
  return fetch(url)
}
