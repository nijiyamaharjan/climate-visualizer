import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
import React, { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export default function MapComponent() {
    const [districts, setDistricts] = useState(null);
    const [provinces, setProvinces] = useState(null);

    const geojsonRef = useRef();

    useEffect(() => {
        // Import the GeoJSON file from the public folder
        fetch('/districts.geojson')
            .then((response) => response.json())
            .then((data) => {
                console.log('Loaded districts data');
                setDistricts(data);
            })
            .catch(() => console.log('Error loading districts'));
    }, []);

    useEffect(() => {
        // Import the GeoJSON file from the public folder
        fetch('/provinces.geojson')
            .then((response) => response.json())
            .then((data) => {
                console.log('Loaded provinces data');
                setProvinces(data);
            })
            .catch(() => console.log('Error provinces GeoJSON'));
    }, []);

    const handleFeatureHover = (feature, layer) => {
        layer.on({
            mouseover: (e) => {
                const popupContent = `
                    ${feature.properties.DISTRICT ? 
                    `District: ${feature.properties.DISTRICT}<br>Temperature: ${feature.properties.temperature}` 
                    : 
                    `Province: ${feature.properties.name}<br>Temperature: ${feature.properties.temperature}`}
                    
                `;
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
        return temperature > 70 ? '#800026' :
               temperature > 60 ? '#BD0026' :
               temperature > 50 ? '#E31A1C' :
               temperature > 40 ? '#FC4E2A' :
               temperature > 30 ? '#FD8D3C' :
               temperature > 20 ? '#FEB24C' :
               '#FED976';
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
        <div className="relative w-full h-screen">
            <MapContainer
                className="absolute w-full h-full z-0 top-0"
                center={[28.3949, 84.1240]}
                maxBoundsViscosity={1.0}
                zoom={6}
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

                    <LayersControl.Overlay name="Provinces">
                        {provinces && (
                            <GeoJSON
                                ref={geojsonRef}
                                data={provinces}
                                style={style}
                                onEachFeature={handleFeatureHover}
                            />
                        )}
                    </LayersControl.Overlay>
                </LayersControl>
            </MapContainer>
        </div>
    );
}
