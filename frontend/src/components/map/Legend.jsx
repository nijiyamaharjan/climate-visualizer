import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { getColor } from "../utils/colorCodes";

function Legend({ variable, date }) {
    const map = useMap();

    useEffect(() => {
        // Define legend ranges based on the variable selected
        const getLegendRanges = () => {
            switch (variable) {
                case "tas_min":
                case "tas_max":
                    return [
                        { value: 255, label: "< 255 K" },
                        { value: 260, label: "255-260 K" },
                        { value: 265, label: "260-265 K" },
                        { value: 270, label: "265-270 K" },
                        { value: 275, label: "270-275 K" },
                        { value: 280, label: "275-280 K" },
                        { value: 285, label: "280-285 K" },
                        { value: 290, label: "285-290 K" },
                        { value: 295, label: "290-295 K" },
                        { value: 300, label: "295-300 K" },
                        { value: 305, label: "300-305 K" },
                        { value: 310, label: "305-310 K" },
                        { value: 315, label: "> 310 K" },
                    ];
                case "sfc_windspeed":
                    return [
                        { value: 2.7, label: "< 2.7 m/s" },
                        { value: 2.8, label: "2.7-2.8 m/s" },
                        { value: 2.9, label: "2.8-2.9 m/s" },
                        { value: 3.0, label: "2.9-3.0 m/s" },
                        { value: 3.1, label: "3.0-3.1 m/s" },
                        { value: 3.2, label: "3.1-3.2 m/s" },
                        { value: 3.3, label: "3.2-3.3 m/s" },
                        { value: 3.4, label: "3.3-3.4 m/s" },
                        { value: 3.5, label: "3.4-3.5 m/s" },
                        { value: 3.6, label: "3.5-3.6 m/s" },
                        { value: 3.7, label: "3.6-3.7 m/s" },
                        { value: 3.8, label: "3.7-3.8 m/s" },
                        { value: 3.9, label: "3.8-3.9 m/s" },
                        { value: 4.0, label: "> 3.9 m/s" },
                    ];
                case "precipitation_rate":
                    return [
                        { value: 0.27, label: "< 0.27" },
                        { value: 0.35, label: "0.27-0.35" },
                        { value: 0.4, label: "0.35-0.4" },
                        { value: 0.5, label: "0.4-0.5" },
                        { value: 0.6, label: "0.5-0.6" },
                        { value: 0.76, label: "0.6-0.76" },
                        { value: 0.8, label: "0.76-0.8" },
                        { value: 1.0, label: "0.8-1.0" },
                        { value: 1.2, label: "1.0-1.2" },
                        { value: 1.5, label: "1.2-1.5" },
                        { value: 1.76, label: "1.5-1.76" },
                        { value: 2, label: "1.76-2" },
                        { value: 3, label: "2-3" },
                        { value: 4, label: "3-4" },
                        { value: 5, label: "4-5" },
                        { value: 7, label: "5-7" },
                        { value: 10, label: "7-10" },
                        { value: 20, label: "10-20" },
                        { value: 30, label: "20-30" },
                        { value: 40, label: "> 30" },
                    ];
                case "snowfall":
                    return [
                        { value: 0.000001, label: "< 0.000001" },
                        { value: 0.00001, label: "0.000001-0.00001" },
                        { value: 0.0001, label: "0.00001-0.0001" },
                        { value: 0.0005, label: "0.0001-0.0005" },
                        { value: 0.001, label: "0.0005-0.001" },
                        { value: 0.002, label: "0.001-0.002" },
                        { value: 0.005, label: "0.002-0.005" },
                        { value: 0.01, label: "0.005-0.01" },
                        { value: 0.02, label: "> 0.01" },
                    ];
                case "snowmelt":
                    return [
                        { value: 1e-11, label: "< 1e-11" },
                        { value: 1e-9, label: "1e-11-1e-9" },
                        { value: 1e-7, label: "1e-9-1e-7" },
                        { value: 1e-6, label: "1e-7-1e-6" },
                        { value: 0.00001, label: "1e-6-0.00001" },
                        { value: 0.0001, label: "0.00001-0.0001" },
                        { value: 0.0002, label: "0.0001-0.0002" },
                        { value: 0.0005, label: "0.0002-0.0005" },
                        { value: 0.001, label: "0.0005-0.001" },
                        { value: 0.005, label: "0.001-0.005" },
                        { value: 0.01, label: "0.005-0.01" },
                        { value: 0.02, label: "> 0.01" },
                    ];
                case "spei":
                    return [
                        { value: -3, label: "< -3" },
                        { value: -2, label: "-3 to -2" },
                        { value: -0.8, label: "-2 to -0.8" },
                        { value: -0.1, label: "-0.8 to -0.1" },
                        { value: 0.1, label: "-0.1 to 0.1" },
                        { value: 0.6, label: "0.1 to 0.6" },
                        { value: 1, label: "0.6 to 1" },
                        { value: 2, label: "1 to 2" },
                        { value: 3, label: "2 to 3" },
                        { value: 4, label: "> 3" },
                    ];
                case "ozone":
                    return [
                        { value: 240, label: "< 240" },
                        { value: 250, label: "240-250" },
                        { value: 255, label: "250-255" },
                        { value: 260, label: "255-260" },
                        { value: 265, label: "260-265" },
                        { value: 270, label: "265-270" },
                        { value: 275, label: "270-275" },
                        { value: 280, label: "275-280" },
                        { value: 290, label: "280-290" },
                        { value: 300, label: "290-300" },
                        { value: 310, label: "300-310" },
                        { value: 320, label: "310-320" },
                        { value: 330, label: "> 320" },
                    ];
                case "ndvi":
                    return [
                        { value: 0.05, label: "< 0.05" },
                        { value: 0.15, label: "0.05-0.15" },
                        { value: 0.25, label: "0.15-0.25" },
                        { value: 0.35, label: "0.25-0.35" },
                        { value: 0.45, label: "0.35-0.45" },
                        { value: 0.55, label: "0.45-0.55" },
                        { value: 0.65, label: "0.55-0.65" },
                        { value: 0.75, label: "0.65-0.75" },
                        { value: 0.85, label: "> 0.75" },
                    ];
                default:
                    return [];
            }
        };

        // Get variable display name
        const getVariableDisplay = () => {
            switch (variable) {
                case "tas_min":
                    return "Min Temperature (K)";
                case "tas_max":
                    return "Max Temperature (K)";
                case "sfc_windspeed":
                    return "Surface Wind Speed (m/s)";
                case "precipitation_rate":
                    return "Precipitation Rate (g/m²/s)";
                case "snowfall":
                    return "Snowfall (m of water equivalent)";
                case "snowmelt":
                    return "Snowmelt (m of water equivalent)";
                case "spei":
                    return "SPEI";
                case "ozone":
                    return "Ozone (Dobson unit)";
                case "ndvi":
                    return "NDVI";
                default:
                    return variable;
            }
        };

        // Format date
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        };

        // Create a legend control
        const legend = L.control({ position: "topleft" });

        legend.onAdd = function () {
            const div = L.DomUtil.create("div", "info legend");
            const ranges = getLegendRanges();

            div.innerHTML = `
        <div style="
          background-color: white;
          padding: 10px;
          border-radius: 4px;
          box-shadow: 0 1px 5px rgba(0,0,0,0.2);
          font-family: Arial, sans-serif;
          max-width: 250px;
          max-height: 400px;
          overflow-y: auto;
        ">
          <div>
            ${ranges
                .map((range) => {
                    const color = getColor(range.value, variable);
                    return `
                <div style="display: flex; align-items: center; margin-bottom: 3px;">
                  <div style="
                    background: ${color};
                    width: 20px;
                    height: 20px;
                    margin-right: 5px;
                    border: 1px solid #ccc;
                  "></div>
                  <span style="font-size: 12px;">${range.label}</span>
                </div>
              `;
                })
                .join("")}
          </div>
        </div>
      `;

            return div;
        };

        legend.addTo(map);

        // Clean up when component unmounts
        return () => {
            legend.remove();
        };
    }, [map, variable, date]);

    return null;
}

export default Legend;
