import React, { useState, useEffect } from 'react';
import { BarChart, Bar, Tooltip, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { useDataRange } from '../hooks/useDataRange';

const BarChartComponent = ({ selectedRegion, selectedDistrict, dateRange, selectedVariable }) => {
    const { chartData, loading, error } = useDataRange(selectedDistrict, dateRange, selectedVariable);

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

  // Calculate Y-axis domain based on data
  const calculateYAxisDomain = () => {
    if (chartData.length === 0) return [0, 1];

    const values = chartData.map(item => item.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    const padding = range * 0.5;

    return [minValue - padding, maxValue + padding];
};

if (error) {
    return (
        <div className="bg-white p-4 rounded-lg mb-4">
            <div className="flex justify-center items-center h-64">
                <p className="text-red-600">Error loading data: {error}</p>
            </div>
        </div>
    );
}

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
        <ResponsiveContainer width="100%" height={300}>
          <BarChart width={800} height={600} data={chartData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" tick={{ fontSize: 8 }} />
            <YAxis 
              domain={calculateYAxisDomain()}
              label={{ 
                value: `${selectedVariable}`, // Dynamically show variable label
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }} 
              tickFormatter={(value) => value.toFixed(3)}
              allowDataOverflow={true}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Legend />
            <Bar
              dataKey="value" // Use the generic `value` key for the selected variable
              fill="#FF6384"
              isAnimationActive={false}
              activeDot={false} // Remove default active dot styling
            />           
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default BarChartComponent;
