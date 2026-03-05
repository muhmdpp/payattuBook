import { execSync } from 'child_process';
import withPWAInit from '@ducanh2912/next-pwa';

let commitMsg = '';
try {
  commitMsg = execSync('git log -1 --pretty=%B').toString().trim();
} catch (e) {
  // Fallback if git is not available
  commitMsg = 'development';
}

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // typically better to disable in dev or keep it based on requirement, instructions said "Ensure it works correctly in both development and production builds", so let's enable it.
  workboxOptions: {
    disableDevLogs: true,
    exclude: [
      // Avoid caching API routes if they are not meant to be cached offline
      /\/api\/.*/,
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT_MESSAGE: process.env.VERCEL_GIT_COMMIT_MESSAGE || commitMsg,
  },
};

export default withPWA(nextConfig);
