/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Se você já tiver outras configurações aqui dentro, mantenha-as e adicione apenas a linha abaixo */
  experimental: {
    outputFileTracingIncludes: {
      '/api/certificado': ['./src/assets/fonts/**/*'],
    },
  },
};

module.exports = nextConfig;