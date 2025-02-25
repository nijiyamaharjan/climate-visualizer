import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet";
import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import MapDownloader from "./MapDownloader";
import GifDownloader from "./GifDownloader";
import { getColor } from './colorCodes'; // Import the color logic

export default function Map() {
    const [districts, setDistricts] = useState(null);
    const [selectedDate, setSelectedDate] = useState("2025-06-01");
    const [selectedVariable, setSelectedVariable] = useState("tas_min");
    const [month, setMonth] = useState("06"); // Default to June
    const [year, setYear] = useState("2025"); // Default to 2025    const [selectedVariable, setSelectedVariable] = useState('tas_min');
    const [loading, setLoading] = useState(true); // Track loading state
    const geoJsonLayerRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        fetchData(selectedDate, selectedVariable);
    }, [selectedDate, selectedVariable]);

    useEffect(() => {
        if (geoJsonLayerRef.current && districts) {
            geoJsonLayerRef.current.clearLayers();
            geoJsonLayerRef.current.addData(districts);
        }
    }, [districts, selectedVariable, selectedDate]);

    const fetchData = async (date, variable) => {
        try {
            setLoading(true); // Start loading
            const response = await fetch(
                `http://localhost:5000/api/data?variable=${variable}&date=${date}`
            );
            console.log('variable ', variable)
            const data = await response.json();
            console.log('data ', data)
            setDistricts(data);
        } catch (error) {
            console.error(`Error fetching ${variable} data:`, error);
        } finally {
            setLoading(false); // Stop loading once data is fetched
        }
    };
    
    const handleMonthChange = (e) => {
        const newMonth = e.target.value;
        setMonth(newMonth);
        setSelectedDate(`${year}-${newMonth}-01`); // Update date immediately
    };

    const handleYearChange = (e) => {
        const newYear = e.target.value;
        setYear(newYear);
        setSelectedDate(`${newYear}-${month}-01`); // Update date immediately
    };

    const handleVariableChange = (e) => {
        setSelectedVariable(e.target.value);
    };

    const handleFeatureHover = (feature, layer) => {
        layer.on({
            mouseover: (e) => {
                const popupContent = `District: ${feature.properties.district}<br>${selectedVariable}: ${feature.properties[selectedVariable]}`;
                highlightFeature(e.target);
                layer.bindPopup(popupContent).openPopup();
            },
            mouseout: (e) => {
                resetHighlight(e.target);
                layer.closePopup();
            },
        });
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
        { value: "12", label: "December" },
    ];



    const style = (feature) => {
        const value = feature.properties[selectedVariable];
        return {
            fillColor: getColor(value, selectedVariable),
            weight: 2,
            opacity: 1,
            color: "white",
            dashArray: "3",
            fillOpacity: 0.7,
        };
    };

    function highlightFeature(layer) {
        layer.setStyle({
            weight: 3,
            color: "#000",
            dashArray: "",
            fillOpacity: 0.7,
        });
        layer.bringToFront();
    }

    function resetHighlight(layer) {
        layer.setStyle({
            weight: 2,
            color: "white",
            dashArray: "3",
            fillOpacity: 0.7,
        });
    }

    const nepalBounds = [
        [26.347, 80.058],
        [30.447, 88.201],
    ];

    return (
        <div className="relative">
            <div className="p-4 bg-white shadow-md rounded-lg mb-4 flex justify-start gap-10 items-center">
                <label>

                    <select value={month} onChange={handleMonthChange}>
                        {months.map(({ value, label }) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    <select value={year} onChange={handleYearChange}>
                        {[...Array(100)].map((_, i) => {
                            const yearOption = 1950 + i;
                            return (
                                <option key={yearOption} value={yearOption}>
                                    {yearOption}
                                </option>
                            );
                        })}
                    </select>
                </label>
                <label
                    htmlFor="variable-select"
                    className="font-medium text-gray-700"
                >
                    Select Variable:
                </label>
                <select
                    id="variable-select"
                    value={selectedVariable}
                    onChange={handleVariableChange}
                    className="border rounded-md px-2 py-1"
                >
                    <option value="tas_min">Min Temperature (tas_min) K</option>
                    <option value="tas_max">Max Temperature (tas_max) K</option>
                    <option value="sfc_windspeed">
                        Surface Wind Speed (sfc_windspeed) m/s
                    </option>
                    <option value="precipitation_rate">
                        Precipitation Rate (pr) g/m^2/s
                    </option>
                    <option value="snowfall">
                        Snowfall (m of water equivalent)
                    </option>
                    <option value="snowmelt">
                        Snowmelt (m of water equivalent)
                    </option>
                    <option value="spei">
                        SPEI
                    </option>
                    <option value="ozone">
                        Ozone (Dobson unit)
                    </option>
                    <option value="ndvi">
                        NDVI
                    </option>
                </select>
            </div>

            <div className="relative w-full h-[500px]">
                <MapContainer
                    className="absolute w-full h-full z-0 top-0"
                    center={[28.3949, 84.124]}
                    zoom={7}
                    zoomControl={true}
                    scrollWheelZoom={true}
                    maxBounds={nepalBounds}
                    maxZoom={12}
                    minZoom={7}
                    ref={mapRef}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}.png" />
                    <LayersControl position="topright">
                        <LayersControl.Overlay checked name="Districts">
                            {districts && (
                                <GeoJSON
                                    ref={geoJsonLayerRef}
                                    data={districts}
                                    style={style}
                                    onEachFeature={handleFeatureHover}
                                    key={selectedVariable}
                                />
                            )}
                        </LayersControl.Overlay>
                    </LayersControl>
                </MapContainer>
            </div>

            {/* Show loading indicator until data is ready */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
                    <div className="loader">Loading...</div>
                </div>
            )}
            <MapDownloader variable={selectedVariable} date={selectedDate} />
            <GifDownloader variable={selectedVariable} />
        </div>
    );
}
