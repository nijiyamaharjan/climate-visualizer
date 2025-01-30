import React from 'react';
import { BiDownload } from 'react-icons/bi';

export default function DataDownloader({ selectedRegion, selectedDistrict, selectedVariable, chartData }) {
    const downloadCSV = () => {
        // Check if there's data to download
        if (!chartData || chartData.length === 0) {
            alert('No data available to download.');
            return;
        }

        // Format the chart data for CSV
        const csvContent = [
            'Date,Value', // Assuming each data point has a date and a value
            ...chartData.map(row => `${row.date},${row.value}`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${selectedVariable || 'variable'}_data.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <button 
                onClick={downloadCSV}
                className="w-full flex items-center justify-center 
                           bg-blue-500 text-white py-2 rounded 
                           hover:bg-blue-600 transition duration-300"
            >
                <BiDownload className="mr-2" />
                Download {selectedRegion ? `${selectedRegion.name} ` : ''} Data
            </button>
        </div>
    );
}
