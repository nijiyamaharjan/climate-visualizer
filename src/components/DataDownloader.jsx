import React from 'react';
import { BiDownload } from 'react-icons/bi';

const sampleData = [
    { month: 'Jan', temperature: 25 },
    { month: 'Feb', temperature: 27 },
    { month: 'Mar', temperature: 30 },
    { month: 'Apr', temperature: 35 },
    { month: 'May', temperature: 40 },
    { month: 'Jun', temperature: 38 }
];

export default function DataDownloader({ selectedRegion }) {
    const downloadCSV = () => {
        const csvContent = [
            'Month,Temperature',
            ...sampleData.map(row => `${row.month},${row.temperature}`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${selectedRegion?.name || 'region'}_temperatures.csv`);
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