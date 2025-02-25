export const getColor = (value, selectedVariable) => {
    if (selectedVariable === "tas_min") {
        return value > 310  
            ? "#FF0000" // Bright Red (Very Hot)
            : value > 305  
            ? "#FF3300" // Vivid Red-Orange
            : value > 300  
            ? "#FF6600" // Orange-Red
            : value > 295  
            ? "#FF9900" // Orange
            : value > 290  
            ? "#FFCC00" // Yellow-Orange
            : value > 285  
            ? "#FFFF00" // Yellow
            : value > 280  
            ? "#FFFF66" // Light Yellow
            : value > 275  
            ? "#99CCFF" // Pale Blue
            : value > 270  
            ? "#66B3FF" // Light Blue
            : value > 265  
            ? "#3399FF" // Blue
            : value > 260  
            ? "#0066FF" // Medium Blue
            : value > 255  
            ? "#0033CC" // Dark Blue
            : "#0000FF"; // Deep Blue (Coolest Temperature)
    } else if (selectedVariable === "sfc_windspeed") {
        return value > 3.9
            ? "#3E1A8E"
            : value > 3.8
            ? "#5A2A9B"
            : value > 3.7
            ? "#7F4AB8"
            : value > 3.6
            ? "#9B6DCD"
            : value > 3.5
            ? "#B79FDC"
            : value > 3.4
            ? "#D4C1E8"
            : value > 3.3
            ? "#E8D7F4"
            : value > 3.2
            ? "#F1E5FB"
            : value > 3.1
            ? "#D0D9F5"
            : value > 3
            ? "#A3B9F2"
            : value > 2.9
            ? "#7DA9EE"
            : value > 2.8
            ? "#539FE5"
            : value > 2.7
            ? "#1F8FD5"
            : "#0F72B0";
    } else if (selectedVariable === "precipitation_rate") {
        return value > 30
            ? "#0A0F44" // Deep Indigo (highest)
            : value > 20
            ? "#162A5B" // Dark Navy
            : value > 10
            ? "#203E73" // Dark Blue
            : value > 7
            ? "#2B5A91" // Deep Blue
            : value > 5    // Q3
            ? "#3A77AD" // Medium Blue
            : value > 4
            ? "#518ECC" // Sky Blue
            : value > 3    // New breakpoint
            ? "#6CA3DF" // Soft Blue
            : value > 2  // New breakpoint
            ? "#87B6E9" // Muted Blue
            : value > 1.76    // Q2
            ? "#A3C8F1" // Light Blue
            : value > 1.5  // New breakpoint
            ? "#B7D5F6" // Softer Blue
            : value > 1.2
            ? "#C7E0FA" // Pale Blue
            : value > 1.0
            ? "#D8EBFD" // Very Light Blue
            : value > 0.8 // Just below Q2
            ? "#E9F4FF" // Lightest Blue
            : value > 0.76
            ? "#E0F7FF" // Very Light Blue
            : value > 0.6
            ? "#D1F2FF" // Soft Light Blue
            : value > 0.5
            ? "#A3D8FF" // Light Blue
            : value > 0.4
            ? "#7EC2FF" // Light Blue-Green
            : value > 0.35
            ? "#4AB5FF" // Soft Blue
            : value > 0.27  // Q1
            ? "#1B8CFF" // Bright Blue
            : "#006BB3"; // Deep Blue (lowest)
    }
            else if (selectedVariable === "snowfall") {
        return value > 0.01
            ? "#003366" // Deep Indigo (highest)
            : value > 0.005
            ? "#004488" // Dark Navy
            : value > 0.002
            ? "#0055AA" // Dark Blue
            : value > 0.001
            ? "#0077CC" // Deep Blue
            : value > 0.0005
            ? "#3399DD" // Medium Blue
            : value > 0.0001
            ? "#66BBEE" // Sky Blue
            : value > 0.00001
            ? "#99DDF8" // Soft Blue
            : value > 0.000001
            ? "#D8EBFD" // Muted Blue
            : "#C7E0FA"
    } else if (selectedVariable === "snowmelt") {
        return value > 0.01  // Top values close to max
            ? "#0A0F44" // Deep Indigo (highest)
            : value > 0.005
            ? "#162A5B" // Dark Navy
            : value > 0.001
            ? "#203E73" // Dark Blue
            : value > 0.0005
            ? "#2B5A91" // Deep Blue
            : value > 0.0002 // Q3
            ? "#3A77AD" // Medium Blue
            : value > 0.0001
            ? "#518ECC" // Sky Blue
            : value > 0.00001
            ? "#6CA3DF" // Soft Blue
            : value > 1e-6
            ? "#87B6E9" // Muted Blue
            : value > 1e-7
            ? "#A3C8F1" // Light Blue
            : value > 1e-9  // Median
            ? "#B7D5F6" // Softer Blue
            : value > 1e-11 // Q1
            ? "#C7E0FA" // Pale Blue
            : "#D8EBFD"; // Very Light Blue (lowest)
    }
    else if (selectedVariable === "spei") {
        return value > 3  // Extreme wet conditions
            ? "#00441B" // Deep Green
            : value > 2
            ? "#1B7837" // Forest Green
            : value > 1
            ? "#5AAE61" // Medium Green
            : value > 0.6 // Q3
            ? "#A6D96A" // Light Green
            : value > 0.1
            ? "#D9F0A3" // Yellow-Green
            : value > -0.1 // Around neutral
            ? "#FFFFBF" // Yellow (Neutral)
            : value > -0.8 // Q1 (Mild Drought)
            ? "#FED976" // Light Orange
            : value > -2
            ? "#FD8D3C" // Dark Orange
            : value > -3
            ? "#E31A1C" // Red (Severe Drought)
            : "#800026"; // Dark Red (Extreme Drought)
    } else if (selectedVariable === "ozone") {
        return value > 320  
            ? "#3F007D" // Deepest Purple (Extremely High)
            : value > 310  
            ? "#5E009A" // Dark Violet
            : value > 300  
            ? "#7800B3" // Purple
            : value > 290  
            ? "#9C179E" // Magenta-Purple
            : value > 280  
            ? "#C22F89" // Deep Pinkish-Purple
            : value > 275  
            ? "#D85799" // Strong Pink
            : value > 270  
            ? "#E67BA7" // Medium Pink
            : value > 265  
            ? "#F792B2" // Soft Pink
            : value > 260  
            ? "#FAB9CD" // Pale Pink
            : value > 255  
            ? "#FDC9D8" // Faint Pink
            : value > 250  
            ? "#FDD9E2" // Very Light Pink
            : value > 240  
            ? "#FEE9EF" // Softest Pink
            : "#FFF5FA"; // Almost White (Lowest Ozone)
    } else if (selectedVariable === "tas_max") {
        return value > 310  
            ? "#FF0000" // Bright Red (Very Hot)
            : value > 305  
            ? "#FF3300" // Vivid Red-Orange
            : value > 300  
            ? "#FF6600" // Orange-Red
            : value > 295  
            ? "#FF9900" // Orange
            : value > 290  
            ? "#FFCC00" // Yellow-Orange
            : value > 285  
            ? "#FFFF00" // Yellow
            : value > 280  
            ? "#FFFF66" // Light Yellow
            : value > 275  
            ? "#99CCFF" // Pale Blue
            : value > 270  
            ? "#66B3FF" // Light Blue
            : value > 265  
            ? "#3399FF" // Blue
            : value > 260  
            ? "#0066FF" // Medium Blue
            : value > 255  
            ? "#0033CC" // Dark Blue
            : "#0000FF"; // Deep Blue (Coolest Temperature)
    } else if (selectedVariable === "ndvi") {
        return value > 0.75  
            ? "#006400" // Dark Green (High Vegetation)
            : value > 0.65  
            ? "#228B22" // Forest Green
            : value > 0.55  
            ? "#32CD32" // Lime Green
            : value > 0.45  
            ? "#66CDAA" // Medium Aquamarine
            : value > 0.35  
            ? "#98FB98" // Pale Green
            : value > 0.25  
            ? "#90EE90" // Light Green
            : value > 0.15  
            ? "#B0E57C" // Light Yellow-Green
            : value > 0.05  
            ? "#C1F0A5" // Pale Yellow-Green
            : "#F0FFF0"; // Honeydew (Very Low Vegetation)
    }
    return "#cccccc";
};
