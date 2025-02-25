import { useDataRange } from "../../../hooks/useDataRange";
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

export default function CompareLocations({
    selectedRegions, // Array of regions
    multipleDistricts, // Array of districts
    dateRange,
    selectedVariable, // Single variable for comparison
}) {
    const { chartData, loading, error } = useDataRange(
        multipleDistricts, // Fetch data for multiple districts
        dateRange,
        selectedVariable
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
                            {multipleDistricts.map((district) => (
                                <Line
                                    key={district}
                                    type="monotone"
                                    dataKey={district}
                                    name={district}
                                    stroke="#FF6384"
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
