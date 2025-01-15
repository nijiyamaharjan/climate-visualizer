import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export default function Map() {
    const [districts, setDistricts] = useState(null);
    const [selectedDate, setSelectedDate] = useState('2025-06-01');
    const geoJsonLayerRef = useRef(null);

    const fetchData = async (date) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tasmin?date=${date}`);
            const data = await response.json();
            setDistricts(data);
        } catch (error) {
            console.error('Error fetching tasmin data:', error);
        }
    };

    useEffect(() => {
        fetchData(selectedDate);
    }, [selectedDate]);

    // Update GeoJSON layer when districts data changes
    useEffect(() => {
        if (geoJsonLayerRef.current && districts) {
            geoJsonLayerRef.current.clearLayers();
            geoJsonLayerRef.current.addData(districts);
        }
    }, [districts]);

    const handleDateChange = (selectedValue) => {
        const formattedDate = `${selectedValue}-01`;
        setSelectedDate(formattedDate);  
    };    

    const handleFeatureHover = (feature, layer) => {
        layer.on({
            mouseover: (e) => {
                const popupContent = `District: ${feature.properties.district}<br>Temperature: ${feature.properties.temperature}`;
                highlightFeature(e.target);
                layer.bindPopup(popupContent).openPopup();
            },
            mouseout: (e) => {
                resetHighlight(e.target);
                layer.closePopup();
            },
        });
    };

    const getColor = (temperature) => {
        const tempCelsius = temperature - 273.15;
        return tempCelsius > 40 ? '#800026' :
               tempCelsius > 30 ? '#BD0026' :
               tempCelsius > 20 ? '#E31A1C' :
               tempCelsius > 10 ? '#FC4E2A' :
               tempCelsius > 0  ? '#FD8D3C' :
               tempCelsius > -10 ? '#6BAED6' :
               '#08519C';
    };

    const style = (feature) => {
        const temperature = feature.properties.temperature;
        return {
            fillColor: getColor(temperature),
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
        [26.347, 80.058],  // Southwest corner (lat, lon)
        [30.447, 88.201]   // Northeast corner (lat, lon)
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
                    value={selectedDate.slice(0, 7)} // Display only the month and year (YYYY-MM)
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="border rounded-md px-2 py-1"
                />

            </div>

            <div className="relative w-full h-[500px]">
                <MapContainer
                    className="absolute w-full h-full z-0 top-0"
                    center={[28.3949, 84.1240]} // Centered on Nepal
                    zoom={7}
                    zoomControl={true}
                    scrollWheelZoom={true}
                    maxBounds={nepalBounds} // Restrict map to Nepal's bounds
                    maxZoom={12}  // Set max zoom level
                    minZoom={7}   // Set min zoom level
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
                                    key={selectedDate} // Force re-render when date changes
                                />
                            )}
                        </LayersControl.Overlay>
                    </LayersControl>
                </MapContainer>
            </div>
        </div>
    );
}
