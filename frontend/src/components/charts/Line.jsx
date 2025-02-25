import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useDataRange } from "../../hooks/useDataRange";
import dayjs from "dayjs";
import useDownloadImage from "../../hooks/useDownloadImage"; // Import the custom hook

// Function to calculate the linear regression trend line
const calculateTrendLine = (data) => {
    const n = data.length;
    const xValues = data.map((_, index) => index);
    const yValues = data.map((item) => item.value);

    // Calculate sums needed for the regression formula
    const sumX = xValues.reduce((acc, val) => acc + val, 0);
    const sumY = yValues.reduce((acc, val) => acc + val, 0);
    const sumXY = xValues.reduce(
        (acc, val, idx) => acc + val * yValues[idx],
        0
    );
    const sumX2 = xValues.reduce((acc, val) => acc + val * val, 0);

    // Calculate the slope (m) and intercept (b) for the trend line
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate trend line data
    return xValues.map((x) => {
        return { date: data[x].date, value: slope * x + intercept };
    });
};

export default function LineChartComponent({
    selectedRegion,
    selectedDistrict,
    dateRange,
    selectedVariable,
}) {
    const { chartData, loading, error } = useDataRange(
        selectedDistrict,
        dateRange,
        selectedVariable
    );
    const { downloadImage } = useDownloadImage(); // Use the custom hook

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border rounded">
                    <p className="text-sm font-medium">{`Date: ${dayjs(
                        label
                    ).format("MMM YYYY")}`}</p>
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

        const values = chartData.map((item) => item.value);
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

    // Calculate the trend line based on the chart data
    const trendLineData = calculateTrendLine(chartData);

    return (
        <div className="bg-white p-4 rounded-lg mb-4 h-[400px]">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-600">Loading data...</p>
                </div>
            ) : chartData.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-600">
                        Select region and date range.
                    </p>
                </div>
            ) : (
                <div>
                    <ResponsiveContainer width="100%" height={300} id="line">
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
                                tickFormatter={(tick) =>
                                    dayjs(tick).format("MMM YYYY")
                                } // Format tick as Month Year
                            />
                            <YAxis
                                domain={calculateYAxisDomain()}
                                label={{
                                    value: `${selectedVariable}`,
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: "middle" },
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
                            {/* Add the dotted trend line with lighter green color */}
                            <Line
                                type="linear"
                                dataKey="value"
                                name="trend"
                                data={trendLineData} // Trend line data
                                stroke="#90EE90" // Lighter green color
                                dot={false}
                                strokeWidth={2}
                                isAnimationActive={false}
                                strokeDasharray="5 5" // Dotted line
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    <button
                        onClick={() => downloadImage("line", "line-chart.png")}
                        className="mt-4 p-2 bg-blue-500 text-white rounded"
                    >
                        Download Chart as PNG
                    </button>
                </div>
            )}
        </div>
    );
}
