const puppeteer = require('puppeteer');

const mapContainer = '.leaflet-container';
const linechartContainer = '.linechart';
const barchartContainer = '.barchart';
const fs = require('fs');

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

  const elements = await page.$$('.leaflet-interactive');

  let data = [];

    // Hover over each element and extract tooltip content
    for (let element of elements) {

        // Hover over the element
        await element.hover();

        // Wait for the tooltip to appear (adjust selector if needed)
        await page.waitForSelector('.leaflet-popup-content');

        // Extract tooltip content
        const tooltipContent = await page.$eval('.leaflet-popup-content', el => el.textContent);

        const cleanedContent = tooltipContent.replace(/\s+/g, ' ').trim(); // Remove extra spaces and \n
        const matches = cleanedContent.match(/District:\s*(\w+).*Temperature:\s*([\d.]+)/);

        if (matches) {
            const district = matches[1];
            const temperature = parseFloat(matches[2]); // Convert temperature to a number

            const exists = data.some(item => item.District === district);

            if (!exists) {
                data.push({ District: district, Temperature: temperature });
            }
        }        
    }

    const filePath = './screenshots/scraped_data.json';
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

  // Close the browser instance
  await browser.close();
})();