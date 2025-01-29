import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const DataSelector = ({ onDistrictChange, onDateChange, onVariableChange }) => {
  const [districts, setDistricts] = useState([]);
  const [dateSelections, setDateSelections] = useState({
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: ''
  });  
  const [variable, setVariable] = useState('tas_min'); // Initial variable
  const variables = ['tas_min', 'Rainfall', 'Humidity', 'sfc_windspeed'];

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const updatedSelections = { ...dateSelections, [name]: value };
    setDateSelections(updatedSelections);

    // Only update the parent when both month and year are selected
    if (name.startsWith('start')) {
      if (updatedSelections.startMonth && updatedSelections.startYear) {
        const startDate = `${updatedSelections.startYear}-${updatedSelections.startMonth}-01`;
        onDateChange({ 
          startDate,
          endDate: dateSelections.endMonth && dateSelections.endYear ? 
            `${dateSelections.endYear}-${dateSelections.endMonth}-01` : 
            ''
        });
      }
    } else {
      if (updatedSelections.endMonth && updatedSelections.endYear) {
        const endDate = `${updatedSelections.endYear}-${updatedSelections.endMonth}-01`;
        onDateChange({
          startDate: dateSelections.startMonth && dateSelections.startYear ? 
            `${dateSelections.startYear}-${dateSelections.startMonth}-01` : 
            '',
          endDate
        });
      }
    }
  };

  const handleVariableChange = (e) => {
    const selectedVariable = e.target.value;
    setVariable(selectedVariable); // Update the variable state
    onVariableChange(selectedVariable); // Notify parent about the selected variable
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

  // Helper function to generate month options
  const months = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(0, i).toLocaleString('en', { month: 'long' }),
    value: (i + 1).toString().padStart(2, '0'),
  }));

  // Helper function to generate year options (from 1950 to 2100)
  const years = Array.from({ length: 151 }, (_, i) => (1950 + i).toString());

  return (
    <div className="flex justify-center items-center space-x-6">
      <div>
        <h2 className="text-2xl font-bold text-center mb-2">Variable</h2>
        <div className="relative">
          <select
            className="text-center text-xl appearance-none w-48 px-4 py-3 border-2 border-gray-300 rounded-lg font-bold"
            value={variable} // Bind the variable state to the dropdown
            onChange={handleVariableChange} // Update the variable when selection changes
          >
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
          <div className="flex space-x-4">
            <select
              name="startMonth"
              value={dateSelections.startMonth}
              onChange={handleDateChange}
              className="border rounded-md px-3 py-2 w-24"
            >
              <option value="">Month</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <select
              name="startYear"
              value={dateSelections.startYear}
              onChange={handleDateChange}
              className="border rounded-md px-3 py-2 w-24"
            >
              <option value="">Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <div className="flex space-x-4">
            <select
              name="endMonth"
              value={dateSelections.endMonth}
              onChange={handleDateChange}
              className="border rounded-md px-3 py-2 w-24"
            >
              <option value="">Month</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <select
              name="endYear"
              value={dateSelections.endYear}
              onChange={handleDateChange}
              className="border rounded-md px-3 py-2 w-24"
            >
              <option value="">Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
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
