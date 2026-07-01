/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // 8mb para cubrir PDFs de resumen de tarjeta escaneados / fotos de
      // factura (base64 infla ~33%). El escáner de imágenes/PDF sube por acá.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
