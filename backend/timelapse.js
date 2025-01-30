const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const SELECTORS = {
    mapContainer: '.leaflet-container',
    interactiveElements: '.leaflet-interactive',
    tooltipContent: '.leaflet-popup-content',
};

const OUTPUT_DIR = './screenshots';
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

class ScreenshotService {
    constructor() {
        this.browser = null;
    }

    async initialize() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox']
            });
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async captureScreenshot(page, selector, fileName) {
        try {
            await page.waitForSelector(selector, { timeout: 5000 });
            await delay(1000); // Allow time for any animations to complete

            const element = await page.$(selector);
            if (!element) throw new Error(`Element ${selector} not found`);

            const filePath = path.join(OUTPUT_DIR, fileName);
            await element.screenshot({ 
                path: filePath,
                type: 'png',
                omitBackground: true
            });

            console.log(`Screenshot saved: ${filePath}`);
            return filePath;
        } catch (error) {
            console.error(`Error capturing screenshot`, error);
            throw error;
        }
    }
}

const screenshotService = new ScreenshotService();

app.post('/api/capture-image', async (req, res) => {
    try {
        const { mapState } = req.body;
        if (!mapState) {
            throw new Error('Map state is required');
        }

        await screenshotService.initialize();
        const page = await screenshotService.browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });

        // Navigate to the page
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

        // Inject the map state into the page
        await page.evaluate((state) => {
            // Create a custom event with the map state
            const event = new CustomEvent('setMapState', { detail: state });
            // Dispatch the event
            window.dispatchEvent(event);
        }, mapState);

        // Wait for the map to update
        await delay(2000); // Adjust timing as needed

        const screenshotPath = await screenshotService.captureScreenshot(
            page, 
            SELECTORS.mapContainer, 
            `map-${Date.now()}.png`
        );

        await page.close();

        res.json({ 
            success: true, 
            screenshotPath,
            message: `Captured screenshot with current map state` 
        });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

process.on('SIGINT', async () => {
    await screenshotService.cleanup();
    process.exit();
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Screenshot API running on port ${PORT}`);
});