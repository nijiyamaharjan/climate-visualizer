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
import useDownloadImage from "../../hooks/useDownloadImage";

// Function to calculate the linear regression trend line
const calculateTrendLine = (data) => {
    const n = data.length;
    const xValues = data.map((_, index) => index);
    const yValues = data.map((item) => item.value);

    const sumX = xValues.reduce((acc, val) => acc + val, 0);
    const sumY = yValues.reduce((acc, val) => acc + val, 0);
    const sumXY = xValues.reduce(
        (acc, val, idx) => acc + val * yValues[idx],
        0
    );
    const sumX2 = xValues.reduce((acc, val) => acc + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return xValues.map((x) => {
        return { date: data[x].date, value: slope * x + intercept };
    });
};

const getVariableName = (variable) => {
    const names = {
        tas_min: "Min. Temperature (K)",
        tas_max: "Max. Temperature (K)",
        tas: "Average Temperature (K)",
        hurs: "Relative Humidity (%)",
        huss: "Specific Humidity (Mass fraction)",
        total_precipitation: "Total Precipitation (m)",
        precipitation_rate: "Precipitation Rate (g/m^2/s)",
        snowfall: "Snowfall (m of water equivalent)",
        snowmelt: "Snowmelt (m of water equivalent)",
        spei: "SPEI",
        ozone: "Ozone (Dobson Unit)",
        ndvi: "NDVI",
        sfc_windspeed: "Surface Wind Speed (m/s)",
    };
    return names[variable] || variable;
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
    const { downloadImage } = useDownloadImage();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border rounded">
                    <p className="text-sm font-medium">{`${dayjs(
                        label
                    ).format("MMM YYYY")}`}</p>
                    <p className="text-sm text-red-500">
                        {`${getVariableName(selectedVariable)}: ${
                            payload[0].value
                        }`}
                    </p>
                </div>
            );
        }
        return null;
    };

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
        <div className="bg-white p-2 rounded-lg mb-4 h-[400px]">
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
                            margin={{ top: 5, right: 10, left: 30, bottom: 5 }} 
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
                                }
                            />
                            <YAxis
                                domain={calculateYAxisDomain()}
                                label={{
                                    value: getVariableName(selectedVariable),
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: "middle" },
                                    dx: -20, // Moves label slightly left
                                    dy: 20, // Adjusts vertical alignment
                                }}
                                tickFormatter={(value) => value.toFixed(3)}
                                allowDataOverflow={true}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="value"
                                name={getVariableName(selectedVariable)}
                                stroke="#FF6384"
                                dot={false}
                                activeDot={{ r: 6 }}
                                isAnimationActive={false}
                            />
                            <Line
                                type="linear"
                                dataKey="value"
                                name="trend"
                                data={trendLineData}
                                stroke="#90EE90"
                                dot={false}
                                strokeWidth={2}
                                isAnimationActive={false}
                                strokeDasharray="5 5"
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
