// hooks/useDataRange.js
import { useState, useEffect } from 'react';

export const useDataRange = (selectedDistrict, dateRange, selectedVariable) => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            // Only fetch if we have all required parameters
            if (!selectedDistrict || !dateRange.startDate || !dateRange.endDate || !selectedVariable) {
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `http://localhost:5000/api/data-range?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&district=${selectedDistrict}&variable=${selectedVariable}`
                );
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const geoJsonData = await response.json();
                
                // Transform GeoJSON features into chart data
                const transformedData = geoJsonData.features
                    .map((feature) => ({
                        date: feature.properties.timestamp.split('T')[0],
                        value: Number(feature.properties.value),
                    }))
                    .sort((a, b) => new Date(a.date) - new Date(b.date));

                setChartData(transformedData);
            } catch (err) {
                console.error('Error fetching data-range data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedDistrict, dateRange.startDate, dateRange.endDate, selectedVariable]);

    return { chartData, loading, error };
};