module.exports = {
  pageExtensions: ['js', 'jsx'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*'
      }
    ];
  },
  // Tell Next.js to use Pages directory instead of pages
  webpack: (config, { isServer }) => {
    return config;
  }
};
