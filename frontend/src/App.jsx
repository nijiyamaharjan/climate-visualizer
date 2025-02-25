import React, { useState } from "react";
import Map from "./components/map/Map";
import DataDownloader from "./components/downloader/DataDownloader";
import DataSelector from "./components/charts/Dropdown";
import LineChartComponent from "./components/charts/Line";
import BarChartComponent from "./components/charts/Bar";
import HeatmapComponent from "./components/charts/Heatmap";
import { useDataRange } from "./hooks/useDataRange";

export default function App() {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedVariable, setSelectedVariable] = useState("tas_min");
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
    const { chartData, loading, error } = useDataRange(
        selectedDistrict,
        dateRange,
        selectedVariable
    );

    const handleDateChange = (updatedRange) => {
        setDateRange(updatedRange); // Update date range
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="container mx-auto">
                <div className="grid grid-rows-1 lg:grid-rows-2 gap-6">
                    <div>
                        <div className="py-5">
                            <Map onRegionSelect={setSelectedRegion} />
                        </div>
                        <DataSelector
                            onDistrictChange={setSelectedDistrict}
                            onDateChange={handleDateChange}
                            onVariableChange={setSelectedVariable}
                        />
                    </div>
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <LineChartComponent
                                selectedRegion={selectedRegion}
                                selectedDistrict={selectedDistrict}
                                selectedVariable={selectedVariable}
                                dateRange={dateRange}
                            />

                            <BarChartComponent
                                selectedRegion={selectedRegion}
                                selectedDistrict={selectedDistrict}
                                selectedVariable={selectedVariable}
                                dateRange={dateRange}
                            />
                            
                        </div>
                        <div className="col-span-2">
                            <div className="grid grid-cols-1">
                            <HeatmapComponent
                                selectedRegion={selectedRegion}
                                selectedDistrict={selectedDistrict}
                                selectedVariable={selectedVariable}
                                dateRange={dateRange}
                            />
                            </div>
                            <DataDownloader
                                selectedRegion={selectedRegion}
                                selectedDistrict={selectedDistrict}
                                selectedVariable={selectedVariable}
                                chartData={chartData}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
