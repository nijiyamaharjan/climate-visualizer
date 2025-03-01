import React, { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useDataRange } from "../../hooks/useDataRange";
import dayjs from "dayjs";
import useDownloadImage from "../../hooks/useDownloadImage";

const BarChartComponent = ({
    selectedRegion,
    selectedDistrict,
    dateRange,
    selectedVariable,
}) => {
    const { chartData, loading, error } = useDataRange(
        selectedDistrict,
        dateRange,
        selectedVariable
    );
    const { downloadImage } = useDownloadImage();
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border rounded shadow">
                    <p className="text-sm font-medium">{`${label}`}</p>
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

    return (
        <div className="bg-white p-4 rounded-lg mb-4 flex flex-col h-[400px]">
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
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height={300} id="bar">
                        <BarChart
                            width={800}
                            height={300}
                            data={chartData}
                            margin={{ top: 5, right: 10, left: 30, bottom: 5 }} // Adjust left margin
                        >
                            <CartesianGrid stroke="#ccc" />
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
                                    value: `${getVariableName(
                                        getVariableName(selectedVariable)
                                    )}`,
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: "middle" },
                                    dx: -20, // Moves label slightly left
                                    dy: 20, // Adjusts vertical alignment
                                }}
                                tickFormatter={(value) => value.toFixed(3)}
                                allowDataOverflow={true}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={false}
                            />
                            <Legend
                                formatter={() =>
                                    getVariableName(
                                        getVariableName(selectedVariable)
                                    )
                                }
                            />{" "}
                            <Bar
                                dataKey="value"
                                fill="#FF6384"
                                isAnimationActive={false}
                                activeDot={false}
                            />
                        </BarChart>
                    </ResponsiveContainer>

                    <button
                        onClick={() => downloadImage("bar", "bar-chart.png")}
                        className="mt-4 p-2 bg-blue-500 text-white rounded"
                    >
                        Download Chart as PNG
                    </button>
                </div>
            )}
        </div>
    );
};

export default BarChartComponent;
