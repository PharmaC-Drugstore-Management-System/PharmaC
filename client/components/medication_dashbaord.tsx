
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import React from 'react';

export default function MedicationDashboard() {
  // Data for the pie chart
  const medicationData = [
    { name: 'Amoxicillin', value: 40, color: '#76e4e1' },
    { name: 'Ibuprofen', value: 30, color: '#4ebcd3' },
    { name: 'Alprazolam', value: 13.3, color: '#378bb5' },
    { name: 'Benzonatate', value: 10, color: '#2d6e97' },
    { name: 'Cephalexin', value: 6.7, color: '#23466a' }
  ];

  return (
         <div className="h-120 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>  
                  <Pie
                    data={medicationData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={180}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                
                  >
                    {medicationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                

                </PieChart>
              </ResponsiveContainer>
            </div>
  );
}