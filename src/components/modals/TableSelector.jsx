import React, { useState } from 'react'

export default function TableSelector({ onSelect, onClose }) {
  const [hoverRow, setHoverRow] = useState(0)
  const [hoverCol, setHoverCol] = useState(0)
  const maxRows = 6
  const maxCols = 6

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 'auto' }}>
        <h3>Select Table Size</h3>
        <div className="table-grid" style={{ gridTemplateColumns: `repeat(${maxCols}, 24px)` }}>
          {Array.from({ length: maxRows * maxCols }, (_, i) => {
            const r = Math.floor(i / maxCols)
            const c = i % maxCols
            const selected = r < hoverRow && c < hoverCol
            return (
              <div
                key={i}
                className={`table-grid-cell ${selected ? 'selected' : ''}`}
                onMouseEnter={() => { setHoverRow(r + 1); setHoverCol(c + 1) }}
                onClick={() => onSelect(hoverRow, hoverCol)}
              />
            )
          })}
        </div>
        <div className="table-size-label">
          {hoverRow > 0 && hoverCol > 0 ? `${hoverRow} x ${hoverCol}` : 'Hover to select'}
        </div>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
