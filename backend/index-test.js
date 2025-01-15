// const puppeteer = require('puppeteer');
// const fs = require('fs');

// const SELECTORS = {
//     mapContainer: '.leaflet-container',
//     linechartContainer: '.linechart',
//     barchartContainer: '.barchart',
//     interactiveElements: '.leaflet-interactive',
//     tooltipContent: '.leaflet-popup-content',
// };

// const OUTPUT_DIR = './screenshots';

// async function initializeBrowser() {
//     return await puppeteer.launch();
// }

// async function captureScreenshot(page, selector, filePath) {
//     await page.waitForSelector(selector);
//     const element = await page.$(selector);
//     await element.screenshot({ path: filePath });
// }

// async function scrapeMapData(page) {
//     const elements = await page.$$(SELECTORS.interactiveElements);
//     let data = [];

//     for (let element of elements) {
//         await element.hover();
//         await page.waitForSelector(SELECTORS.tooltipContent);
//         const tooltipContent = await page.$eval(SELECTORS.tooltipContent, el => el.textContent);

//         const cleanedContent = tooltipContent.replace(/\s+/g, ' ').trim();
//         const matches = cleanedContent.match(/District:\s*(\w+).*Temperature:\s*([\d.]+)/);

//         if (matches) {
//             const district = matches[1];
//             const temperature = parseFloat(matches[2]);
//             if (!data.some(item => item.District === district)) {
//                 data.push({ District: district, Temperature: temperature });
//             }
//         }
//     }
//     return data;
// }

// function saveDataToJson(data, filePath) {
//     fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
// }

// (async () => {
//     if (!fs.existsSync(OUTPUT_DIR)) {
//         fs.mkdirSync(OUTPUT_DIR);
//     }

//     const browser = await initializeBrowser();
//     const page = await browser.newPage();
//     await page.setViewport({ width: 1280, height: 720 });

//     const websiteUrl = 'http://localhost:5173/';
//     await page.goto(websiteUrl);

//     // Capture screenshots
//     await captureScreenshot(page, SELECTORS.mapContainer, `${OUTPUT_DIR}/map.jpg`);
//     await captureScreenshot(page, SELECTORS.linechartContainer, `${OUTPUT_DIR}/linechart.jpg`);
//     await captureScreenshot(page, SELECTORS.barchartContainer, `${OUTPUT_DIR}/barchart.jpg`);

//     // Scrape map data
//     const mapData = await scrapeMapData(page);
//     saveDataToJson(mapData, `${OUTPUT_DIR}/scraped_data.json`);

//     console.log('Screenshots and data have been saved successfully.');

//     await browser.close();
// })();
