import React from 'react';
import { ChevronDown } from 'lucide-react';

const DataSelector = () => {
  const variables = ['Temperature', 'Rainfall', 'Humidity', 'Wind Speed'];
  const years = [2020, 2021, 2022, 2023, 2024];

  return (
    <div className="flex justify-center items-center space-x-6">
      <div>
        <h2 className="text-2xl font-bold text-center mb-2">Variable</h2>
        <div className="relative">
          <select className="text-center text-xl appearance-none w-48 px-4 py-3 border-2 border-gray-300 rounded-lg font-bold">
            {variables.map((variable) => (
              <option key={variable} value={variable}>
                {variable}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
            <ChevronDown size={24} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-center mb-2">Year</h2>
        <div className="relative">
          <select className="text-center text-xl appearance-none w-48 px-4 py-3 border-2 border-gray-300 rounded-lg font-bold">
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
            <ChevronDown size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSelector;