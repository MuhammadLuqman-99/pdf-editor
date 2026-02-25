import React from 'react'

export default function LoadingOverlay({ message }) {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <div className="loading-text">{message}</div>
    </div>
  )
}
