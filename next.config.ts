import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["exceljs", "@prisma/adapter-pg", "pg", "pg-native"],
};

export default nextConfig;
