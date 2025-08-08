/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ['a.ppy.sh', 'assets.ppy.sh']
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/kankokujin-no-map' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/kankokujin-no-map' : ''
}

module.exports = nextConfig
