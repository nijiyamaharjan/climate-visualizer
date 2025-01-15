import React from 'react';
import { BarChart, Bar, Label, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const sampleData = [
    { month: 'Jan', temperature: 25 },
    { month: 'Feb', temperature: 27 },
    { month: 'Mar', temperature: 30 },
    { month: 'Apr', temperature: 35 },
    { month: 'May', temperature: 40 },
    { month: 'Jun', temperature: 38 },
    { month: 'Jul', temperature: 32 },
    { month: 'Aug', temperature: 36 },
    { month: 'Sep', temperature: 20 },
    { month: 'Oct', temperature: 24 },
    { month: 'Nov', temperature: 28 },
    { month: 'Dec', temperature: 22 },
];

const BarChartComponent = ({selectedRegion}) => {
  
  return (
    <div>
      <ResponsiveContainer width="100%" height={500}>
      <BarChart width={600} height={600} data={sampleData}>
            <Bar dataKey="temperature" fill="#FF6384" />
            <CartesianGrid stroke="#ccc" />
            <XAxis 
            dataKey="month"
            tick={{ fontSize: 8 }}           
             />
             <Legend />
            <YAxis />
        </BarChart>
      </ResponsiveContainer>
        
    </div>
  )
}
export default BarChartComponent