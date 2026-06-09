const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: isGithubActions ? '/spam-project' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
