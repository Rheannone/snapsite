const puppeteer = require('puppeteer');
const { URL } = require('url');

/**
 * Crawl a site starting from the given URL, collecting internal links.
 * Returns an array of unique URLs found on the same origin.
 */
async function crawlSite(startUrl, maxPages = 100) {
  const origin = new URL(startUrl).origin;
  const visited = new Set();
  const queue = [normalizeUrl(startUrl)];
  const found = [];

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  while (queue.length > 0 && found.length < maxPages) {
    const url = queue.shift();

    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      if (!response || !response.ok()) continue;

      const contentType = response.headers()['content-type'] || '';
      if (!contentType.includes('text/html')) continue;

      found.push(url);
      process.stdout.write(`  Found: ${url}\n`);

      // Extract links from the page
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => a.href)
          .filter(href => href.startsWith('http'));
      });

      for (const link of links) {
        const normalized = normalizeUrl(link);
        if (normalized.startsWith(origin) && !visited.has(normalized)) {
          queue.push(normalized);
        }
      }
    } catch (err) {
      // Skip pages that fail to load
    }
  }

  await browser.close();
  return found;
}

function normalizeUrl(url) {
  const parsed = new URL(url);
  // Remove hash, trailing slash for consistency
  parsed.hash = '';
  let pathname = parsed.pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  parsed.pathname = pathname;
  return parsed.toString();
}

module.exports = { crawlSite };
