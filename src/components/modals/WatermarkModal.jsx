import React, { useState } from 'react'

export default function WatermarkModal({ onApply, onClose }) {
  const [text, setText] = useState('DRAFT')
  const [size, setSize] = useState(60)
  const [opacity, setOpacity] = useState(0.2)
  const [rotation, setRotation] = useState(-45)
  const [color, setColor] = useState('#cccccc')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 400 }}>
        <h3>Add Watermark</h3>

        <div className="watermark-preview">
          <span style={{
            fontSize: size * 0.4,
            color: color,
            opacity: opacity,
            transform: `rotate(${rotation}deg)`,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}>
            {text || 'WATERMARK'}
          </span>
        </div>

        <div className="watermark-settings">
          <label>
            Text:
            <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Enter watermark text" />
          </label>
          <label>
            Size: {size}px
            <input type="range" min="20" max="120" value={size} onChange={e => setSize(parseInt(e.target.value))} />
          </label>
          <label>
            Opacity: {Math.round(opacity * 100)}%
            <input type="range" min="5" max="80" value={Math.round(opacity * 100)} onChange={e => setOpacity(parseInt(e.target.value) / 100)} />
          </label>
          <label>
            Rotation: {rotation}&deg;
            <input type="range" min="-90" max="90" value={rotation} onChange={e => setRotation(parseInt(e.target.value))} />
          </label>
          <label>
            Color:
            <input type="color" className="color-picker" value={color} onChange={e => setColor(e.target.value)} />
          </label>
        </div>

        <div className="modal-actions">
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="modal-btn modal-btn-primary" onClick={() => onApply({ text, size, opacity, rotation, color })}>
            Apply to All Pages
          </button>
        </div>
      </div>
    </div>
  )
}
