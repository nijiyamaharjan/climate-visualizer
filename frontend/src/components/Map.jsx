import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export default function MapComponent() {
    const [districts, setDistricts] = useState(null);
    const [provinces, setProvinces] = useState(null);

    const geojsonRef = useRef();

    useEffect(() => {
        // Fetch data from the backend
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/tasmin?date=2025-06-01`);
                const data = await response.json();
                setDistricts(data);
            } catch (error) {
                console.error('Error fetching tasmin data:', error);
            }
        };
    
        fetchData();
    }, []);
    

    // useEffect(() => {
    //     // Import the GeoJSON file from the public folder
    //     fetch('/provinces.geojson')
    //         .then((response) => response.json())
    //         .then((data) => {
    //             console.log('Loaded provinces data');
    //             setProvinces(data);
    //         })
    //         .catch(() => console.log('Error provinces GeoJSON'));
    // }, []);

    const handleFeatureHover = (feature, layer) => {
        layer.on({
            mouseover: (e) => {
                const popupContent = 
                    `District: ${feature.properties.district}<br>Temperature: ${feature.properties.temperature}` 
                highlightFeature(e.target);
                layer.bindPopup(popupContent).openPopup();
            },
            mouseout: (e) => {  // Ensure event object e is passed here
                resetHighlight(e.target);  // Pass the correct target for reset
                layer.closePopup();
            },
        });
    };

    const getColor = (temperature) => {
        // Convert Kelvin to Celsius
        const tempCelsius = temperature - 273.15;
    
        // Apply color coding based on Celsius
        return tempCelsius > 40 ? '#800026' : // Extremely hot (dark red)
               tempCelsius > 30 ? '#BD0026' : // Very hot (red)
               tempCelsius > 20 ? '#E31A1C' : // Warm (light red)
               tempCelsius > 10 ? '#FC4E2A' : // Mild (orange)
               tempCelsius > 0  ? '#FD8D3C' : // Cool (yellow-orange)
               tempCelsius > -10 ? '#6BAED6' : // Cold (light blue)
               '#08519C'; // Very cold (dark blue)
    };    
    
    const style = (feature) => {
        // Use temperature from the feature properties to get the color
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
            fillOpacity: 0.7
        });
        layer.bringToFront();
    }

    function resetHighlight(layer) {
        geojsonRef.current.resetStyle(layer);
    }

    return (
        <div className="relative w-full h-[500px]">
            <MapContainer
                className="absolute w-full h-full z-0 top-0"
                center={[28.3949, 84.1240]}
                maxBoundsViscosity={1.0}
                zoom={7}
                zoomControl={true}
                scrollWheelZoom={true}
            >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}.png" />

                <LayersControl position="topright">
                    <LayersControl.Overlay checked name="Districts">
                        {districts && (
                            <GeoJSON
                                ref={geojsonRef}
                                data={districts}
                                style={style}
                                onEachFeature={handleFeatureHover}
                            />
                        )}
                    </LayersControl.Overlay>

                    {/* <LayersControl.Overlay name="Provinces">
                        {provinces && (
                            <GeoJSON
                                ref={geojsonRef}
                                data={provinces}
                                style={style}
                                onEachFeature={handleFeatureHover}
                            />
                        )}
                    </LayersControl.Overlay> */}
                </LayersControl>
            </MapContainer>
        </div>
    );
}
