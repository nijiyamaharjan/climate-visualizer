import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';


const CompareDropdown = ({ onDistrictChange, onDateChange, onVariableChange }) => {
  const [districts, setDistricts] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [dateSelections, setDateSelections] = useState({
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: ''
  });
  const [selectedVariables, setSelectedVariables] = useState(['tas_min']);
  const variables = [
    { value: 'tas_min', label: 'Min. Temperature (K)' },
    { value: 'tas_max', label: 'Max. Temperature (K)' },
    { value: 'tas', label: 'Average Temperature (K)' },
    { value: 'precipitation_rate', label: 'Precipitation Rate (g/m^2/s)' },
    { value: 'total_precipitaion', label: 'Total Precipitation (m)' },
    { value: 'hurs', label: 'Relative Humidity (%)' },
    { value: 'huss', label: 'Specific Humidity (Mass fraction)' }, 
    { value: 'snowfall', label: 'Snowfall (m of water equivalent)' },
    { value: 'snowmelt', label: 'Snowmelt (m of water equivalent)' },
    { value: 'spei', label: 'SPEI' },
    { value: 'ozone', label: 'Ozone (Dobson unit)' },
    { value: 'ndvi', label: 'NDVI' },
    { value: 'sfc_windspeed', label: 'Surface Wind Speed (m/s)' },
  ];

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const updatedSelections = { ...dateSelections, [name]: value };
    setDateSelections(updatedSelections);

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
            `${dateSelections.startYear}-${dateSelections.startMonth}-01` : '',
          endDate
        });
      }
    }
  };

  const handleVariableChange = (e) => {
    const selectedVariables = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedVariables(selectedVariables);
    onVariableChange(selectedVariables);
  };

  const handleDistrictChange = (e) => {
    const selectedDistricts = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedDistricts(selectedDistricts);
    onDistrictChange(selectedDistricts);
  };

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/districts');
        const data = await response.json();
        setDistricts(data);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    fetchDistricts();
  }, []);

  const months = Array.from({ length: 12 }, (_, i) => ({
    label: new Date(0, i).toLocaleString('en', { month: 'long' }),
    value: (i + 1).toString().padStart(2, '0')
  }));

  const years = Array.from({ length: 151 }, (_, i) => (1950 + i).toString());

  return (
    <div className="flex justify-center items-center space-x-6">
      <div>
        <h2 className="text-xl font-bold text-center mb-2">Variables</h2>
        <div className="relative">
          <select
            multiple
            className="text-md appearance-none w-48 px-4 py-3 border-2 border-gray-300 rounded-lg"
            value={selectedVariables}
            onChange={handleVariableChange}
          >
            {variables.map((variable) => (
              <option key={variable.value} value={variable.value}>
                {variable.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
            <ChevronDown size={24} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-center mb-2">Date Range</h2>
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
        <h2 className="text-xl font-bold text-center mb-2">Districts</h2>
        <div className="relative">
          <select
            multiple
            className="text-md appearance-none w-48 px-4 py-3 border-2 border-gray-300 rounded-lg"
            value={selectedDistricts}
            onChange={handleDistrictChange}
          >
            <option value="">Select districts</option>
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

export default CompareDropdown;
