import React from 'react'
export default function Table({ columns, data, renderRowActions }) {
  return (
    <table className="table">
      <thead>
        <tr>{columns.map(c => <th key={c.key}>{c.title}</th>)}</tr>
      </thead>
      <tbody>
        {data.length === 0 && <tr><td colSpan={columns.length} className="loading">No records found</td></tr>}
        {data.map(row => (
          <tr key={row.id}>
            {columns.map(c => <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}
            {renderRowActions && <td>{renderRowActions(row)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
