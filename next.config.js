/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    eslint: {
        // We run ESLint in a separate process as part of our CI step
        ignoreDuringBuilds: true,
    },
    typescript:{
        // We run type checking in a separate process as part of our CI step
        ignoreBuildErrors: true,
    }
};

export default config;
