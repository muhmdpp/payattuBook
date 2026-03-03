import { execSync } from 'child_process';

let commitMsg = '';
try {
  commitMsg = execSync('git log -1 --pretty=%B').toString().trim();
} catch (e) {
  // Fallback if git is not available
  commitMsg = 'development';
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT_MESSAGE: process.env.VERCEL_GIT_COMMIT_MESSAGE || commitMsg,
  },
};

export default nextConfig;
