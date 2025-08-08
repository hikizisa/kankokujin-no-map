/** @type {import('next').NextConfig} */
// Check if we're building for GitHub Pages deployment
const isGitHubPages = process.env.GITHUB_ACTIONS || process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['a.ppy.sh']
  },
  // For GitHub Pages deployment
  basePath: isGitHubPages ? '/kankokujin-no-map' : '',
  assetPrefix: isGitHubPages ? '/kankokujin-no-map/' : '',
  distDir: 'out'
}

module.exports = nextConfig
