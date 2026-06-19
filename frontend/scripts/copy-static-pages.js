#!/usr/bin/env node
/**
 * Copy standalone static landing pages from the repo root into CRA output folders.
 * - public/  → available during `npm start` at /nursing/
 * - build/   → deployed with production build on Vercel
 */
const fs = require("fs");
const path = require("path");

function copyDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const repoRoot = path.resolve(__dirname, "../..");
const buildDir = path.resolve(__dirname, "../build");
const publicDir = path.resolve(__dirname, "../public");
const staticPages = ["nursing"];

const destinations = [];
if (fs.existsSync(buildDir)) destinations.push(buildDir);
if (fs.existsSync(publicDir)) destinations.push(publicDir);

if (!destinations.length) {
  console.error("[static] no build/ or public/ directory found");
  process.exit(1);
}

let copied = 0;

for (const page of staticPages) {
  const src = path.join(repoRoot, page);
  if (!fs.existsSync(src)) {
    console.warn(`[static] skipped ${page}/ (not found)`);
    continue;
  }

  for (const destRoot of destinations) {
    const dest = path.join(destRoot, page);
    copyDir(src, dest);
    const label = destRoot === buildDir ? "build" : "public";
    console.log(`[static] copied ${page}/ -> ${label}/${page}/`);
    copied += 1;
  }
}

if (!copied) {
  console.warn("[static] no static pages copied");
}
