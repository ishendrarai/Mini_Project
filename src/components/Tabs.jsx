import React from 'react'
export default function Tabs({ active, onChange }) {
  return (
    <div className="tabs">
      <div className={`tab ${active === 'students' ? 'active' : ''}`} onClick={() => onChange('students')}>Students</div>
      <div className={`tab ${active === 'sections' ? 'active' : ''}`} onClick={() => onChange('sections')}>Sections</div>
      <div className={`tab ${active === 'results' ? 'active' : ''}`} onClick={() => onChange('results')}>Results</div>
    </div>
  )
}
