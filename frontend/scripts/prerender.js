#!/usr/bin/env node
/**
 * Modern fallback prerender script — runs after `yarn build` if react-snap fails.
 * Uses headless Chromium via puppeteer to crawl each route on a locally-served
 * production build, then writes static HTML into build/{route}/index.html for
 * SEO + social previews + AI scrapers.
 *
 * Usage: yarn prerender   OR   automatically via `yarn build` (postbuild hook)
 *
 * Why this script exists: react-snap@1.23 is unmaintained since 2020 and ships
 * Puppeteer 1.x which often fails to install Chromium on modern Node 20 build
 * envs. This script is intentionally tiny (zero non-stdlib deps except an
 * optional `puppeteer`) and degrades to a no-op if Chromium cannot start, so
 * production builds never break.
 */
const fs = require("fs");
const path = require("path");
const http = require("http");

const ROUTES = [
  "/",
  "/about",
  "/courses",
  "/courses/bhm",
  "/courses/mhm",
  "/courses/dhm",
  "/courses/culinary-arts",
  "/courses/bakery-confectionery",
  "/courses/bartending",
  "/placements",
  "/scholarships",
  "/campus-life",
  "/gallery",
  "/blog",
  "/contact",
  "/apply",
];

const BUILD_DIR = path.resolve(__dirname, "..", "build");
const PORT = 5050;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".map": "application/json",
};

function serveStatic(req, res) {
  // Strip query string
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  let filePath = path.join(BUILD_DIR, urlPath);
  // Security: don't allow escaping build/
  if (!filePath.startsWith(BUILD_DIR)) {
    res.statusCode = 403;
    return res.end("forbidden");
  }
  fs.stat(filePath, (err, stat) => {
    if (err || stat.isDirectory()) {
      // Fall back to index.html (SPA routing)
      filePath = path.join(BUILD_DIR, "index.html");
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || "application/octet-stream";
    res.setHeader("Content-Type", mime);
    fs.createReadStream(filePath).on("error", () => {
      res.statusCode = 404;
      res.end("not found");
    }).pipe(res);
  });
}

async function main() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.error("[prerender] build/ does not exist — run `yarn build` first.");
    process.exit(0);
  }

  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch {
    console.warn("[prerender] puppeteer not installed — skipping. (build still valid)");
    process.exit(0);
  }

  const server = http.createServer(serveStatic);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[prerender] serving ${BUILD_DIR} on http://localhost:${PORT}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
  } catch (e) {
    console.error("[prerender] failed to launch Chromium:", e.message);
    server.close();
    process.exit(0);
  }

  let success = 0;
  for (const route of ROUTES) {
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 1366, height: 900 });
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });
      // Allow async content (React Query, lazy components) to settle
      await new Promise((r) => setTimeout(r, 1500));
      const html = await page.content();

      const outDir = path.join(BUILD_DIR, route === "/" ? "" : route);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html);
      console.log(`[prerender] ✓ ${route}`);
      success++;
    } catch (e) {
      console.warn(`[prerender] ✗ ${route} — ${e.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();
  console.log(`[prerender] done: ${success}/${ROUTES.length} routes prerendered`);
}

main().catch((e) => {
  console.error("[prerender] fatal:", e);
  process.exit(0); // soft-fail — never break the build
});
