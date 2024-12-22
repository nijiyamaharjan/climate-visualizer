import React, { useState } from 'react';
import Map from './components/Map';
import TemperatureChart from './components/Line';
import DataDownloader from './components/DataDownloader';
import DataSelector from './components/Dropdown';
import LineChartComponent from './components/Line'
import BarChartComponent from './components/Bar';

export default function App() {
  const [selectedRegion, setSelectedRegion] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Climate Analyzer</h1>
        
        <div className="grid grid-rows-1 lg:grid-rows-2 gap-6">
          <div>
            <div className="py-5">
            <Map onRegionSelect={setSelectedRegion} />
            </div>
            <DataSelector/>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <LineChartComponent selectedRegion={selectedRegion} />
            <BarChartComponent selectedRegion={selectedRegion} />
            <div className="col-span-2">
              <DataDownloader selectedRegion={selectedRegion} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}