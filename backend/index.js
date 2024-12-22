const puppeteer = require('puppeteer');

const mapContainer = '.leaflet-container';
const linechartContainer = '.linechart';
const barchartContainer = '.barchart';

(async () => {
  // Create a browser instance
  const browser = await puppeteer.launch();

  // Create a new page
  const page = await browser.newPage();

  // Set viewport width and height
  await page.setViewport({ width: 1280, height: 720 });

  const website_url = 'http://localhost:5173/';

  // Open URL in current page
  await page.goto(website_url);
  await page.waitForSelector(mapContainer);

  const map = await page.$(mapContainer);

  // Capture screenshot
  await map.screenshot({
    path: './screenshots/map.jpg',
  });


  await page.goto(website_url);
  await page.waitForSelector(linechartContainer);

  const linechart = await page.$(linechartContainer);

  // Capture screenshot
  await linechart.screenshot({
    path: './screenshots/linechart.jpg',
  });


  await page.goto(website_url);
  await page.waitForSelector(barchartContainer);

  const barchart = await page.$(barchartContainer);

  // Capture screenshot
  await barchart.screenshot({
    path: './screenshots/barchart.jpg',
  });

  // Close the browser instance
  await browser.close();
})();