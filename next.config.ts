import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/certificado': ['./src/assets/fonts/**/*'],
  },
};

export default nextConfig;