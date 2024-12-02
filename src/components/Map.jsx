import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import React, { useState, useEffect } from 'react';
import L, { divIcon } from "leaflet";
import 'leaflet/dist/leaflet.css';

export default function MapComponent() {
    const [districts, setDistricts] = useState(null);

    useEffect(() => {
        // Import the GeoJSON file from the public folder
        fetch('/districts.geojson')
            .then(response => response.json())
            .then(data => {
                console.log('Loaded GeoJSON data')
                setDistricts(data)
            })
            .catch(console.log('Error loading GeoJSON'))
    }, []);

    const setColor = ({ properties }) => {
        return { 
            weight: 1, 
            color: "#FFFFFF",
            fillOpacity: 0.5,
            fillColor: "#4a90e2"
        };
    };

    const customMarkerIcon = (name) =>
        divIcon({
            html: name,
            className: "icon"
        });

    const setIcon = ({ properties }, latlng) => {
        return L.marker(latlng, { 
            icon: customMarkerIcon(properties.DISTRICT)
        });
    };

    if (!districts) {
        return <div>Loading map...</div>;
    }

    return (
        <div className="relative w-full h-screen">
            <MapContainer
                className="absolute w-full h-full z-0 top-0"
                center={[28.3949, 84.1240]}
                maxBoundsViscosity={1.0}
                zoom={4}
                zoomControl={true}
                scrollWheelZoom={true}
            >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png" />
                <GeoJSON 
                    data={districts} 
                    style={setColor}
                    onEachFeature={(feature, layer) => {
                        layer.bindPopup(`
                            District: ${feature.properties.DISTRICT}<br>
                            Headquarters: ${feature.properties.HQ}<br>
                            Province: ${feature.properties.PROVINCE}
                        `);
                    }}
                />
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_nolabels/{z}/{x}/{y}.png" />
                <GeoJSON 
                    data={districts} 
                    style={setColor}
                    onEachFeature={(feature, layer) => {
                        layer.bindPopup(`
                            District: ${feature.properties.DISTRICT}<br>
                            Headquarters: ${feature.properties.HQ}<br>
                            Province: ${feature.properties.PROVINCE}
                        `);
                    }}
                />
            </MapContainer>
        </div>
    );
}