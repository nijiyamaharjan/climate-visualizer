import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

const CompareLocationsDropdown = ({
    onDistrictChange,
    onDateChange,
    onVariableChange,
}) => {
    const [districts, setDistricts] = useState([]);
    const [selectedDistricts, setSelectedDistricts] = useState([]);
    const [dateSelections, setDateSelections] = useState({
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
    });
    const [selectedVariable, setSelectedVariable] = useState("tas_min");

    const variables = [
        { value: "tas_min", label: "Min. Temperature" },
        { value: "tas_max", label: "Max. Temperature" },
        { value: "sfc_windspeed", label: "Surface Wind Speed" },
        { value: "precipitation_rate", label: "Precipitation Rate" },
        { value: "snowfall", label: "Snowfall" },
        { value: "snowmelt", label: "Snowmelt" },
        { value: "spei", label: "SPEI" },
        { value: "ozone", label: "Ozone" },
        { value: "ndvi", label: "NDVI" },
    ];

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        const updatedSelections = { ...dateSelections, [name]: value };
        setDateSelections(updatedSelections);
        onDateChange({
            startDate:
                updatedSelections.startYear && updatedSelections.startMonth
                    ? `${updatedSelections.startYear}-${updatedSelections.startMonth}-01`
                    : "",
            endDate:
                updatedSelections.endYear && updatedSelections.endMonth
                    ? `${updatedSelections.endYear}-${updatedSelections.endMonth}-01`
                    : "",
        });
    };

    const handleVariableChange = (e) => {
        const selectedValue = e.target.value;
        setSelectedVariable(selectedValue);
        onVariableChange(selectedValue);
    };

    const handleDistrictChange = (e) => {
        const selectedValues = Array.from(
            e.target.selectedOptions,
            (option) => option.value
        );
        setSelectedDistricts(selectedValues); // Update local state
        onDistrictChange(selectedValues); // Pass selected districts up to parent
    };

    useEffect(() => {
        console.log("Updated Selected Districts State:", selectedDistricts);
    }, [selectedDistricts]);

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
        <div className="flex flex-col space-y-4">
            <div>
                <h2 className="text-lg font-bold">Variable</h2>
                <select
                    className="border rounded-md px-3 py-2 w-full"
                    value={selectedVariable}
                    onChange={handleVariableChange}
                >
                    {variables.map((variable) => (
                        <option key={variable.value} value={variable.value}>
                            {variable.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <h2 className="text-lg font-bold">Date Range</h2>
                <div className="flex space-x-4">
                    <select
                        name="startMonth"
                        value={dateSelections.startMonth}
                        onChange={handleDateChange}
                        className="border rounded-md px-3 py-2"
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
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex space-x-4 mt-2">
                    <select
                        name="endMonth"
                        value={dateSelections.endMonth}
                        onChange={handleDateChange}
                        className="border rounded-md px-3 py-2"
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
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-bold">Select Districts</h2>
                <select
                    multiple
                    className="border rounded-md px-3 py-2 w-full h-40"
                    value={selectedDistricts}
                    onChange={handleDistrictChange}
                >
                    {districts.map((district) => (
                        <option key={district} value={district}>
                            {district}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default CompareLocationsDropdown;
