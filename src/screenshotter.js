const puppeteer = require('puppeteer');
const path = require('path');
const { urlToFilename } = require('./utils');

/**
 * Take viewport screenshots of a list of URLs.
 */
async function screenshotUrls(urls, viewports, outputDir, options = {}) {
  const { delay = 0, headless = true } = options;

  const browser = await puppeteer.launch({ headless });
  const page = await browser.newPage();

  let count = 0;
  const total = urls.length * viewports.length;

  for (const url of urls) {
    for (const viewport of viewports) {
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const filename = `${urlToFilename(url)}_${viewport.name}-${viewport.width}x${viewport.height}.png`;
      const filepath = path.join(outputDir, filename);

      await page.screenshot({ path: filepath });

      count++;
      console.log(`  [${count}/${total}] ${filename}`);
    }
  }

  await browser.close();
}

module.exports = { screenshotUrls };
