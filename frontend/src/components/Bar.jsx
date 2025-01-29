import React, { useState, useEffect } from 'react';
import { BarChart, Bar, Tooltip, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

const BarChartComponent = ({ selectedRegion, selectedDistrict, dateRange, selectedVariable }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDataForRange = async (district, startDate, endDate, variable) => {
    if (!district || !startDate || !endDate || !variable) return; // Only fetch data if all values are selected

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/data-range?startDate=${startDate}&endDate=${endDate}&district=${district}&variable=${variable}`
      );
      console.log(response);
      const geoJsonData = await response.json();

      // Transform GeoJSON features into chart data
      const transformedData = geoJsonData.features
        .map((feature) => ({
          date: feature.properties.timestamp.split('T')[0],
          value: Number((feature.properties.value)), // Generalized for any variable
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

      setChartData(transformedData);
    } catch (error) {
      console.error('Error fetching data-range data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDistrict && dateRange.startDate && dateRange.endDate) {
      fetchDataForRange(
        selectedDistrict,
        dateRange.startDate,
        dateRange.endDate,
        selectedVariable
      );
    }
  }, [selectedDistrict, dateRange.startDate, dateRange.endDate, selectedVariable]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="text-sm font-medium">{`Date: ${label}`}</p>
          <p className="text-sm text-red-500">
            {`${selectedVariable}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-lg mb-4">
      {/* Loading or no data message */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Loading data...</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">No data available for the selected region and date range.</p>
        </div>
      ) : (
        // Render chart when data is available
        <ResponsiveContainer width="100%" height={500}>
          <BarChart width={600} height={600} data={chartData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" tick={{ fontSize: 8 }} />
            <YAxis 
              label={{ 
                value: `${selectedVariable}`, // Dynamically show variable label
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }} 
            />
            <Legend />
            <Bar
              dataKey="value" // Use the generic `value` key for the selected variable
              fill="#FF6384"
              isAnimationActive={false}
              activeDot={false} // Remove default active dot styling
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default BarChartComponent;
