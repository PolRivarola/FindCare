/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: false,              // we call with slash to the proxy path anyway
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/cliente/:id", destination: "/perfil/cliente/:id" },
      { source: "/cuidador/:id", destination: "/perfil/cuidador/:id" },
    ];
  },
}

export default nextConfig
