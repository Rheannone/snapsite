#!/usr/bin/env node

const { program } = require('commander');
const { crawlSite } = require('../src/crawler');
const { screenshotUrls } = require('../src/screenshotter');
const { resolveViewports, resolveOutputDir, readUrlFile } = require('../src/utils');
const path = require('path');
const fs = require('fs');

const DEFAULT_MAX_PAGES = 100;

program
  .name('snapsite')
  .description('Screenshot websites at multiple viewport sizes')
  .version('1.0.0');

program
  .command('crawl <url>')
  .description('Crawl a site and screenshot every page found')
  .option('-v, --viewports <sizes>', 'Comma-separated viewports: desktop,tablet,mobile or custom WxH', 'desktop,tablet,mobile')
  .option('-o, --output <dir>', 'Output directory', null)
  .option('-m, --max-pages <number>', 'Max pages to crawl', String(DEFAULT_MAX_PAGES))
  .option('-d, --delay <ms>', 'Delay between screenshots in ms', '0')
  .option('-s, --scroll', 'Scroll down each page taking multiple screenshots')
  .option('--no-headless', 'Run browser in visible mode')
  .action(async (url, options) => {
    try {
      const viewports = resolveViewports(options.viewports);
      const output = resolveOutputDir(options.output);
      const maxPages = parseInt(options.maxPages, 10);
      const delay = parseInt(options.delay, 10);

      console.log(`\n🕷️  Crawling: ${url}`);
      console.log(`📐 Viewports: ${viewports.map(v => `${v.name} (${v.width}x${v.height})`).join(', ')}`);
      console.log(`📁 Output: ${output}`);
      console.log(`📄 Max pages: ${maxPages}`);
      if (options.scroll) console.log(`📜 Scroll mode: ON (10% overlap)`);
      console.log('');

      fs.mkdirSync(output, { recursive: true });

      const urls = await crawlSite(url, maxPages);
      console.log(`\n🔗 Found ${urls.length} page(s). Taking screenshots...\n`);

      await screenshotUrls(urls, viewports, output, { delay, headless: options.headless !== false, scroll: !!options.scroll });

      console.log(`\n✅ Done! Screenshots saved to: ${output}\n`);
    } catch (err) {
      console.error(`\n❌ Error: ${err.message}\n`);
      process.exit(1);
    }
  });

program
  .command('urls [urls...]')
  .description('Screenshot specific URLs (pass URLs as args or use --file)')
  .option('-f, --file <path>', 'Path to a text file with one URL per line')
  .option('-v, --viewports <sizes>', 'Comma-separated viewports: desktop,tablet,mobile or custom WxH', 'desktop,tablet,mobile')
  .option('-o, --output <dir>', 'Output directory', null)
  .option('-d, --delay <ms>', 'Delay between screenshots in ms', '0')
  .option('-s, --scroll', 'Scroll down each page taking multiple screenshots')
  .option('--no-headless', 'Run browser in visible mode')
  .action(async (urls, options) => {
    try {
      let urlList = urls || [];

      if (options.file) {
        const fileUrls = readUrlFile(options.file);
        urlList = [...urlList, ...fileUrls];
      }

      if (urlList.length === 0) {
        console.error('❌ No URLs provided. Pass URLs as arguments or use --file.');
        process.exit(1);
      }

      const viewports = resolveViewports(options.viewports);
      const output = resolveOutputDir(options.output);
      const delay = parseInt(options.delay, 10);

      console.log(`\n📸 Screenshotting ${urlList.length} URL(s)`);
      console.log(`📐 Viewports: ${viewports.map(v => `${v.name} (${v.width}x${v.height})`).join(', ')}`);
      console.log(`📁 Output: ${output}`);
      if (options.scroll) console.log(`📜 Scroll mode: ON (10% overlap)`);
      console.log('');

      fs.mkdirSync(output, { recursive: true });

      await screenshotUrls(urlList, viewports, output, { delay, headless: options.headless !== false, scroll: !!options.scroll });

      console.log(`\n✅ Done! Screenshots saved to: ${output}\n`);
    } catch (err) {
      console.error(`\n❌ Error: ${err.message}\n`);
      process.exit(1);
    }
  });

program.parse();
