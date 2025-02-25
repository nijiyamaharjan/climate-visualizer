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
                    <p className="text-sm font-medium">{`Date: ${label}`}</p>
                    <p className="text-sm text-red-500">
                        {`${selectedVariable}: ${payload[0].value}`}
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
                        <BarChart width={800} height={300} data={chartData}>
                            <CartesianGrid stroke="#ccc" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(tick) =>
                                    dayjs(tick).format("MMM YYYY")
                                }
                                tick={{ fontSize: 8 }}
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
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={false}
                            />
                            <Legend formatter={() => selectedVariable} />{" "}
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
