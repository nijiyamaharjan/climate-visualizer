import React, { useEffect, useState } from "react";
import Select from "react-select";
import { ChevronDown } from "lucide-react";

const CompareVariablesDropdown = ({
    onDistrictChange,
    onDateChange,
    onVariableChange,
}) => {
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState("ACHHAM");
    const [dateSelections, setDateSelections] = useState({
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
    });
    const [selectedVariables, setSelectedVariables] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);

    const variables = [
        { value: "tas_min", label: "Min. Temperature (K)" },
        { value: "tas_max", label: "Max. Temperature (K)" },
        { value: "tas", label: "Average Temperature (K)" },
        { value: "precipitation_rate", label: "Precipitation Rate (g/m^2/s)" },
        { value: "total_precipitation", label: "Total Precipitation (m)" },
        { value: "hurs", label: "Relative Humidity (%)" },
        { value: "huss", label: "Specific Humidity (Mass fraction)" },
        { value: "snowfall", label: "Snowfall (m of water equivalent)" },
        { value: "snowmelt", label: "Snowmelt (m of water equivalent)" },
        // { value: "spei", label: "SPEI" },
        { value: "ozone", label: "Ozone (Dobson unit)" },
        { value: "ndvi", label: "NDVI" },
        { value: "sfc_windspeed", label: "Surface Wind Speed (m/s)" },
    ];
    const variableDateRanges = {
        tas_min: { startYear: 1950, endYear: 2100 },
        tas_max: { startYear: 1950, endYear: 2100 },
        tas: { startYear: 1950, endYear: 210 },
        precipitation_rate: { startYear: 1950, endYear: 2100 },
        total_precipitation: { startYear: 1950, endYear: 2025 },
        hurs: { startYear: 1950, endYear: 2100 },
        huss: { startYear: 1950, endYear: 2100 },
        snowfall: { startYear: 1950, endYear: 2023 },
        snowmelt: { startYear: 1950, endYear: 2023 },
        // spei: { startYear: 1985, endYear: 2020 },
        ozone: { startYear: 1978, endYear: 2025 },
        ndvi: { startYear: 1981, endYear: 2013 },
        sfc_windspeed: { startYear: 1950, endYear: 2100 },
    };

    useEffect(() => {
        const { startYear, endYear } = variableDateRanges[
            selectedVariables
        ] || { startYear: 1950, endYear: 2100 };
        setAvailableYears(
            Array.from({ length: endYear - startYear + 1 }, (_, i) =>
                (startYear + i).toString()
            )
        );
    }, [selectedVariables]);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        const updatedSelections = { ...dateSelections, [name]: value };
        setDateSelections(updatedSelections);

        if (name.startsWith("start")) {
            if (updatedSelections.startMonth && updatedSelections.startYear) {
                const startDate = `${updatedSelections.startYear}-${updatedSelections.startMonth}-01`;
                onDateChange({
                    startDate,
                    endDate:
                        dateSelections.endMonth && dateSelections.endYear
                            ? `${dateSelections.endYear}-${dateSelections.endMonth}-01`
                            : "",
                });
            }
        } else {
            if (updatedSelections.endMonth && updatedSelections.endYear) {
                const endDate = `${updatedSelections.endYear}-${updatedSelections.endMonth}-01`;
                onDateChange({
                    startDate:
                        dateSelections.startMonth && dateSelections.startYear
                            ? `${dateSelections.startYear}-${dateSelections.startMonth}-01`
                            : "",
                    endDate,
                });
            }
        }
    };

    const handleVariableChange = (selectedOptions) => {
        const selectedValues = selectedOptions
            ? selectedOptions.map((opt) => opt.value)
            : [];
        setSelectedVariables(selectedValues);
        onVariableChange(selectedValues);

        // Find the most restrictive date range
        let minYear = 1950,
            maxYear = 2100;
        selectedValues.forEach((variable) => {
            const { startYear, endYear } = variableDateRanges[variable] || {
                startYear: 1950,
                endYear: 2100,
            };
            minYear = Math.max(minYear, startYear);
            maxYear = Math.min(maxYear, endYear);
        });

        // Update available years
        setAvailableYears(
            Array.from({ length: maxYear - minYear + 1 }, (_, i) =>
                (minYear + i).toString()
            )
        );

        // Reset selected dates if they are out of range
        setDateSelections((prev) => ({
            startMonth: prev.startMonth,
            startYear:
                prev.startYear >= minYear && prev.startYear <= maxYear
                    ? prev.startYear
                    : "",
            endMonth: prev.endMonth,
            endYear:
                prev.endYear >= minYear && prev.endYear <= maxYear
                    ? prev.endYear
                    : "",
        }));
    };

    const handleDistrictChange = (selectedOption) => {
        const selectedDistrict = selectedOption.value;
        setSelectedDistrict(selectedDistrict);
        onDistrictChange(selectedDistrict);
    };

    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/districts"
                );
                const data = await response.json();
                setDistricts(data);
            } catch (error) {
                console.error("Error fetching districts:", error);
            }
        };
        fetchDistricts();
    }, []);

    const months = Array.from({ length: 12 }, (_, i) => ({
        label: new Date(0, i).toLocaleString("en", { month: "long" }),
        value: (i + 1).toString().padStart(2, "0"),
    }));

    const years = Array.from({ length: 151 }, (_, i) => (1950 + i).toString());

    return (
        <div className="flex flex-col justify-center items-center  space-y-4">
            <div>
                <h2 className="text-lg font-bold text-center mb-2">
                    {" "}
                    Variables
                </h2>
                <Select
                    isMulti
                    value={selectedVariables.map((value) => ({
                        value,
                        label: variables.find(
                            (variable) => variable.value === value
                        )?.label,
                    }))}
                    onChange={handleVariableChange}
                    options={variables}
                    className="w-full"
                    classNamePrefix="react-select"
                    closeMenuOnSelect={false}
                />
            </div>

            <div>
                <h2 className="text-lg font-bold text-center mb-2">
                    Date Range
                </h2>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                    </label>
                    <div className="flex space-x-4">
                        <select
                            name="startMonth"
                            value={dateSelections.startMonth}
                            onChange={handleDateChange}
                            className="border rounded-md px-3 py-2 w-32"
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
                            className="border rounded-md px-3 py-2"
                        >
                            <option value="">Year</option>
                            {availableYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                    </label>
                    <div className="flex space-x-4">
                        <select
                            name="endMonth"
                            value={dateSelections.endMonth}
                            onChange={handleDateChange}
                            className="border rounded-md px-3 py-2 w-32"
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
                            className="border rounded-md px-3 py-2"
                        >
                            <option value="">Year</option>
                            {availableYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-bold text-center mb-2">District</h2>
                <div className="relative">
                    <select
                        className="text-md appearance-none w-48 px-4 py-3 border-2 border-gray-300 rounded-lg mb-4"
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

export default CompareVariablesDropdown;
