import React, { useState } from 'react';
import Map from './components/Map';
import DataDownloader from './components/DataDownloader';
import DataSelector from './components/Dropdown';
import LineChartComponent from './components/Line';
import BarChartComponent from './components/Bar';
import { useDataRange } from './hooks/useDataRange';

export default function App() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedVariable, setSelectedVariable] = useState('tas_min');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const { chartData, loading, error } = useDataRange(selectedDistrict, dateRange, selectedVariable);

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
          <div className="grid grid-cols-2 gap-6">
            <div className="linechart">
              <LineChartComponent
                className="linechart"
                selectedRegion={selectedRegion}
                selectedDistrict={selectedDistrict}
                selectedVariable={selectedVariable}
                dateRange={dateRange}
              />
            </div>
            <div className="barchart">
              <BarChartComponent
                className="linechart"
                selectedRegion={selectedRegion}
                selectedDistrict={selectedDistrict}
                selectedVariable={selectedVariable}
                dateRange={dateRange}
              />
            </div>            
            <div className="col-span-2">
              <DataDownloader
                selectedRegion={selectedRegion}
                selectedDistrict={selectedDistrict}
                selectedVariable={selectedVariable}
                chartData={chartData} // Choose chart data
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
