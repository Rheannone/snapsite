# snapsite

CLI tool to screenshot websites at multiple viewport sizes. Crawl an entire site or provide a list of URLs — get desktop, tablet, and mobile screenshots saved to your Desktop.

## Requirements

- [Node.js](https://nodejs.org/) v18 or later

## Install

```bash
git clone https://github.com/Rheannone/snapsite.git
cd snapsite
npm install
npm link
```

This installs dependencies (including Puppeteer with its bundled Chromium) and makes `snapsite` available as a global command.

Or run directly without global install:

```bash
node bin/snapsite.js <command>
```

## Usage

### Crawl an entire site

```bash
snapsite crawl https://example.com
```

Crawls the site (same-origin links only), discovers pages, and screenshots each one at all viewport sizes.

### Screenshot specific URLs

```bash
snapsite urls https://example.com https://example.com/about https://example.com/contact
```

### Screenshot URLs from a file

```bash
snapsite urls --file urls.txt
```

Where `urls.txt` contains one URL per line (lines starting with `#` are ignored).

## Options

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--viewports` | `-v` | Comma-separated viewports | `desktop,tablet,mobile` |
| `--output` | `-o` | Output directory | `~/Desktop/snapsite-screenshots` |
| `--max-pages` | `-m` | Max pages to crawl (crawl mode only) | `100` |
| `--file` | `-f` | Path to URL list file (urls mode only) | — |
| `--scroll` | `-s` | Scroll down each page, taking multiple screenshots | off |
| `--delay` | `-d` | Delay between screenshots (ms) | `0` |
| `--no-headless` | | Show the browser window | headless |

## Viewports

Built-in presets:

| Name | Width | Height |
|------|-------|--------|
| `desktop` | 1920 | 1080 |
| `tablet` | 768 | 1024 |
| `mobile` | 375 | 812 |

You can also pass custom sizes:

```bash
snapsite crawl https://example.com -v 1440x900,375x667
```

Or mix presets with custom:

```bash
snapsite urls https://example.com -v desktop,375x667
```

## Output

Screenshots are saved as PNG with the naming convention:

```
{domain}_{path}_{viewport}-{width}x{height}.png
```

Example:
```
example-com_about_desktop-1920x1080.png
example-com_about_mobile-375x812.png
```

## Examples

```bash
# Crawl a site, desktop only, save to custom folder
snapsite crawl https://mysite.com -v desktop -o ./my-screenshots

# Screenshot 3 URLs at all default viewports
snapsite urls https://mysite.com https://mysite.com/pricing https://mysite.com/docs

# Crawl with a higher page limit
snapsite crawl https://mysite.com -m 500

# Add a 2-second delay between screenshots (for slow-loading sites)
snapsite urls https://mysite.com -d 2000

# Scroll mode — takes a series of screenshots as it scrolls down (10% overlap)
snapsite urls https://mysite.com --scroll

# Combine scroll with mobile viewport
snapsite urls https://mysite.com -v mobile --scroll
```

## License

MIT
