const fs = require('fs');
const path = require('path');
const os = require('os');
const { URL } = require('url');

const DEFAULT_VIEWPORTS = {
  desktop: { name: 'desktop', width: 1920, height: 1080 },
  tablet: { name: 'tablet', width: 768, height: 1024 },
  mobile: { name: 'mobile', width: 375, height: 812 },
};

/**
 * Parse viewport string into array of viewport objects.
 * Accepts: "desktop,mobile" or "1440x900,375x812" or a mix.
 */
function resolveViewports(input) {
  const parts = input.split(',').map(s => s.trim().toLowerCase());
  return parts.map(part => {
    if (DEFAULT_VIEWPORTS[part]) {
      return DEFAULT_VIEWPORTS[part];
    }
    const match = part.match(/^(\d+)x(\d+)$/);
    if (match) {
      return { name: 'custom', width: parseInt(match[1], 10), height: parseInt(match[2], 10) };
    }
    throw new Error(`Invalid viewport: "${part}". Use desktop, tablet, mobile, or WxH (e.g., 1440x900)`);
  });
}

/**
 * Resolve output directory. Defaults to ~/Desktop/snapsite-screenshots.
 */
function resolveOutputDir(input) {
  if (input) return path.resolve(input);
  return path.join(os.homedir(), 'Desktop', 'snapsite-screenshots');
}

/**
 * Convert a URL into a filesystem-safe filename.
 */
function urlToFilename(url) {
  const parsed = new URL(url);
  let name = parsed.hostname.replace(/\./g, '-');
  let pathname = parsed.pathname.replace(/^\/|\/$/g, '');
  if (pathname) {
    name += '_' + pathname.replace(/\//g, '-').replace(/[^a-z0-9\-_]/gi, '');
  }
  return name;
}

/**
 * Read URLs from a text file (one per line).
 */
function readUrlFile(filepath) {
  const content = fs.readFileSync(path.resolve(filepath), 'utf-8');
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

module.exports = { resolveViewports, resolveOutputDir, urlToFilename, readUrlFile };
