import { useState } from 'react'
import RevenueTable from "../components/revenue_table.tsx"
import MedicationDashboard from "../components/medication_dashbaord.tsx"

function App() {

  return (  
    <>
      <div >
          
          <RevenueTable/>
          <MedicationDashboard/>
      </div>
     
    </>
  )
}

export default App
