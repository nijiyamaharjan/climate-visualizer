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

// API endpoint to fetch tas_min data
app.get('/api/tasmin', async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).send({ error: 'Date is required' });
    }

    try {
        const query = `
            SELECT d.district, ST_AsGeoJSON(d.geom) AS geometry, t.value
            FROM district_boundaries d
            JOIN tas_min t
            ON d.district = t.district_name
            WHERE t.timestamp::DATE = $1;
        `;
        const result = await pool.query(query, [date]);
        const geojson = {
            type: 'FeatureCollection',
            features: result.rows.map(row => ({
                type: 'Feature',
                geometry: JSON.parse(row.geometry),
                properties: {
                    district: row.district,
                    temperature: row.value,
                },
            })),
        };
        console.log(geojson.features.properties)

        res.json(geojson);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
