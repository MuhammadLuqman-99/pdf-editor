import React, { useState, useCallback, useRef } from 'react'
import { PdfIcon } from '../utils/icons'

export default function UploadArea({ onFile, hasSubToolbar }) {
  const [dragover, setDragover] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragover(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }, [onFile])

  return (
    <div className="upload-area" style={hasSubToolbar ? { top: '156px' } : undefined}>
      <div
        className={`upload-box ${dragover ? 'dragover' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragover(true) }}
        onDragLeave={() => setDragover(false)}
        onDrop={handleDrop}
      >
        <div className="upload-icon">
          <PdfIcon />
        </div>
        <div className="upload-title">Open your PDF file</div>
        <div className="upload-subtitle">Click here or drag &amp; drop your PDF</div>
        <button className="upload-btn">Browse Files</button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={(e) => { if (e.target.files[0]) onFile(e.target.files[0]) }}
        />
      </div>
    </div>
  )
}
