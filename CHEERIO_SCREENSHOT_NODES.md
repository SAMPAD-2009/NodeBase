# HTML Parsing & Screenshot Nodes

This document describes the two new nodes added to your workflow system: **Cheerio Extractor** and **Screenshot**.

## Overview

These nodes enable you to extract data from websites and capture screenshots, making them powerful tools for web scraping, monitoring, and data collection workflows.

## Cheerio Extractor Node

### Description
The Cheerio Extractor node allows you to parse HTML and extract specific content using CSS selectors. It supports extracting text, HTML, and attributes from web pages.

### Features
- **HTML Parsing**: Fetch and parse HTML from any URL
- **CSS Selectors**: Extract elements using standard CSS selectors
- **Multiple Extraction Modes**:
  - `Text Content`: Extract inner text from elements
  - `HTML Content`: Extract full HTML markup
  - `Attributes`: Extract specific attributes (href, src, class, id, etc.)
- **Bulk Extraction**: Extract multiple elements at once
- **Dynamic URLs**: Use handlebars templates to make URLs dynamic based on context

### Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| **Variable Name** | string | Yes | Name to store extracted data in context |
| **URL** | string | Yes | URL to fetch HTML from (supports handlebars) |
| **CSS Selector** | string | Yes | CSS selector to find elements (e.g., `div.title`, `a.link`) |
| **Extract** | enum | Yes | What to extract: `text`, `html`, `attr:href`, `attr:src`, `attr:class`, `attr:id` |
| **Extract Multiple** | boolean | No | If true, returns array of results; if false, returns first match |

### Example Usage

**Extract all blog post titles:**
```
URL: https://example.com/blog
CSS Selector: h2.post-title
Extract: Text Content
Extract Multiple: true
Variable Name: blog_titles
```

**Output:**
```json
{
  "blog_titles": {
    "cheerioExtracted": [
      { "text": "First Blog Post" },
      { "text": "Second Blog Post" },
      { "text": "Third Blog Post" }
    ],
    "selector": "h2.post-title",
    "elementsFound": 3
  }
}
```

### Using with Previous Outputs

You can use handlebars syntax to dynamically build URLs from previous node outputs:

```
URL: {{httpResponse.url}}
```

This will use the URL from a previous HTTP Request node's output.

## Screenshot Node

### Description
The Screenshot node captures visual representations of websites. It supports multiple screenshot methods optimized for different deployment scenarios.

### Features
- **Multiple Methods**:
  - **API Service** (ApiFlash): Cloud-based, works great on Vercel, no server resources needed
  - **Puppeteer**: Server-side rendering, full control, works in containers
- **Output Formats**: PNG, JPEG, WebP
- **Viewport Control**: Customize width and height
- **Full Page Capture**: Capture entire page or visible viewport
- **Base64 Encoding**: Screenshots returned as base64 strings for easy storage/transmission
- **Dynamic URLs**: Use handlebars templates for dynamic website URLs

### Configuration

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| **Variable Name** | string | Yes | - | Name to store screenshot in context |
| **URL** | string | Yes | - | Website URL to capture (supports handlebars) |
| **Format** | enum | Yes | png | Image format: `png`, `jpeg`, `webp` |
| **Screenshot Method** | enum | Yes | api | `api` (ApiFlash) or `puppeteer` (server-side) |
| **Full Page** | boolean | No | true | Capture entire page or just viewport |
| **Width** | number | No | 1920 | Viewport width in pixels |
| **Height** | number | No | 1080 | Viewport height in pixels |

### Method Comparison

| Feature | API (ApiFlash) | Puppeteer |
|---------|---|---|
| Deployment | Vercel-friendly | Requires container |
| Cost | Free tier available | Free (self-hosted) |
| Speed | Slower (external API) | Faster (local) |
| JavaScript | Full support | Full support |
| Configuration | Limited | Full control |
| Reliability | Depends on API | Depends on server |

### Environment Setup

#### For API Method (ApiFlash)
```bash
# Add to .env.local
APIFLASH_KEY=your_api_key_here  # Or use "free" for free tier
```

Get a free API key at: https://www.apiflash.com/

#### For Puppeteer Method
```bash
# Dependencies are already installed
npm install puppeteer
```

### Example Usage

**Screenshot a product page:**
```
URL: https://example.com/products/123
Method: API Service
Format: PNG
Full Page: true
Variable Name: product_screenshot
```

**Output:**
```json
{
  "product_screenshot": {
    "screenshot": {
      "base64": "iVBORw0KGgoAAAANSUhEUgAAAAUA...",
      "url": "https://example.com/products/123",
      "format": "png",
      "width": 1920,
      "height": 1080,
      "fullPage": true,
      "method": "api",
      "timestamp": "2025-01-15T12:34:56.789Z"
    }
  }
}
```

## Workflow Examples

### Example 1: Web Monitoring Workflow

1. **HTTP Request** → Fetch latest news from website
2. **Cheerio Extractor** → Extract article titles and URLs
3. **Screenshot** → Capture screenshot of each article
4. **Discord Node** → Send notification with screenshot and title

### Example 2: E-commerce Price Monitoring

1. **Manual Trigger** → Start workflow manually
2. **HTTP Request** → Get product page HTML
3. **Cheerio Extractor** → Extract price and stock status
4. **Conditional Logic** (future) → Check if price dropped
5. **Email Node** (future) → Send alert with details

### Example 3: Form Data Extraction

1. **HTTP Request** → Submit form and get response
2. **Cheerio Extractor** → Extract confirmation message
3. **Cheerio Extractor** → Extract order ID from response
4. **Supabase** → Store extracted data in database

## Error Handling

Both nodes will return informative errors if something goes wrong:

- **URL Fetch Error**: Network issues or invalid URL
- **Selector Not Found**: CSS selector didn't match any elements
- **Missing Configuration**: Required fields are empty
- **Screenshot Service Error**: External service unavailable (API method)
- **Browser Error**: Puppeteer process failed (Puppeteer method)

## Performance Tips

1. **Cheerio**: Very fast, can handle many elements without performance issues
2. **Screenshot (API)**: Slower due to network latency, plan for 5-30 second execution
3. **Screenshot (Puppeteer)**: Fast but resource-intensive, may impact server performance
4. **On Vercel**: Recommend using API method for screenshots as Puppeteer has limitations

## Common Issues

### Cheerio Extractor Returns Empty Results
- Check your CSS selector syntax
- Verify the URL is accessible
- Some sites may block automated requests

### Screenshot Times Out
- Increase timeout in node configuration (future feature)
- Try reducing viewport size
- Check internet connection

### API Method Screenshot Fails on Vercel
- Get a free ApiFlash key at https://www.apiflash.com/
- Add `APIFLASH_KEY` to environment variables
- Check that the URL is publicly accessible

## Future Enhancements

Planned features:
- [ ] Timeout configuration
- [ ] Custom headers support
- [ ] Cookie/session support
- [ ] JavaScript execution options
- [ ] Data validation and transformation
- [ ] Batch extraction with rate limiting
- [ ] Retry logic with exponential backoff

## Technical Details

### Dependencies
- `cheerio`: HTML parsing library
- `puppeteer`: Browser automation (optional for Puppeteer method)
- `ky`: HTTP client for API calls
- `handlebars`: Template engine for dynamic values

### Database Schema
Both nodes create entries with:
```prisma
type: NodeType.CHEERIO_EXTRACTOR | NodeType.SCREENSHOT
data: {
  // Configuration saved as JSON
}
```

### Inngest Integration
Both nodes use Inngest channels for real-time status updates:
- `cheerio-execution`: Status channel for Cheerio operations
- `screenshot-execution`: Status channel for Screenshot operations

Status values: `loading`, `success`, `error`
