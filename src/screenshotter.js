const puppeteer = require('puppeteer');
const path = require('path');
const { urlToFilename } = require('./utils');

/**
 * Take viewport screenshots of a list of URLs.
 * When scroll is true, takes multiple screenshots while scrolling down the page
 * with ~10% overlap between each frame.
 */
async function screenshotUrls(urls, viewports, outputDir, options = {}) {
  const { delay = 0, headless = true, scroll = false } = options;

  const browser = await puppeteer.launch({ headless });
  const page = await browser.newPage();

  let count = 0;

  for (const url of urls) {
    for (const viewport of viewports) {
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const baseFilename = `${urlToFilename(url)}_${viewport.name}-${viewport.width}x${viewport.height}`;

      if (scroll) {
        const frames = await screenshotWithScroll(page, viewport, baseFilename, outputDir, delay);
        count += frames;
      } else {
        const filename = `${baseFilename}.png`;
        const filepath = path.join(outputDir, filename);
        await page.screenshot({ path: filepath });
        count++;
        console.log(`  [${count}] ${filename}`);
      }
    }
  }

  await browser.close();
  console.log(`\n  📷 ${count} total screenshot(s) taken.`);
}

/**
 * Scroll down the page taking screenshots at each position.
 * Overlaps by ~10% of the viewport height between frames.
 */
async function screenshotWithScroll(page, viewport, baseFilename, outputDir, delay) {
  const scrollStep = Math.floor(viewport.height * 0.9);

  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  let currentScroll = 0;
  let frame = 1;

  while (currentScroll < totalHeight) {
    await page.evaluate((y) => window.scrollTo(0, y), currentScroll);
    // Allow lazy content to load after scroll
    await new Promise(resolve => setTimeout(resolve, delay > 0 ? delay : 300));

    const filename = `${baseFilename}_scroll-${String(frame).padStart(2, '0')}.png`;
    const filepath = path.join(outputDir, filename);
    await page.screenshot({ path: filepath });
    console.log(`  ${filename}`);

    currentScroll += scrollStep;
    frame++;

    // Stop if we've reached the bottom
    const newHeight = await page.evaluate(() => document.body.scrollHeight);
    if (currentScroll >= newHeight) break;
  }

  return frame - 1;
}

module.exports = { screenshotUrls };
