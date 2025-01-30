import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import MapDownloader from './MapDownloader';

export default function Map() {
    const [districts, setDistricts] = useState(null);
    const [selectedDate, setSelectedDate] = useState('2025-06-01');
    const [selectedVariable, setSelectedVariable] = useState('tas_min');
    const [loading, setLoading] = useState(true); // Track loading state
    const geoJsonLayerRef = useRef(null);
    const mapRef = useRef(null);

    const fetchData = async (date, variable) => {
        try {
            setLoading(true); // Start loading
            const response = await fetch(`http://localhost:5000/api/data?variable=${variable}&date=${date}`);
            const data = await response.json();
            setDistricts(data);
        } catch (error) {
            console.error(`Error fetching ${variable} data:`, error);
        } finally {
            setLoading(false); // Stop loading once data is fetched
        }
    };

    useEffect(() => {
        fetchData(selectedDate, selectedVariable);
    }, [selectedDate, selectedVariable]);

    useEffect(() => {
        if (geoJsonLayerRef.current && districts) {
            geoJsonLayerRef.current.clearLayers();
            geoJsonLayerRef.current.addData(districts);
        }
    }, [districts, selectedVariable, selectedDate]);

    const handleDateChange = (selectedValue) => {
        const formattedDate = `${selectedValue}-01`;
        setSelectedDate(formattedDate);
    };

    const handleVariableChange = (event) => {
        setSelectedVariable(event.target.value);
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

    const getColor = (value) => {
        if (selectedVariable === "tas_min") {
            const tempCelsius = value - 273.15;
            return tempCelsius > 40 ? '#800026' :
                   tempCelsius > 30 ? '#BD0026' :
                   tempCelsius > 20 ? '#E31A1C' :
                   tempCelsius > 10 ? '#FC4E2A' :
                   tempCelsius > 0  ? '#FD8D3C' :
                   tempCelsius > -10 ? '#6BAED6' :
                   '#08519C';
        } else if (selectedVariable === "sfc_windspeed") {
            return value > 3.9 ? '#3E1A8E' :  
           value > 3.8 ? '#5A2A9B' :  
           value > 3.7 ? '#7F4AB8' :  
           value > 3.6 ? '#9B6DCD' :  
           value > 3.5 ? '#B79FDC' :  
           value > 3.4 ? '#D4C1E8' :  
           value > 3.3 ? '#E8D7F4' :  
           value > 3.2 ? '#F1E5FB' :  
           value > 3.1 ? '#D0D9F5' :  
           value > 3 ? '#A3B9F2' :  
           value > 2.9 ? '#7DA9EE' :  
           value > 2.8 ? '#539FE5' :  
           value > 2.7 ? '#1F8FD5' :  
           '#0F72B0';  
        }
        return '#cccccc'; 
    };

    const style = (feature) => {
        const value = feature.properties[selectedVariable];
        return {
            fillColor: getColor(value),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7,
        };
    };

    function highlightFeature(layer) {
        layer.setStyle({
            weight: 3,
            color: '#000',
            dashArray: '',
            fillOpacity: 0.7,
        });
        layer.bringToFront();
    }

    function resetHighlight(layer) {
        layer.setStyle({
            weight: 2,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7,
        });
    }

    const nepalBounds = [
        [26.347, 80.058],  
        [30.447, 88.201]   
    ];   

    return (
        <div className="relative">
            <div className="p-4 bg-white shadow-md rounded-lg mb-4 flex justify-between items-center">
                <label htmlFor="date-picker" className="font-medium text-gray-700">
                    Select Date:
                </label>
                <input
                    id="date-picker"
                    type="month"
                    value={selectedDate.slice(0, 7)}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="border rounded-md px-2 py-1"
                />
                <label htmlFor="variable-select" className="font-medium text-gray-700">
                    Select Variable:
                </label>
                <select
                    id="variable-select"
                    value={selectedVariable}
                    onChange={handleVariableChange}
                    className="border rounded-md px-2 py-1"
                >
                    <option value="tas_min">Min Temperature (tas_min)</option>
                    <option value="sfc_windspeed"> Surface Wind Speed (sfc_windspeed)</option>
                </select>
            </div>

            <div className="relative w-full h-[500px]">
                <MapContainer
                    className="absolute w-full h-full z-0 top-0"
                    center={[28.3949, 84.1240]} 
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

            <MapDownloader 
            variable={selectedVariable}
            date={selectedDate}
            />
        </div>
    );
}
