import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BsThermometerHalf } from 'react-icons/bs';

const sampleData = [
    { month: 'Jan', temperature: 25 },
    { month: 'Feb', temperature: 27 },
    { month: 'Mar', temperature: 30 },
    { month: 'Apr', temperature: 35 },
    { month: 'May', temperature: 40 },
    { month: 'Jun', temperature: 38 }
];

export default function TemperatureChart({ selectedRegion }) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <div className="flex items-center mb-4">
                <BsThermometerHalf className="mr-2 text-2xl text-red-500" />
                <h2 className="text-xl font-semibold">
                    {selectedRegion ? `Temperature in ${selectedRegion.name}` : 'Temperature Overview'}
                </h2>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sampleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#FF6384" 
                        activeDot={{ r: 8 }} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}