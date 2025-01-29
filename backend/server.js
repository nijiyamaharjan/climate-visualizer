require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:5173',
}));

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
        conditions.push(`t.timestamp::DATE BETWEEN $${values.length + 1} AND $${values.length + 2}`);
        values.push(params.startDate, params.endDate);
    }

    if (params.district) {
        conditions.push(`d.district = $${values.length + 1}`);
        values.push(params.district);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return {
        query: `${baseQuery} ${whereClause};`,
        values,
    };
};

// Existing route for fetching tas_min data for a single date
app.get('/api/data', async (req, res) => {
    const { variable, date, district } = req.query;

    if (!date) {
        return res.status(400).send({ error: 'Date is required' });
    }

    try {
        const baseQuery = `
            SELECT d.district, ST_AsGeoJSON(d.geom) AS geometry, t.value
            FROM district_boundaries d
            JOIN ${variable} t
            ON d.district = t.district_name
        `;
        const { query, values } = buildConditions(baseQuery, { date, district });

        const result = await pool.query(query, values);
        const geojson = {
            type: 'FeatureCollection',
            features: result.rows.map(row => ({
                type: 'Feature',
                geometry: JSON.parse(row.geometry),
                properties: {
                    district: row.district,
                    [variable] : row.value,
                },
            })),
        };

        res.json(geojson);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// New route for fetching tas_min data for a range of dates
app.get('/api/data-range', async (req, res) => {
    const { variable, date, startDate, endDate, district } = req.query;

    if (!variable) {
        return res.status(400).send({ error: 'Variable is required' });
    }

    try {
        const baseQuery = `
            SELECT d.district, ST_AsGeoJSON(d.geom) AS geometry, t.timestamp, t.value
            FROM district_boundaries d
            JOIN ${variable} t
            ON d.district = t.district_name
        `;
        const { query, values } = buildConditions(baseQuery, { date, startDate, endDate, district });

        const result = await pool.query(query, values);
        const geojson = {
            type: 'FeatureCollection',
            features: result.rows.map(row => ({
                type: 'Feature',
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
        console.error('Error querying database:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Route to fetch the list of districts
app.get('/api/districts', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT district
            FROM district_boundaries
            ORDER BY district ASC;
        `;
        const result = await pool.query(query);

        const districts = result.rows.map(row => row.district);
        res.json(districts);
    } catch (error) {
        console.error('Error querying database for districts:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
