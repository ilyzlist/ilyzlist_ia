// next.config.mjs
import { fileURLToPath } from 'url';
import path from 'path';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    DEEPSEEK_API_ENDPOINT: process.env.DEEPSEEK_API_ENDPOINT,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'azpcljcxjghbbnqoezmd.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" }
        ]
      }
    ];
  },

  // ✅ This must be under a `dev` field — not directly in root
  dev: {
    allowedDevOrigins: ['http://192.168.1.58:3000'],
  },

  webpack: (config, { isServer }) => {
    config.resolve.alias['__dirname'] = __dirname;

    if (isServer) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.DEEPSEEK_API_KEY': JSON.stringify(process.env.DEEPSEEK_API_KEY),
          'process.env.SUPABASE_SERVICE_KEY': JSON.stringify(process.env.SUPABASE_SERVICE_KEY),
          'process.env.OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY),
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        })
      );
    }

    config.module.rules.push({
      test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000
        }
      }
    });

    return config;
  },

  async rewrites() {
    return [
      {
        source: '/articles/:id',
        destination: '/articles/[articleId]',
      },
    ];
  },

  experimental: {
    serverActions: {},
    optimizeCss: true,
    clientRouterFilter: true,
    optimizeServerReact: true
  },

  serverExternalPackages: ['@supabase/supabase-js'],

  productionBrowserSourceMaps: true,
  compress: true,
  distDir: process.env.NEXT_BUILD_DIR || '.next',
  trailingSlash: false,
};

export default nextConfig;
