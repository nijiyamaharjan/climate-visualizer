require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const GIFEncoder = require("gifencoder");
const { createCanvas, loadImage } = require("canvas");

const app = express();
const port = process.env.PORT || 5000;

app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(bodyParser.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Helper function to dynamically build SQL conditions
const buildConditions = (baseQuery, params) => {
    const conditions = [];
    const values = [];

    if (params.date) {
        conditions.push(`t.timestamp::DATE = $${values.length + 1}`);
        values.push(params.date);
    }

    if (params.startDate && params.endDate) {
        conditions.push(
            `t.timestamp::DATE BETWEEN $${values.length + 1} AND $${
                values.length + 2
            }`
        );
        values.push(params.startDate, params.endDate);
    }

    if (params.district) {
        conditions.push(`d.district = $${values.length + 1}`);
        values.push(params.district);
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";
    return {
        query: `${baseQuery} ${whereClause};`,
        values,
    };
};

app.post("/api/generate-map", async (req, res) => {
    const { variable, date, district } = req.body;

    if (!date || !variable) {
        return res
            .status(400)
            .send({ error: "Date and variable are required" });
    }

    try {
        // Fetch GeoJSON data
        const baseQuery = `
            SELECT d.district, ST_AsGeoJSON(d.geom) AS geometry, t.value
            FROM district_boundaries d
            JOIN ${variable} t
            ON d.district = t.district_name
        `;
        const { query, values } = buildConditions(baseQuery, {
            date,
            district,
        });
        const result = await pool.query(query, values);
        const geojson = {
            type: "FeatureCollection",
            features: result.rows.map((row) => ({
                type: "Feature",
                geometry: JSON.parse(row.geometry),
                properties: {
                    district: row.district,
                    [variable]: row.value,
                },
            })),
        };

        // Launch browser with specific settings
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        // Set a larger viewport
        await page.setViewport({
            width: 1200,
            height: 800,
            deviceScaleFactor: 2, // For better resolution
        });

        // Create the HTML content
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Map Export</title>
                    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                    <style>
                        body, html { margin: 0; padding: 0; height: 100vh; width: 100vw; }
                        #map { width: 100%; height: 100%; }
                    </style>
                </head>
                <body>
                    <div id="map"></div>
                    <script>
                        const geojsonData = ${JSON.stringify(geojson)};

                        function initMap() {
                            return new Promise((resolve) => {
                                const map = L.map('map', {
                                    zoomControl: false,
                                    attributionControl: false
                                }).setView([28.3949, 84.1240], 7);

                                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}.png', {
                                    maxZoom: 12,
                                    minZoom: 7
                                }).addTo(map);

                                const style = (feature) => {
                                    const value = feature.properties['${variable}'];
                                    let fillColor;
                                    if ('${variable}' === 'tas_min || ${variable}' === 'tas_max' || ${variable}' === 'tas) {
                                      fillColor = value > 310 ? '#FF0000' :
                                                value > 305 ? '#FF3300' :
                                                value > 300 ? '#FF6600' :
                                                value > 295 ? '#FF9900' :
                                                value > 290 ? '#FFCC00' :
                                                value > 285 ? '#FFFF00' :
                                                value > 280 ? '#FFFF66' :
                                                value > 275 ? '#99CCFF' :
                                                value > 270 ? '#66B3FF' :
                                                value > 265 ? '#3399FF' :
                                                value > 260 ? '#0066FF' :
                                                value > 255 ? '#0033CC' :
                                                '#0000FF';
                                  } else if ('${variable}' === 'sfc_windspeed'){
                                      fillColor = value > 3.9 ? '#3E1A8E' :  
                                          value > 3.8 ? '#5A2A9B' :  
                                          value > 3.7 ? '#7F4AB8' :  
                                          value > 3.6 ? '#9B6DCD' :  
                                          value > 3.5 ? '#B79FDC' :  
                                          value > 3.4 ? '#D4C1E8' :  
                                          value > 3.3 ? '#E8D7F4' :  
                                          value > 3.2 ? '#F1E5FB' :  
                                          value > 3.1 ? '#D0D9F5' :  
                                          value > 3 ? '#A3B9F2' :  
                                          value > 2.9 ? '#7DA9EE' :  
                                          value > 2.8 ? '#539FE5' :  
                                          value > 2.7 ? '#1F8FD5' :  
                                          '#0F72B0';  
                                  } else if ('${variable}' === 'precipitation_rate') {
                                      fillColor = value > 30 ? '#0A0F44' :
                                          value > 20 ? '#162A5B' :
                                          value > 10 ? '#203E73' :
                                          value > 7 ? '#2B5A91' :
                                          value > 5 ? '#3A77AD' :
                                          value > 4 ? '#518ECC' :
                                          value > 3 ? '#6CA3DF' :
                                          value > 2 ? '#87B6E9' :
                                          value > 1.76 ? '#A3C8F1' :
                                          value > 1.5 ? '#B7D5F6' :
                                          value > 1.2 ? '#C7E0FA' :
                                          value > 1.0 ? '#D8EBFD' :
                                          value > 0.8 ? '#E9F4FF' :
                                          value > 0.76 ? '#E0F7FF' :
                                          value > 0.6 ? '#D1F2FF' :
                                          value > 0.5 ? '#A3D8FF' :
                                          value > 0.4 ? '#7EC2FF' :
                                          value > 0.35 ? '#4AB5FF' :
                                          value > 0.27 ? '#1B8CFF' :
                                          '#006BB3';
                                  } else if ('${variable}' === 'huss') {
                                      fillColor = value > 0.034 ? '#084594' :
                                          value > 0.025 ? '#2171b5' :
                                          value > 0.018 ? '#4292c6' :
                                          value > 0.014 ? '#6baed6' :
                                          value > 0.010 ? '#9ecae1' :
                                          value > 0.007 ? '#c6dbef' :
                                          value > 0.005 ? '#deebf7' :
                                          value > 0.002 ? '#fee090' :
                                          value > 0.0005 ? '#fdae61' :
                                          '#f46d43';
                                  } else if ('${variable}' === 'hurs') {
                                      fillColor = value > 100 ? '#54278f' :
                                          value > 90 ? '#08519c' :
                                          value > 80 ? '#3182bd' :
                                          value > 70 ? '#6baed6' :
                                          value > 60 ? '#9ecae1' :
                                          value > 50 ? '#c6dbef' :
                                          value > 40 ? '#edf8b1' :
                                          value > 30 ? '#fdae61' :
                                          value > 20 ? '#f46d43' :
                                          value > 10 ? '#d73027' :
                                          '#a50026';
                                  } else if ('${variable}' === 'snowfall') {
                                      fillColor = value > 0.01 ? '#003366' :
                                          value > 0.005 ? '#004488' :
                                          value > 0.002 ? '#0055AA' :
                                          value > 0.001 ? '#0077CC' :
                                          value > 0.0005 ? '#3399DD' :
                                          value > 0.0001 ? '#66BBEE' :
                                          value > 0.00001 ? '#99DDF8' :
                                          value > 0.000001 ? '#D8EBFD' :
                                          '#C7E0FA';
                                  } else if ('${variable}' === 'snowmelt') {
                                      fillColor = value > 0.01 ? '#0A0F44' :
                                          value > 0.005 ? '#162A5B' :
                                          value > 0.001 ? '#203E73' :
                                          value > 0.0005 ? '#2B5A91' :
                                          value > 0.0002 ? '#3A77AD' :
                                          value > 0.0001 ? '#518ECC' :
                                          value > 0.00001 ? '#6CA3DF' :
                                          value > 1e-6 ? '#87B6E9' :
                                          value > 1e-7 ? '#A3C8F1' :
                                          value > 1e-9 ? '#B7D5F6' :
                                          value > 1e-11 ? '#C7E0FA' :
                                          '#D8EBFD';
                                  } else if ('${variable}' === 'spei') {
                                      fillColor = value > 3 ? '#00441B' :
                                          value > 2 ? '#1B7837' :
                                          value > 1 ? '#5AAE61' :
                                          value > 0.6 ? '#A6D96A' :
                                          value > 0.1 ? '#D9F0A3' :
                                          value > -0.1 ? '#FFFFBF' :
                                          value > -0.8 ? '#FED976' :
                                          value > -2 ? '#FD8D3C' :
                                          value > -3 ? '#E31A1C' :
                                          '#800026';
                                  } else if ('${variable}' === 'ozone') {
                                      fillColor = value > 320 ? '#3F007D' :
                                          value > 310 ? '#5E009A' :
                                          value > 300 ? '#7800B3' :
                                          value > 290 ? '#9C179E' :
                                          value > 280 ? '#C22F89' :
                                          value > 275 ? '#D85799' :
                                          value > 270 ? '#E67BA7' :
                                          value > 265 ? '#F792B2' :
                                          value > 260 ? '#FAB9CD' :
                                          value > 255 ? '#FDC9D8' :
                                          value > 250 ? '#FDD9E2' :
                                          value > 240 ? '#FEE9EF' :
                                          '#FFF5FA';
                                  } else if ('${variable}' === 'ndvi') {
                                      fillColor = value > 0.75 ? '#006400' :
                                          value > 0.65 ? '#228B22' :
                                          value > 0.55 ? '#32CD32' :
                                          value > 0.45 ? '#66CDAA' :
                                          value > 0.35 ? '#98FB98' :
                                          value > 0.25 ? '#90EE90' :
                                          value > 0.15 ? '#B0E57C' :
                                          value > 0.05 ? '#C1F0A5' :
                                          '#F0FFF0';
                                  } else if ('${variable}' === 'total_precipitation') {
                                      fillColor = value > 32.84 ? '#08306b' :
                                          value > 20 ? '#08519c' :
                                          value > 10 ? '#2171b5' :
                                          value > 5 ? '#4292c6' :
                                          value > 2 ? '#6baed6' :
                                          value > 1.5 ? '#9ecae1' :
                                          value > 0.5 ? '#c6dbef' :
                                          value > 0.3 ? '#deebf7' :
                                          value > 0 ? '#f7fbff' :
                                          '#ffffff';
                                  } else {
                                      fillColor = '#cccccc';
                                  }

                                    return {
                                        fillColor: fillColor,
                                        weight: 2,
                                        opacity: 1,
                                        color: 'white',
                                        dashArray: '3',
                                        fillOpacity: 0.7
                                    };
                                };

                                const layer = L.geoJSON(geojsonData, { style }).addTo(map);

                                // Wait for tiles to load
                                map.whenReady(() => {
                                    // Additional delay to ensure everything is rendered
                                    setTimeout(() => {
                                        window.mapLoadComplete = true;
                                        resolve();
                                    }, 2000);
                                });
                            });
                        }

                        // Initialize map and signal when complete
                        initMap().then(() => {
                            window.mapLoadComplete = true;
                        });
                    </script>
                </body>
            </html>
        `;

        await page.setContent(htmlContent);
        await page.waitForSelector("#map");
        // Wait for map to be fully loaded
        await page.waitForFunction(
            () => {
                const mapElement = document.querySelector("#map");
                // Check if Leaflet has been initialized
                return mapElement && mapElement._leaflet_id !== undefined;
            },
            { timeout: 15000 }
        );
        await page.waitForFunction("window.mapLoadComplete === true", {
            timeout: 15000, // Increased timeout
        });
        await page.evaluate(() => {
            const mapElement = document.querySelector("#map");
            console.log("Map element:", mapElement);
            console.log("Map dimensions:", mapElement.getBoundingClientRect());
            // Check if Leaflet is initialized
            console.log(
                "Leaflet initialized:",
                mapElement._leaflet_id !== undefined
            );
        });

        // Take the screenshot
        const screenshot = await page.screenshot({
            type: "png",
            fullPage: true,
            omitBackground: false,
        });
        res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Length": screenshot.length,
        });
        await fs.promises.writeFile("screenshots/debug-map.png", screenshot);
        res.end(screenshot);

        await browser.close();
    } catch (error) {
        console.error("Error generating map image:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

app.post("/api/generate-map-range", async (req, res) => {
    const { variable, startDate, endDate, district } = req.body;

    if (!startDate || !endDate || !variable) {
        return res
            .status(400)
            .send({ error: "Start date, end date, and variable are required" });
    }

    try {
        // Helper function to generate a map for a specific date
        const generateMapForDate = async (date) => {
            console.log("Generating map for date:", date); // Debugging line

            const baseQuery = `
                SELECT d.district, ST_AsGeoJSON(d.geom) AS geometry, t.value
                FROM district_boundaries d
                JOIN ${variable} t ON d.district = t.district_name
                WHERE t.timestamp = $1
            `;
            value = [date];
            const result = await pool.query(baseQuery, value);

            if (!result.rows.length) {
                throw new Error("No data found for this date.");
            }

            const geojson = {
                type: "FeatureCollection",
                features: result.rows.map((row) => ({
                    type: "Feature",
                    geometry: JSON.parse(row.geometry),
                    properties: {
                        district: row.district,
                        [variable]: row.value,
                    },
                })),
            };

            // Launch browser with specific settings
            const browser = await puppeteer.launch({
                headless: "new",
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
            const page = await browser.newPage();

            // Set a larger viewport
            await page.setViewport({
                width: 1200,
                height: 800,
                deviceScaleFactor: 2, // For better resolution
            });

            // Create the HTML content (same as before)
            const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Map Export</title>
                    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                    <style>
                        body, html { margin: 0; padding: 0; height: 100vh; width: 100vw; }
                        #map { width: 100%; height: 100%; }
                    </style>
                </head>
                <body>
                    <div id="map"></div>
                    <script>
                        const geojsonData = ${JSON.stringify(geojson)};

                        function initMap() {
                            return new Promise((resolve) => {
                                const map = L.map('map', {
                                    zoomControl: false,
                                    attributionControl: false
                                }).setView([28.3949, 84.1240], 7);

                                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}.png', {
                                    maxZoom: 12,
                                    minZoom: 7
                                }).addTo(map);

                                const style = (feature) => {
                                    const value = feature.properties['${variable}'];
                                    let fillColor;
                                    if ('${variable}' === 'tas_min || ${variable}' === 'tas_max' || ${variable}' === 'tas) {
                                      fillColor = value > 310 ? '#FF0000' :
                                                value > 305 ? '#FF3300' :
                                                value > 300 ? '#FF6600' :
                                                value > 295 ? '#FF9900' :
                                                value > 290 ? '#FFCC00' :
                                                value > 285 ? '#FFFF00' :
                                                value > 280 ? '#FFFF66' :
                                                value > 275 ? '#99CCFF' :
                                                value > 270 ? '#66B3FF' :
                                                value > 265 ? '#3399FF' :
                                                value > 260 ? '#0066FF' :
                                                value > 255 ? '#0033CC' :
                                                '#0000FF';
                                  } else if ('${variable}' === 'sfc_windspeed'){
                                      fillColor = value > 3.9 ? '#3E1A8E' :  
                                          value > 3.8 ? '#5A2A9B' :  
                                          value > 3.7 ? '#7F4AB8' :  
                                          value > 3.6 ? '#9B6DCD' :  
                                          value > 3.5 ? '#B79FDC' :  
                                          value > 3.4 ? '#D4C1E8' :  
                                          value > 3.3 ? '#E8D7F4' :  
                                          value > 3.2 ? '#F1E5FB' :  
                                          value > 3.1 ? '#D0D9F5' :  
                                          value > 3 ? '#A3B9F2' :  
                                          value > 2.9 ? '#7DA9EE' :  
                                          value > 2.8 ? '#539FE5' :  
                                          value > 2.7 ? '#1F8FD5' :  
                                          '#0F72B0';  
                                  } else if ('${variable}' === 'precipitation_rate') {
                                      fillColor = value > 30 ? '#0A0F44' :
                                          value > 20 ? '#162A5B' :
                                          value > 10 ? '#203E73' :
                                          value > 7 ? '#2B5A91' :
                                          value > 5 ? '#3A77AD' :
                                          value > 4 ? '#518ECC' :
                                          value > 3 ? '#6CA3DF' :
                                          value > 2 ? '#87B6E9' :
                                          value > 1.76 ? '#A3C8F1' :
                                          value > 1.5 ? '#B7D5F6' :
                                          value > 1.2 ? '#C7E0FA' :
                                          value > 1.0 ? '#D8EBFD' :
                                          value > 0.8 ? '#E9F4FF' :
                                          value > 0.76 ? '#E0F7FF' :
                                          value > 0.6 ? '#D1F2FF' :
                                          value > 0.5 ? '#A3D8FF' :
                                          value > 0.4 ? '#7EC2FF' :
                                          value > 0.35 ? '#4AB5FF' :
                                          value > 0.27 ? '#1B8CFF' :
                                          '#006BB3';
                                  } else if ('${variable}' === 'huss') {
                                      fillColor = value > 0.034 ? '#084594' :
                                          value > 0.025 ? '#2171b5' :
                                          value > 0.018 ? '#4292c6' :
                                          value > 0.014 ? '#6baed6' :
                                          value > 0.010 ? '#9ecae1' :
                                          value > 0.007 ? '#c6dbef' :
                                          value > 0.005 ? '#deebf7' :
                                          value > 0.002 ? '#fee090' :
                                          value > 0.0005 ? '#fdae61' :
                                          '#f46d43';
                                  } else if ('${variable}' === 'hurs') {
                                      fillColor = value > 100 ? '#54278f' :
                                          value > 90 ? '#08519c' :
                                          value > 80 ? '#3182bd' :
                                          value > 70 ? '#6baed6' :
                                          value > 60 ? '#9ecae1' :
                                          value > 50 ? '#c6dbef' :
                                          value > 40 ? '#edf8b1' :
                                          value > 30 ? '#fdae61' :
                                          value > 20 ? '#f46d43' :
                                          value > 10 ? '#d73027' :
                                          '#a50026';
                                  } else if ('${variable}' === 'snowfall') {
                                      fillColor = value > 0.01 ? '#003366' :
                                          value > 0.005 ? '#004488' :
                                          value > 0.002 ? '#0055AA' :
                                          value > 0.001 ? '#0077CC' :
                                          value > 0.0005 ? '#3399DD' :
                                          value > 0.0001 ? '#66BBEE' :
                                          value > 0.00001 ? '#99DDF8' :
                                          value > 0.000001 ? '#D8EBFD' :
                                          '#C7E0FA';
                                  } else if ('${variable}' === 'snowmelt') {
                                      fillColor = value > 0.01 ? '#0A0F44' :
                                          value > 0.005 ? '#162A5B' :
                                          value > 0.001 ? '#203E73' :
                                          value > 0.0005 ? '#2B5A91' :
                                          value > 0.0002 ? '#3A77AD' :
                                          value > 0.0001 ? '#518ECC' :
                                          value > 0.00001 ? '#6CA3DF' :
                                          value > 1e-6 ? '#87B6E9' :
                                          value > 1e-7 ? '#A3C8F1' :
                                          value > 1e-9 ? '#B7D5F6' :
                                          value > 1e-11 ? '#C7E0FA' :
                                          '#D8EBFD';
                                  } else if ('${variable}' === 'spei') {
                                      fillColor = value > 3 ? '#00441B' :
                                          value > 2 ? '#1B7837' :
                                          value > 1 ? '#5AAE61' :
                                          value > 0.6 ? '#A6D96A' :
                                          value > 0.1 ? '#D9F0A3' :
                                          value > -0.1 ? '#FFFFBF' :
                                          value > -0.8 ? '#FED976' :
                                          value > -2 ? '#FD8D3C' :
                                          value > -3 ? '#E31A1C' :
                                          '#800026';
                                  } else if ('${variable}' === 'ozone') {
                                      fillColor = value > 320 ? '#3F007D' :
                                          value > 310 ? '#5E009A' :
                                          value > 300 ? '#7800B3' :
                                          value > 290 ? '#9C179E' :
                                          value > 280 ? '#C22F89' :
                                          value > 275 ? '#D85799' :
                                          value > 270 ? '#E67BA7' :
                                          value > 265 ? '#F792B2' :
                                          value > 260 ? '#FAB9CD' :
                                          value > 255 ? '#FDC9D8' :
                                          value > 250 ? '#FDD9E2' :
                                          value > 240 ? '#FEE9EF' :
                                          '#FFF5FA';
                                  } else if ('${variable}' === 'ndvi') {
                                      fillColor = value > 0.75 ? '#006400' :
                                          value > 0.65 ? '#228B22' :
                                          value > 0.55 ? '#32CD32' :
                                          value > 0.45 ? '#66CDAA' :
                                          value > 0.35 ? '#98FB98' :
                                          value > 0.25 ? '#90EE90' :
                                          value > 0.15 ? '#B0E57C' :
                                          value > 0.05 ? '#C1F0A5' :
                                          '#F0FFF0';
                                  } else if ('${variable}' === 'total_precipitation') {
                                      fillColor = value > 32.84 ? '#08306b' :
                                          value > 20 ? '#08519c' :
                                          value > 10 ? '#2171b5' :
                                          value > 5 ? '#4292c6' :
                                          value > 2 ? '#6baed6' :
                                          value > 1.5 ? '#9ecae1' :
                                          value > 0.5 ? '#c6dbef' :
                                          value > 0.3 ? '#deebf7' :
                                          value > 0 ? '#f7fbff' :
                                          '#ffffff';
                                  } else {
                                      fillColor = '#cccccc';
                                  }

                                    return {
                                        fillColor: fillColor,
                                        weight: 2,
                                        opacity: 1,
                                        color: 'white',
                                        dashArray: '3',
                                        fillOpacity: 0.7
                                    };
                                };

                                const layer = L.geoJSON(geojsonData, { style }).addTo(map);

                                // Wait for tiles to load
                                map.whenReady(() => {
                                    // Additional delay to ensure everything is rendered
                                    setTimeout(() => {
                                        window.mapLoadComplete = true;
                                        resolve();
                                    }, 2000);
                                });
                            });
                        }

                        // Initialize map and signal when complete
                        initMap().then(() => {
                            window.mapLoadComplete = true;
                        });
                    </script>
                </body>
            </html>
        `;

            await page.setContent(htmlContent);
            await page.waitForSelector("#map");
            await page.waitForFunction(() => window.mapLoadComplete === true, {
                timeout: 15000,
            });

            // Take screenshot
            const screenshot = await page.screenshot({
                type: "png",
                fullPage: true,
                omitBackground: false,
            });
            await browser.close();
            return screenshot;
        };

        const start = new Date(startDate);
        const end = new Date(endDate);
        const imageUrls = [];
        for (
            let date = new Date(start);
            date <= end;
            date.setMonth(date.getMonth() + 1)
        ) {
            // Set the day to the 1st of the month (in case it's not already the 1st)
            date.setDate(1);
            const dateStr = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
            console.log("Generating map for:", dateStr); // Debugging line
            const screenshot = await generateMapForDate(dateStr);

            // Save the image file (you can store it locally or in a cloud storage service)
            const imageFilePath = `maps/map_${dateStr}.png`;
            await fs.promises.writeFile(imageFilePath, screenshot);
            // Add the image file path or URL to the response
            imageUrls.push(`/${imageFilePath}`);
        }

        // Send a response with all generated map URLs
        await fetch("http://localhost:5000/api/generate-gif");

        const outputPath = path.resolve(__dirname, "output", "output.gif");

        res.setHeader("Content-Type", "image/gif");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="generated.gif"'
        );
        res.setHeader("Cache-Control", "no-cache");

        const fileStream = fs.createReadStream(outputPath);
        fileStream.pipe(res);

        // Handle errors in the stream
        fileStream.on("error", (error) => {
            console.error("Error streaming file:", error);
            res.status(500).send("Error streaming file");
        });
    } catch (error) {
        console.error("Error generating maps:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});
// Add a debug endpoint to see the HTML content
app.get("/api/debug-map-html", async (req, res) => {
    const { variable, date, district } = req.query;

    if (!date || !variable) {
        return res
            .status(400)
            .send({ error: "Date and variable are required" });
    }

    try {
        // Fetch GeoJSON data
        const baseQuery = `
            SELECT d.district, ST_AsGeoJSON(d.geom) AS geometry, t.value
            FROM district_boundaries d
            JOIN ${variable} t
            ON d.district = t.district_name
        `;
        const { query, values } = buildConditions(baseQuery, {
            date,
            district,
        });
        const result = await pool.query(query, values);
        const geojson = {
            type: "FeatureCollection",
            features: result.rows.map((row) => ({
                type: "Feature",
                geometry: JSON.parse(row.geometry),
                properties: {
                    district: row.district,
                    [variable]: row.value,
                },
            })),
        };

        // Create the HTML content
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Map Export Debug</title>
                    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                    <style>
                        body, html { margin: 0; padding: 0; height: 100vh; width: 100vw; }
                        #map { width: 100%; height: 100%; }
                    </style>
                </head>
                <body>
                    <div id="map"></div>
                    <script>
                        // Debug: Log the data
                        const geojsonData = ${JSON.stringify(geojson)};
                        console.log('GeoJSON Data:', geojsonData);

                        function initMap() {
                            console.log('Initializing map...');
                            const map = L.map('map', {
                                zoomControl: true,
                                attributionControl: true
                            }).setView([28.3949, 84.1240], 7);

                            console.log('Adding tile layer...');
                            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}.png', {
                                maxZoom: 12,
                                minZoom: 7
                            }).addTo(map);

                            console.log('Creating style function...');
                            const style = (feature) => {
                                const value = feature.properties['${variable}'];
                                console.log('Styling feature:', feature.properties.district, 'value:', value);
                                
                                let fillColor;
                                    if ('${variable}' === 'tas_min || ${variable}' === 'tas_max' || ${variable}' === 'tas) {
                                      fillColor = value > 310 ? '#FF0000' :
                                                value > 305 ? '#FF3300' :
                                                value > 300 ? '#FF6600' :
                                                value > 295 ? '#FF9900' :
                                                value > 290 ? '#FFCC00' :
                                                value > 285 ? '#FFFF00' :
                                                value > 280 ? '#FFFF66' :
                                                value > 275 ? '#99CCFF' :
                                                value > 270 ? '#66B3FF' :
                                                value > 265 ? '#3399FF' :
                                                value > 260 ? '#0066FF' :
                                                value > 255 ? '#0033CC' :
                                                '#0000FF';
                                  } else if ('${variable}' === 'sfc_windspeed'){
                                      fillColor = value > 3.9 ? '#3E1A8E' :  
                                          value > 3.8 ? '#5A2A9B' :  
                                          value > 3.7 ? '#7F4AB8' :  
                                          value > 3.6 ? '#9B6DCD' :  
                                          value > 3.5 ? '#B79FDC' :  
                                          value > 3.4 ? '#D4C1E8' :  
                                          value > 3.3 ? '#E8D7F4' :  
                                          value > 3.2 ? '#F1E5FB' :  
                                          value > 3.1 ? '#D0D9F5' :  
                                          value > 3 ? '#A3B9F2' :  
                                          value > 2.9 ? '#7DA9EE' :  
                                          value > 2.8 ? '#539FE5' :  
                                          value > 2.7 ? '#1F8FD5' :  
                                          '#0F72B0';  
                                  } else if ('${variable}' === 'precipitation_rate') {
                                      fillColor = value > 30 ? '#0A0F44' :
                                          value > 20 ? '#162A5B' :
                                          value > 10 ? '#203E73' :
                                          value > 7 ? '#2B5A91' :
                                          value > 5 ? '#3A77AD' :
                                          value > 4 ? '#518ECC' :
                                          value > 3 ? '#6CA3DF' :
                                          value > 2 ? '#87B6E9' :
                                          value > 1.76 ? '#A3C8F1' :
                                          value > 1.5 ? '#B7D5F6' :
                                          value > 1.2 ? '#C7E0FA' :
                                          value > 1.0 ? '#D8EBFD' :
                                          value > 0.8 ? '#E9F4FF' :
                                          value > 0.76 ? '#E0F7FF' :
                                          value > 0.6 ? '#D1F2FF' :
                                          value > 0.5 ? '#A3D8FF' :
                                          value > 0.4 ? '#7EC2FF' :
                                          value > 0.35 ? '#4AB5FF' :
                                          value > 0.27 ? '#1B8CFF' :
                                          '#006BB3';
                                  } else if ('${variable}' === 'huss') {
                                      fillColor = value > 0.034 ? '#084594' :
                                          value > 0.025 ? '#2171b5' :
                                          value > 0.018 ? '#4292c6' :
                                          value > 0.014 ? '#6baed6' :
                                          value > 0.010 ? '#9ecae1' :
                                          value > 0.007 ? '#c6dbef' :
                                          value > 0.005 ? '#deebf7' :
                                          value > 0.002 ? '#fee090' :
                                          value > 0.0005 ? '#fdae61' :
                                          '#f46d43';
                                  } else if ('${variable}' === 'hurs') {
                                      fillColor = value > 100 ? '#54278f' :
                                          value > 90 ? '#08519c' :
                                          value > 80 ? '#3182bd' :
                                          value > 70 ? '#6baed6' :
                                          value > 60 ? '#9ecae1' :
                                          value > 50 ? '#c6dbef' :
                                          value > 40 ? '#edf8b1' :
                                          value > 30 ? '#fdae61' :
                                          value > 20 ? '#f46d43' :
                                          value > 10 ? '#d73027' :
                                          '#a50026';
                                  } else if ('${variable}' === 'snowfall') {
                                      fillColor = value > 0.01 ? '#003366' :
                                          value > 0.005 ? '#004488' :
                                          value > 0.002 ? '#0055AA' :
                                          value > 0.001 ? '#0077CC' :
                                          value > 0.0005 ? '#3399DD' :
                                          value > 0.0001 ? '#66BBEE' :
                                          value > 0.00001 ? '#99DDF8' :
                                          value > 0.000001 ? '#D8EBFD' :
                                          '#C7E0FA';
                                  } else if ('${variable}' === 'snowmelt') {
                                      fillColor = value > 0.01 ? '#0A0F44' :
                                          value > 0.005 ? '#162A5B' :
                                          value > 0.001 ? '#203E73' :
                                          value > 0.0005 ? '#2B5A91' :
                                          value > 0.0002 ? '#3A77AD' :
                                          value > 0.0001 ? '#518ECC' :
                                          value > 0.00001 ? '#6CA3DF' :
                                          value > 1e-6 ? '#87B6E9' :
                                          value > 1e-7 ? '#A3C8F1' :
                                          value > 1e-9 ? '#B7D5F6' :
                                          value > 1e-11 ? '#C7E0FA' :
                                          '#D8EBFD';
                                  } else if ('${variable}' === 'spei') {
                                      fillColor = value > 3 ? '#00441B' :
                                          value > 2 ? '#1B7837' :
                                          value > 1 ? '#5AAE61' :
                                          value > 0.6 ? '#A6D96A' :
                                          value > 0.1 ? '#D9F0A3' :
                                          value > -0.1 ? '#FFFFBF' :
                                          value > -0.8 ? '#FED976' :
                                          value > -2 ? '#FD8D3C' :
                                          value > -3 ? '#E31A1C' :
                                          '#800026';
                                  } else if ('${variable}' === 'ozone') {
                                      fillColor = value > 320 ? '#3F007D' :
                                          value > 310 ? '#5E009A' :
                                          value > 300 ? '#7800B3' :
                                          value > 290 ? '#9C179E' :
                                          value > 280 ? '#C22F89' :
                                          value > 275 ? '#D85799' :
                                          value > 270 ? '#E67BA7' :
                                          value > 265 ? '#F792B2' :
                                          value > 260 ? '#FAB9CD' :
                                          value > 255 ? '#FDC9D8' :
                                          value > 250 ? '#FDD9E2' :
                                          value > 240 ? '#FEE9EF' :
                                          '#FFF5FA';
                                  } else if ('${variable}' === 'ndvi') {
                                      fillColor = value > 0.75 ? '#006400' :
                                          value > 0.65 ? '#228B22' :
                                          value > 0.55 ? '#32CD32' :
                                          value > 0.45 ? '#66CDAA' :
                                          value > 0.35 ? '#98FB98' :
                                          value > 0.25 ? '#90EE90' :
                                          value > 0.15 ? '#B0E57C' :
                                          value > 0.05 ? '#C1F0A5' :
                                          '#F0FFF0';
                                  } else if ('${variable}' === 'total_precipitation') {
                                      fillColor = value > 32.84 ? '#08306b' :
                                          value > 20 ? '#08519c' :
                                          value > 10 ? '#2171b5' :
                                          value > 5 ? '#4292c6' :
                                          value > 2 ? '#6baed6' :
                                          value > 1.5 ? '#9ecae1' :
                                          value > 0.5 ? '#c6dbef' :
                                          value > 0.3 ? '#deebf7' :
                                          value > 0 ? '#f7fbff' :
                                          '#ffffff';
                                  } else {
                                      fillColor = '#cccccc';
                                  }

                                return {
                                    fillColor: fillColor,
                                    weight: 2,
                                    opacity: 1,
                                    color: 'white',
                                    dashArray: '3',
                                    fillOpacity: 0.7
                                };
                            };

                            console.log('Adding GeoJSON layer...');
                            L.geoJSON(geojsonData, { 
                                style: style,
                                onEachFeature: (feature, layer) => {
                                    layer.bindPopup(
                                        \`District: \${feature.properties.district}<br>
                                        Value: \${feature.properties['${variable}']}\`
                                    );
                                }
                            }).addTo(map);

                            console.log('Map initialization complete');
                        }

                        // Initialize map when DOM is ready
                        document.addEventListener('DOMContentLoaded', initMap);
                    </script>
                </body>
            </html>
        `;

        // Send the HTML content
        res.header("Content-Type", "text/html");
        res.send(htmlContent);
    } catch (error) {
        console.error("Error generating debug HTML:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

// Existing route for fetching tas_min data for a single date
app.get("/api/data", async (req, res) => {
    const { variable, date, district } = req.query;

    if (!date) {
        return res.status(400).send({ error: "Date is required" });
    }

    try {
        const baseQuery = `
            SELECT d.district, ST_AsGeoJSON(d.geom) AS geometry, t.value
            FROM district_boundaries d
            JOIN ${variable} t
            ON d.district = t.district_name
        `;
        const { query, values } = buildConditions(baseQuery, {
            date,
            district,
        });

        const result = await pool.query(query, values);
        const geojson = {
            type: "FeatureCollection",
            features: result.rows.map((row) => ({
                type: "Feature",
                geometry: JSON.parse(row.geometry),
                properties: {
                    district: row.district,
                    [variable]: row.value,
                },
            })),
        };

        res.json(geojson);
    } catch (error) {
        console.error("Error querying database:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

// New route for fetching tas_min data for a range of dates
app.get("/api/data-range", async (req, res) => {
    const { variable, date, startDate, endDate, district } = req.query;

    if (!variable) {
        return res.status(400).send({ error: "Variable is required" });
    }

    try {
        const baseQuery = `
            SELECT d.district, ST_AsGeoJSON(d.geom) AS geometry, t.timestamp, t.value
            FROM district_boundaries d
            JOIN ${variable} t
            ON d.district = t.district_name
        `;
        const { query, values } = buildConditions(baseQuery, {
            date,
            startDate,
            endDate,
            district,
        });

        const result = await pool.query(query, values);
        const geojson = {
            type: "FeatureCollection",
            features: result.rows.map((row) => ({
                type: "Feature",
                geometry: JSON.parse(row.geometry),
                properties: {
                    district: row.district,
                    value: row.value,
                    timestamp: row.timestamp,
                },
            })),
        };

        res.json(geojson);
    } catch (error) {
        console.error("Error querying database:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

// Route to fetch the list of districts
app.get("/api/districts", async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT district
            FROM district_boundaries
            ORDER BY district ASC;
        `;
        const result = await pool.query(query);

        const districts = result.rows.map((row) => row.district);
        res.json(districts);
    } catch (error) {
        console.error("Error querying database for districts:", error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

// Helper function to generate GIF
const generateGif = async () => {
    const encoder = new GIFEncoder(600, 400); // Set width and height for the GIF
    const outputPath = path.resolve(__dirname, "output", "output.gif"); // Use absolute path for output GIF

    // Create an output stream
    const writeStream = fs.createWriteStream(outputPath);
    encoder.createReadStream().pipe(writeStream);

    encoder.start();
    encoder.setRepeat(0); // 0 for infinite loop
    encoder.setDelay(300); // 500ms between frames

    const mapsFolderPath = path.join(__dirname, "maps");
    const imageFiles = fs.readdirSync(mapsFolderPath).filter(
        (file) => /\.(png|jpg|jpeg|gif)$/i.test(file) // Filter image files
    );

    // Iterate over the image files and add each image to the GIF
    for (const file of imageFiles) {
        const imagePath = path.join(mapsFolderPath, file);
        console.log(imagePath);
        const img = await loadImage(imagePath);

        const canvas = createCanvas(600, 400); // Set the canvas size
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 600, 400); // Draw image on canvas

        encoder.addFrame(ctx);
    }

    encoder.finish();
    return outputPath;
};

// Create endpoint to generate GIF
app.get("/api/generate-gif", async (req, res) => {
    try {
        const gifPath = await generateGif();
        res.send({ message: "ok" });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error generating GIF");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
