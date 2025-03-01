import { useState } from "react";

export default function GenerateMapRange({ variable }) {
  const [formData, setFormData] = useState({
    variable,
    startMonth: "01",
    startYear: "2010",
    endMonth: "06",
    endYear: "2010",
    district: "KTM"
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const variableDateRanges = {
    tas_min: { startYear: 1950, endYear: 2100 },
    tas_max: { startYear: 1950, endYear: 2100 },
    tas: { startYear: 1950, endYear: 210 },
    precipitation_rate: { startYear: 1950, endYear: 2100 },
    total_precipitaion: { startYear: 1950, endYear: 2025 },
    hurs: { startYear: 1950, endYear: 2100 },
    huss: { startYear: 1950, endYear: 2100 },
    snowfall: { startYear: 1950, endYear: 2023 },
    snowmelt: { startYear: 1950, endYear: 2023 },
    spei: { startYear: 1985, endYear: 2020 },
    ozone: { startYear: 1978, endYear: 2025 },
    ndvi: { startYear: 1981, endYear: 2013 },
    sfc_windspeed: { startYear: 1950, endYear: 2100 },
};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const startDate = `${formData.startYear}-${formData.startMonth}-01`;
    const endDate = `${formData.endYear}-${formData.endMonth}-01`;
    try {
      const res = await fetch("http://localhost:5000/api/generate-map-range", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, startDate, endDate })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("image/gif")) {
        throw new Error("Response is not a GIF!");
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `map_${formData.variable}_${startDate}_${endDate}.gif`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  const years = Array.from({ length: 50 }, (_, i) => (2025 + i).toString());

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Generate Map Range</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <select name="startMonth" value={formData.startMonth} onChange={handleChange} className="w-1/2 p-2 border rounded">
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select name="startYear" value={formData.startYear} onChange={handleChange} className="w-1/2 p-2 border rounded">
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <select name="endMonth" value={formData.endMonth} onChange={handleChange} className="w-1/2 p-2 border rounded">
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select name="endYear" value={formData.endYear} onChange={handleChange} className="w-1/2 p-2 border rounded">
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Submit"}
        </button>
      </form>
      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}
