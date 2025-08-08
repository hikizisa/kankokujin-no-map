/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['a.ppy.sh']
  },
  // For GitHub Pages deployment
  basePath: process.env.NODE_ENV === 'production' ? '/kankokujin-no-map' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/kankokujin-no-map/' : '',
  distDir: 'out'
}

module.exports = nextConfig
