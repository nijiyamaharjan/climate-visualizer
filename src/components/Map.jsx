import { MapContainer, TileLayer, GeoJSON, LayersControl } from 'react-leaflet';
import React, { useState, useEffect } from 'react';
import L, { divIcon } from "leaflet";
import 'leaflet/dist/leaflet.css';

export default function MapComponent() {
    const [districts, setDistricts] = useState(null);
    const [provinces, setProvinces] = useState(null);

    useEffect(() => {
        // Import the GeoJSON file from the public folder
        fetch('/districts.geojson')
            .then(response => response.json())
            .then(data => {
                console.log('Loaded districts data')
                setDistricts(data)
            })
            .catch(console.log('Error loading districts'))
    }, []);

    useEffect(() => {
        // Import the GeoJSON file from the public folder
        fetch('/provinces.geojson')
            .then(response => response.json())
            .then(data => {
                console.log('Loaded provinces data')
                setProvinces(data)
            })
            .catch(console.log('Error provinces GeoJSON'))
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

                <LayersControl position='topright'>
                    <LayersControl.Overlay checked name="Districts">
                        {districts && (
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
                        )}
                    </LayersControl.Overlay>

                    <LayersControl.Overlay name='Provinces'>
                        {provinces && (
                            <GeoJSON 
                                data={provinces} 
                                style={setColor}
                                onEachFeature={(feature, layer) => {
                                    layer.bindPopup(`
                                        Name: ${feature.properties.name}<br>
                                        Capital: ${feature.properties.capital}<br>
                                    `);
                                }}
                            />
                        )}
                    </LayersControl.Overlay>
                </LayersControl>              
            </MapContainer>
        </div>
    );
}