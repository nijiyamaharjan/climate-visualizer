import React, { useState } from "react";
import Map from "./components/map/Map";
import DataDownloader from "./components/downloader/DataDownloader";
import DataSelector from "./components/charts/Dropdown";
import LineChartComponent from "./components/charts/Line";
import BarChartComponent from "./components/charts/Bar";
import HeatmapComponent from "./components/charts/Heatmap";
import { useDataRange } from "./hooks/useDataRange";
import CompareDropdown from "./components/charts/compare/CompareDropdown";
import CompareLocationsDropdown from "./components/charts/compare/CompareLocationsDropdown";
import CompareVariablesDropdown from "./components/charts/compare/CompareVariablesDropdown";
import CompareLocations from "./components/charts/compare/CompareLocations";
import CompareVariables from "./components/charts/compare/CompareVariables";

export default function App() {
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedVariable, setSelectedVariable] = useState("tas_min");

    const [multipleDistricts, setMultipleDistricts] = useState([]);
    const [multipleVariables, setMultipleVariables] = useState([]);
    const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
    const { chartData, loading, error } = useDataRange(
        selectedDistrict,
        dateRange,
        selectedVariable
    );
    const [selectedTab, setSelectedTab] = useState(1)

    const handleDateChange = (updatedRange) => {
        setDateRange(updatedRange); // Update date range
    };

    const handleDistrictChange = (selectedDistricts) => {
        setMultipleDistricts(selectedDistricts); // Ensures full list is stored
    };

    const handleVariableChange = (selectedVariables) => {
        setMultipleVariables(selectedVariables); // Ensures full list is stored
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="container mx-auto">
            <div className="py-5">
                                <Map onRegionSelect={setSelectedRegion} />
                            </div>
                {/* Tab Navigation */}
                <div className="mb-4">
                    <div className="flex space-x-4 border-b-2">
                        <button
                            className={`py-2 px-4 text-lg ${selectedTab === 1 ? 'border-b-2 border-blue-500' : 'text-gray-600'}`}
                            onClick={() => setSelectedTab(1)}
                        >
                            Visualize Data
                        </button>
                        <button
                            className={`py-2 px-4 text-lg ${selectedTab === 2 ? 'border-b-2 border-blue-500' : 'text-gray-600'}`}
                            onClick={() => setSelectedTab(2)}
                        >
                            Compare Districts
                        </button>
                        <button
                            className={`py-2 px-4 text-lg ${selectedTab === 3 ? 'border-b-2 border-blue-500' : 'text-gray-600'}`}
                            onClick={() => setSelectedTab(3)}
                        >
                            Compare Variables
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {/* Option 1 */}
                    {selectedTab === 1 && (
                        <div>
                            
                            <DataSelector
                                onDistrictChange={setSelectedDistrict}
                                onDateChange={handleDateChange}
                                onVariableChange={setSelectedVariable}
                            />
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
                    )}

                    {/* Option 2 */}
                    {selectedTab === 2 && (
                        <div>
                            <CompareLocationsDropdown
                                onDistrictChange={handleDistrictChange}
                                onDateChange={handleDateChange}
                                onVariableChange={setSelectedVariable}
                            />
                            <CompareLocations
                                multipleDistricts={multipleDistricts}
                                dateRange={dateRange}
                                selectedVariable={selectedVariable}
                            />
                        </div>
                    )}

                    {/* Option 3 */}
                    {selectedTab === 3 && (
                        <div>
                            <CompareVariablesDropdown
                                onDistrictChange={setSelectedDistrict}
                                onDateChange={handleDateChange}
                                onVariableChange={handleVariableChange}
                            />
                            <CompareVariables
                                selectedDistrict={selectedDistrict}
                                dateRange={dateRange}
                                multipleVariables={multipleVariables}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
