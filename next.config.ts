import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The Windows account broker loads native MSAL bindings at runtime, which
  // webpack cannot bundle; let Node resolve them from node_modules instead.
  serverExternalPackages: [
    "@azure/identity",
    "@azure/identity-broker",
    "@azure/msal-node",
    "@azure/msal-node-extensions",
  ],
};

export default nextConfig;
