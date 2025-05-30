import { useDataRangeMultipleVariables } from "../../../hooks/useDataRangeMultipleVariables";
import useDownloadImage from "../../..//hooks/useDownloadImage"; 

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
import dayjs from "dayjs";

const VARIABLE_COLORS = [
    "#FF6384", // Red
    "#36A2EB", // Blue
    "#FFCE56", // Yellow
    "#4BC0C0", // Teal
    "#9966FF", // Purple
    "#FF9F40", // Orange
    "#C9CBCF", // Gray
    "#77DD77", // Green
    "#FDFD96", // Light Yellow
    "#FF6961", // Light Red
];

export default function CompareVariables({
    selectedRegions, // Array of regions
    selectedDistrict, // Array of districts
    dateRange,
    multipleVariables, // Array of selected variables
}) {
    const { chartData, loading, error } = useDataRangeMultipleVariables(
        selectedDistrict,
        dateRange,
        multipleVariables // Assumes the first variable is used for fetching data
    );
    const { downloadImage } = useDownloadImage();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border rounded">
                    <p className="text-sm font-medium">{`Date: ${dayjs(
                        label
                    ).format("MMM YYYY")}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm text-red-500">
                            {`${entry.name}: ${entry.value}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const calculateYAxisDomain = () => {
        if (chartData.length === 0) return [0, 1];

        const values = chartData.flatMap((item) =>
            multipleVariables.map((variable) => item[variable])
        );
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
                                tickFormatter={(tick) =>
                                    dayjs(tick).format("MMM YYYY")
                                }
                            />
                            <YAxis
                                domain={calculateYAxisDomain()}
                                label={{
                                    value: `Values`,
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { textAnchor: "middle" },
                                }}
                                tickFormatter={(value) => value.toFixed(3)}
                                allowDataOverflow={true}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {multipleVariables.map((variable, index) => (
                                <Line
                                    key={variable}
                                    type="monotone"
                                    dataKey={variable}
                                    name={variable} // Name used in the legend
                                    stroke={VARIABLE_COLORS[index % VARIABLE_COLORS.length]}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                    isAnimationActive={false}
                                />
                            ))}
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
