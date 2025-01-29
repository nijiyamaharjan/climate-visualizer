import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDataRange } from '../hooks/useDataRange';

export default function LineChartComponent({ selectedRegion, selectedDistrict, dateRange, selectedVariable }) {
    const { chartData, loading, error } = useDataRange(selectedDistrict, dateRange, selectedVariable);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border rounded">
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
                    <LineChart 
                        data={chartData} 
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="date" 
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                            domain={calculateYAxisDomain()}
                            label={{ 
                                value: `${selectedVariable}`, 
                                angle: -90, 
                                position: 'insideLeft',
                                style: { textAnchor: 'middle' }
                            }}
                            tickFormatter={(value) => value.toFixed(3)}
                            allowDataOverflow={true}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="value"
                            name={selectedVariable}
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