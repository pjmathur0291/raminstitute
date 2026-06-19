#!/usr/bin/env node
/**
 * Post-build: copy static landing pages, then optionally prerender the React SPA.
 */
const { execSync } = require("child_process");

require("./copy-static-pages");

if (process.env.VERCEL || process.env.CI || process.env.SKIP_PRERENDER === "1") {
  console.log("[prerender] skipped on Vercel/CI");
  process.exit(0);
}

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
