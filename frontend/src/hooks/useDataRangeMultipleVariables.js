import { useState, useEffect } from "react";

export const useDataRangeMultipleVariables = (
    selectedDistrict,
    dateRange,
    selectedVariables
) => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (
                !selectedDistrict ||
                selectedVariables.length === 0 ||
                !dateRange.startDate ||
                !dateRange.endDate
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
                // Fetch data for all variables in parallel
                const promises = selectedVariables.map(async (variable) => {
                    const response = await fetch(
                        `http://localhost:5000/api/data-range?startDate=${updatedDateRange.startDate}&endDate=${updatedDateRange.endDate}&district=${selectedDistrict}&variable=${variable}`
                    );

                    if (!response.ok) {
                        throw new Error(
                            `HTTP error! status: ${response.status}`
                        );
                    }

                    const geoJsonData = await response.json();
                    return geoJsonData.features.map((feature) => ({
                        date: feature.properties.timestamp.split("T")[0],
                        [variable]: Number(feature.properties.value), // Use the variable as the key
                    }));
                });

                const results = await Promise.all(promises);

                // Combine data into a single dataset, ensuring multiple variables are captured
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
        selectedDistrict,
        dateRange.startDate,
        dateRange.endDate,
        selectedVariables,
    ]);

    return { chartData, loading, error };
};
