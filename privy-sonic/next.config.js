/** @type {import('next').NextConfig} */
module.exports = {
  webpack: (config) => {
    config.externals["@solana/web3.js"] = "commonjs @solana/web3.js";
    return config;
  },
  reactStrictMode: true,
};
