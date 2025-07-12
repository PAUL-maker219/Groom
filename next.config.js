/** @type {import('next').NextConfig} */
const nextConfig = {
  telemetry: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        http: false,
        https: false,
        buffer: false,
        child_process: false,
        os: false,
        path: false,
      };
    }
    // Enable WebSocket support
    config.module.rules.push({
      test: /\.ts$/,
      loader: 'esbuild-loader',
      options: { loader: 'ts', target: 'es2015' },
    });
    return config;
  },
};

module.exports = nextConfig;