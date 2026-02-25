import React, { useRef, useEffect, useState } from 'react'

export default function SignatureModal({ type, onApply, onClose }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const isInitials = type === 'initials'
  const width = isInitials ? 300 : 500
  const height = isInitials ? 150 : 200

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fafafa'
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = '#e0e0e0'
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(20, height - 40)
    ctx.lineTo(width - 20, height - 40)
    ctx.stroke()
    ctx.setLineDash([])
  }, [width, height])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
    return { x, y }
  }

  const onStart = (e) => {
    setDrawing(true)
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    e.preventDefault()
  }

  const onMove = (e) => {
    if (!drawing) return
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    e.preventDefault()
  }

  const onEnd = () => setDrawing(false)

  const handleClear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fafafa'
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = '#e0e0e0'
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(20, height - 40)
    ctx.lineTo(width - 20, height - 40)
    ctx.stroke()
    ctx.setLineDash([])
  }

  const handleApply = () => {
    const canvas = canvasRef.current
    // Create a trimmed version (remove the background)
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const ctx = tempCanvas.getContext('2d')
    ctx.drawImage(canvas, 0, 0)
    onApply(tempCanvas.toDataURL('image/png'))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: width + 48 }}>
        <h3>{isInitials ? 'Draw Your Initials' : 'Draw Your Signature'}</h3>
        <canvas
          ref={canvasRef}
          className="signature-canvas"
          width={width}
          height={height}
          onMouseDown={onStart}
          onMouseMove={onMove}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
          onTouchStart={onStart}
          onTouchMove={onMove}
          onTouchEnd={onEnd}
        />
        <div className="modal-actions">
          <button className="modal-btn modal-btn-danger" onClick={handleClear}>Clear</button>
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="modal-btn modal-btn-primary" onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  )
}
