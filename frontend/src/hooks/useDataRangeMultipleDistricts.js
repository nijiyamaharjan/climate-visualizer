import { useState, useEffect } from "react";

export const useDataRangeMultipleDistricts = (
    selectedDistricts,
    dateRange,
    selectedVariable
) => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (
                !selectedDistricts ||
                selectedDistricts.length === 0 ||
                !dateRange.startDate ||
                !dateRange.endDate ||
                !selectedVariable
            ) {
                return;
            }

            const newStartDate = new Date(dateRange.startDate);
            newStartDate.setMonth(newStartDate.getMonth() + 1);
            const newEndDate = new Date(dateRange.endDate);
            newEndDate.setMonth(newEndDate.getMonth() + 1);

            const updatedDateRange = {
                startDate: newStartDate.toISOString().split("T")[0],
                endDate: newEndDate.toISOString().split("T")[0],
            };

            setLoading(true);
            setError(null);

            try {
                // Fetch data for all districts in parallel
                const promises = selectedDistricts.map(async (district) => {
                    const response = await fetch(
                        `http://localhost:5000/api/data-range?startDate=${updatedDateRange.startDate}&endDate=${updatedDateRange.endDate}&district=${district}&variable=${selectedVariable}`
                    );

                    if (!response.ok) {
                        throw new Error(
                            `HTTP error! status: ${response.status}`
                        );
                    }

                    const geoJsonData = await response.json();
                    return geoJsonData.features.map((feature) => ({
                        date: feature.properties.timestamp.split("T")[0],
                        [district]: Number(feature.properties.value), // Use district name as the key
                    }));
                });

                const results = await Promise.all(promises);

                // Combine data into a single dataset
                const combinedData = results.reduce((acc, districtData) => {
                    districtData.forEach((entry) => {
                        const existingEntry = acc.find(
                            (item) => item.date === entry.date
                        );
                        if (existingEntry) {
                            Object.assign(existingEntry, entry);
                        } else {
                            acc.push(entry);
                        }
                    });
                    return acc;
                }, []);

                // Sort by date
                combinedData.sort(
                    (a, b) => new Date(a.date) - new Date(b.date)
                );

                setChartData(combinedData);
            } catch (err) {
                console.error("Error fetching data-range data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [
        selectedDistricts,
        dateRange.startDate,
        dateRange.endDate,
        selectedVariable,
    ]);

    return { chartData, loading, error };
};
