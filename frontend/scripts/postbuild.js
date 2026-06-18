#!/usr/bin/env node
/**
 * Skip react-snap / puppeteer prerender on Vercel and CI.
 * Puppeteer cannot launch Chrome in Vercel's build environment.
 */
if (process.env.VERCEL || process.env.CI || process.env.SKIP_PRERENDER === "1") {
  console.log("[prerender] skipped on Vercel/CI");
  process.exit(0);
}

const { execSync } = require("child_process");

try {
  execSync("npx react-snap", { stdio: "inherit" });
} catch {
  console.log("[prerender] react-snap failed, attempting fallback");
  try {
    execSync("node ./scripts/prerender.js", { stdio: "inherit" });
  } catch {
    console.log("[prerender] skipped — production build still valid");
  }
}
