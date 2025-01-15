import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const DataSelector = ({ onDistrictChange, onDateChange }) => {
  const [districts, setDistricts] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const variables = ['Temperature', 'Rainfall', 'Humidity', 'Wind Speed'];

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = `${value}-01`; // Add '-01' to make it a valid date (YYYY-MM-DD)
    
    const updatedRange = { ...dateRange, [name]: updatedValue };
    setDateRange(updatedRange); // Update the state with the new range
    onDateChange(updatedRange); // Notify parent of the change
};


  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/districts');
        const data = await response.json();
        setDistricts(data); // Populate district dropdown
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    fetchDistricts();
  }, []);

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
        <h2 className="text-2xl font-bold text-center mb-2">Date Range</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
              id="date-picker"
              type="month"
              name="startDate"
              value={dateRange.startDate.slice(0, 7)} // Display only the month and year (YYYY-MM)
              onChange={handleDateChange}
              className="border rounded-md px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="month"
            name="endDate"
            value={dateRange.endDate.slice(0, 7)} // Display only the month and year (YYYY-MM)
            onChange={handleDateChange}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-center mb-2">District</h2>
        <div className="relative">
          <select
            className="text-center text-xl appearance-none w-48 px-4 py-3 border-2 border-gray-300 rounded-lg font-bold"
            onChange={(e) => onDistrictChange(e.target.value)}
          >
            <option value="">Select a district</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
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
