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
        const selectedVariables = selectedOptions.map(option => option.value);
        setSelectedVariables(selectedVariables);
        onVariableChange(selectedVariables);
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
        <div className="flex flex-col space-y-4">
            <div>
                <h2 className="text-lg font-bold">Select Variables</h2>
                <Select
                    isMulti
                    value={selectedVariables.map((value) => ({
                        value,
                        label: variables.find((variable) => variable.value === value)?.label,
                    }))}
                    onChange={handleVariableChange}
                    options={variables}
                    className="w-full"
                    classNamePrefix="react-select"
                    closeMenuOnSelect={false}
                />
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
                <h2 className="text-lg font-bold">Select District</h2>
                <Select
                    value={{ value: selectedDistrict, label: selectedDistrict }}
                    onChange={handleDistrictChange}
                    options={districts.map((district) => ({
                        value: district,
                        label: district,
                    }))}
                    className="w-full"
                    classNamePrefix="react-select"
                />
            </div>
        </div>
    );
};

export default CompareVariablesDropdown;
