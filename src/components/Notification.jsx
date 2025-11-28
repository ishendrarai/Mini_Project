import React from 'react'
export default function Notification({ type = 'success', message }) {
  if (!message) return null
  return (
    <div style={{ padding: 10, background: type === 'success' ? '#ecfdf5' : '#ffe6e6', borderRadius: 6, marginBottom: 12 }}>{message}</div>
  )
}
