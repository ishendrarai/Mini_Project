import React, { useState } from 'react'
import Header from './components/Header'
import Tabs from './components/Tabs'
import Students from './routes/Students'
import Sections from './routes/Sections'
import Results from './routes/Results'

export default function App() {
  const [active, setActive] = useState('students')
  return (
    <div className="container">
      <Header />
      <Tabs active={active} onChange={setActive} />
      {active === 'students' && <Students />}
      {active === 'sections' && <Sections />}
      {active === 'results' && <Results />}
    </div>
  )
}
