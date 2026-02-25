import React from 'react'
import { ChevronUp, ChevronDown, ZoomInIcon, ZoomOutIcon, FitIcon } from '../utils/icons'

export default function BottomBar({ currentPage, totalPages, zoomScale, onPageChange, onZoomChange, onFit }) {
  return (
    <div className="bottom-bar">
      <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}>
        <ChevronUp />
      </button>
      <input
        className="page-input"
        type="number"
        min={1}
        max={totalPages}
        value={currentPage}
        onChange={(e) => {
          const p = parseInt(e.target.value)
          if (p >= 1 && p <= totalPages) onPageChange(p)
        }}
      />
      <span className="page-total">/ {totalPages}</span>
      <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages}>
        <ChevronDown />
      </button>

      <div className="bar-divider" />

      <button onClick={() => onZoomChange(-0.1)} title="Zoom Out">
        <ZoomOutIcon />
      </button>
      <span className="zoom-level">{Math.round(zoomScale * 100)}%</span>
      <button onClick={() => onZoomChange(0.1)} title="Zoom In">
        <ZoomInIcon />
      </button>
      <button className="fit-btn" onClick={onFit} title="Fit to page">
        <FitIcon />
        <span>Fit</span>
      </button>
    </div>
  )
}
