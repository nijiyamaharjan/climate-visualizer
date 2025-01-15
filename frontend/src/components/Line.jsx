import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BsThermometerHalf } from 'react-icons/bs';

export default function LineChartComponent({ selectedRegion, selectedDistrict, dateRange }) {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Function to fetch data for a specific region and date range
    const fetchDataForRange = async (district, startDate, endDate) => {
        if (!district || !startDate || !endDate) return; // Only fetch data if all values are selected

        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:5000/api/tasmin-range?startDate=${startDate}&endDate=${endDate}&district=${district}`
            );
            console.log(response)
            const geoJsonData = await response.json();

            // Transform GeoJSON features into chart data
            const transformedData = geoJsonData.features
                .map((feature) => ({
                    date: feature.properties.timestamp.split('T')[0],
                    temperature: Number((feature.properties.temperature - 273.15).toFixed(2)), // Convert Kelvin to Celsius with 2 decimal places
                }))
                .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

            setChartData(transformedData);
        } catch (error) {
            console.error('Error fetching tasmin-range data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when either the selected district or date range changes, but only if all are selected
    useEffect(() => {
        if (selectedDistrict && dateRange.startDate && dateRange.endDate) {
            fetchDataForRange(
                selectedDistrict,
                dateRange.startDate,
                dateRange.endDate
            );
        }
    }, [selectedDistrict, dateRange.startDate, dateRange.endDate]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border rounded">
                    <p className="text-sm font-medium">{`Date: ${label}`}</p>
                    <p className="text-sm text-red-500">
                        {`Temperature: ${payload[0].value}°C`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Empty space for now */}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-600">Loading data...</p>
                </div>
            ) : chartData.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-600">No data available for the selected region and date range.</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="date" 
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                            label={{ 
                                value: 'Temperature (°C)', 
                                angle: -90, 
                                position: 'insideLeft',
                                style: { textAnchor: 'middle' }
                            }} 
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="temperature" 
                            name="Temperature"
                            stroke="#FF6384" 
                            dot={false}
                            activeDot={{ r: 6 }} 
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
