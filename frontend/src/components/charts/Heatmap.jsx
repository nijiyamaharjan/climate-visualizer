import React, { useMemo } from "react";
import dayjs from "dayjs";
import { useDataRange } from "../../hooks/useDataRange";
import useDownloadImage from "../../hooks/useDownloadImage";
import { getColor } from "../utils/colorCodes";

const generateColorLegend = (selectedVariable, minValue, maxValue) => {
    let colorStops = [];
    let labels = [];
    
    // Create appropriate color stops and labels based on the variable
    if (selectedVariable === "tas_min" || selectedVariable === "tas_max" || selectedVariable === "tas") {
        colorStops = [
            "#FF0000", "#FF3300", "#FF6600", "#FF9900", 
            "#FFCC00", "#FFFF00", "#FFFF66", "#99CCFF", 
            "#66B3FF", "#3399FF", "#0066FF", "#0033CC", "#0000FF"
        ];
        const temp_range = maxValue - minValue;
        labels = [
            Math.round(maxValue) + "K", 
            Math.round(minValue + temp_range/2) + "K", 
            Math.round(minValue) + "K"
        ];
    } else if (selectedVariable === "ndvi") {
        colorStops = [
            "#006400", "#228B22", "#32CD32", "#66CDAA", 
            "#98FB98", "#90EE90", "#B0E57C", "#C1F0A5", "#F0FFF0"
        ];
        labels = ["0.8", "0.4", "0.0"];
    } else if (selectedVariable === "precipitation_rate") {
        colorStops = [
            "#0A0F44", "#203E73", "#3A77AD", "#6CA3DF", 
            "#A3C8F1", "#C7E0FA", "#E9F4FF", "#7EC2FF", "#006BB3"
        ];
        labels = [maxValue.toFixed(1), (maxValue/2).toFixed(1), "0"];
    } else if (selectedVariable === "spei") {
        colorStops = [
            "#00441B", "#1B7837", "#5AAE61", "#A6D96A", "#D9F0A3",
            "#FFFFBF", "#FED976", "#FD8D3C", "#E31A1C", "#800026"
        ];
        labels = ["Extreme Wet", "Neutral", "Extreme Drought"];
    } else if (selectedVariable === "ozone") {
        colorStops = [
            "#3F007D", "#7800B3", "#9C179E", "#D85799", 
            "#F792B2", "#FDC9D8", "#FEE9EF", "#FFF5FA"
        ];
        labels = [maxValue.toFixed(1) + " DU", ((maxValue + minValue)/2).toFixed(1) + " DU", minValue.toFixed(1) + " DU"];
    } else if (selectedVariable === "sfc_windspeed") {
      colorStops = [
          "#3E1A8E", "#5A2A9B", "#7F4AB8", "#9B6DCD", 
          "#B79FDC", "#D4C1E8", "#E8D7F4", "#F1E5FB",
          "D0D9F5", "#A3B9F2", "#7DA9EE", "#539FE5", "#1F8FD5", "#0F72B0"
      ];
      labels = [maxValue.toFixed(1), ((maxValue + minValue)/2).toFixed(1), minValue.toFixed(1)];
  } else if (selectedVariable === "huss") {
    colorStops = [
        "#084594", "#2171b5", "#4292c6", "#6baed6", 
        "#9ecae1", "#c6dbef", "#deebf7", "#fee090",
        "fdae61", "#f46d43"
    ];
    labels = [maxValue.toFixed(1), ((maxValue + minValue)/2).toFixed(1), minValue.toFixed(1)];
} else if (selectedVariable === "hurs") {
  colorStops = [
      "#54278f", "#08519c", "#3182bd", "#6baed6", 
      "#9ecae1", "#c6dbef", "#edf8b1", "#fdae61",
      "#f46d43", "#d73027", "#a50026"
  ];
  labels = [maxValue.toFixed(1), ((maxValue + minValue)/2).toFixed(1), minValue.toFixed(1)];
} else if (selectedVariable === "snowfall") {
  colorStops = [
      "#003366", "#004488", "#0055AA", "#0077CC", 
      "#3399DD", "#66BBEE", "#99DDF8", "#D8EBFD",
      "#C7E0FA"
  ];
  labels = [maxValue.toFixed(1), ((maxValue + minValue)/2).toFixed(1), minValue.toFixed(1)];
} else if (selectedVariable === "snowmelt") {
  colorStops = [
      "#0A0F44", "#162A5B", "#203E73", "#2B5A91", 
      "#3A77AD", "#518ECC", "#6CA3DF", "#87B6E9",
      "#A3C8F1", "#B7D5F6", "#C7E0FA", "#D8EBFD"
  ];
  labels = [maxValue.toFixed(1), ((maxValue + minValue)/2).toFixed(1), minValue.toFixed(1)];
} else if (selectedVariable === "total_precipitation") {
  colorStops = [
      "#08306b", "#08519c", "#2171b5", "#4292c6", 
      "#6baed6", "#9ecae1", "#c6dbef", "#deebf7",
      "#f7fbff", "#ffffff"
  ];
  labels = [maxValue.toFixed(1), ((maxValue + minValue)/2).toFixed(1), minValue.toFixed(1)];
} else {
        colorStops = [
            "#3E1A8E", "#7F4AB8", "#B79FDC", "#E8D7F4", 
            "#D0D9F5", "#7DA9EE", "#1F8FD5", "#0F72B0"
        ];
        labels = [maxValue.toFixed(3), ((maxValue + minValue)/2).toFixed(3), minValue.toFixed(3)];
    }
    
    return { colorStops, labels };
};

const HeatmapComponent = ({
  selectedRegion,
  selectedDistrict,
  dateRange,
  selectedVariable,
}) => {
  const { chartData, loading, error } = useDataRange(
    selectedDistrict,
    dateRange,
    selectedVariable
  );
  const { downloadImage } = useDownloadImage();

  const { 
    monthlyData, 
    yearColumns, 
    minValue, 
    maxValue 
  } = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { monthlyData: [], yearColumns: [], minValue: 0, maxValue: 0 };
    }

    const groupedData = {};
    const allYears = new Set();

    chartData.forEach(item => {
      const date = dayjs(item.date);
      const month = date.format("MMM"); 
      const year = date.year(); 

      if (!groupedData[month]) {
        groupedData[month] = {};
      }

      groupedData[month][year] = item.value;
      allYears.add(year);
    });

    const yearColumns = Array.from(allYears).sort((a, b) => a - b);

    let minValue = Infinity;
    let maxValue = -Infinity;

    Object.values(groupedData).forEach(monthData => {
      Object.values(monthData).forEach(value => {
        if (value !== undefined) {
          minValue = Math.min(minValue, value);
          maxValue = Math.max(maxValue, value);
        }
      });
    });

    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = monthOrder
      .filter(month => groupedData[month]) 
      .map(month => ({ month, ...groupedData[month] }));

    return { monthlyData, yearColumns, minValue, maxValue };
  }, [chartData]);

  const { colorStops, labels } = useMemo(() => 
    generateColorLegend(selectedVariable, minValue, maxValue), 
    [selectedVariable, minValue, maxValue]
  );

  const getVariableName = (variable) => {
    const names = {
      'tas_min': 'Min. Temperature (K)',
      'tas_max': 'Max. Temperature (K)',
      'tas': 'Average Temperature (K)',
      'hurs': 'Relative Humidity (%)',
      'huss': 'Specific Humidity (Mass fraction)',
      'total_precipitation': 'Total Precipitation (m)',
      'precipitation_rate': 'Precipitation Rate (g/m^2/s)',
      'snowfall': 'Snowfall (m of water equivalent)',
      'snowmelt': 'Snowmelt (m of water equivalent)',
      'spei': 'SPEI',
      'ozone': 'Ozone (Dobson Unit)',
      'ndvi': 'NDVI',
      'sfc_windspeed': 'Surface Wind Speed (m/s)',
    };
    return names[variable] || variable;
  };

  // Get units for the variable
  const getVariableUnits = (variable) => {
    const units = {
      'tas_min': 'K',
      'tas_max': 'K',
      'tas': 'K',
      'hurs': '%',
      'huss': 'Mass fraction',
      'total_precipitation': 'm',
      'precipitation_rate': 'g/m^2/s',
      'snowfall': 'm of water equivalent',
      'snowmelt': 'm of water equivalent',
      'spei': '',
      'ozone': 'DU',
      'ndvi': '',
      'sfc_windspeed': 'm/s',
    };
    return units[variable] || '';
  };

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg mb-4">
        <div className="flex justify-center items-center h-64">
          <p className="text-red-600">Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg mb-4 flex flex-col h-full w-full" id="heatmap">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Loading data...</p>
        </div>
      ) : monthlyData.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Select region and date range.</p>
        </div>
      ) : (
        <div className="flex-grow overflow-auto justify-center items-center">
          <h3 className="text-lg font-semibold mb-2">
            {getVariableName(selectedVariable)} Heatmap
            {selectedRegion && ` - ${selectedRegion}`}
            {selectedDistrict && ` - ${selectedDistrict}`}
          </h3>
          
          <div className="flex flex-col md:flex-row">
            <div className="flex mb-4 md:mb-0">
              <div className="w-16 font-medium">
                <div className="h-8"></div> 
                {monthlyData.map((row, index) => (
                  <div key={index} className="h-8 flex items-center">{row.month}</div>
                ))}
              </div>
              
              <div className="flex-grow">
                <div className="flex h-8">
                  {yearColumns.map((year, index) => (
                    <div key={index} className="w-12 flex items-center justify-center text-xs">
                      {year}
                    </div>
                  ))}
                </div>
                
                {monthlyData.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex h-8">
                    {yearColumns.map((year, colIndex) => {
                      const value = row[year];
                      console.log(selectedVariable)
                      return (
                        
                        <div 
                          key={colIndex} 
                          className="w-12 h-8 flex items-center justify-center text-xs border border-gray-200"
                          style={{ 
                            backgroundColor: value !== undefined ? getColor(value, selectedVariable[0]) : '#f0f0f0',
                            color: "#000"
                          }}
                          title={`${row.month} ${year}: ${value !== undefined ? value.toFixed(3) + ' ' + getVariableUnits(selectedVariable) : 'No data'}`}
                        >
                          {value !== undefined && value.toFixed(3)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Key statistics and info panel */}
            <div className="ml-0 md:ml-4 mt-4 md:mt-0 p-3 bg-gray-50 rounded-lg min-w-[200px]">
              <h4 className="font-semibold text-sm mb-2">Statistics</h4>
              <div className="text-xs space-y-1">
                <p><span className="font-medium">Min:</span> {minValue.toFixed(3)} {getVariableUnits(selectedVariable)}</p>
                <p><span className="font-medium">Max:</span> {maxValue.toFixed(3)} {getVariableUnits(selectedVariable)}</p>
                <p><span className="font-medium">Range:</span> {(maxValue - minValue).toFixed(3)} {getVariableUnits(selectedVariable)}</p>
                <p><span className="font-medium">Years:</span> {yearColumns.length}</p>
                {/* <p><span className="font-medium">Months:</span> {monthlyData.length}</p> */}
              </div>
            </div>
          </div>
          
         
          
          <button
            onClick={() => downloadImage("heatmap", `${selectedVariable}_heatmap_${selectedRegion || 'all'}.png`)}
            className="mt-4 p-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            Download Chart
          </button>
        </div>
      )}
    </div>
  );
};

export default HeatmapComponent;