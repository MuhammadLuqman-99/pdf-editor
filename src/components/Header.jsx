import React from 'react'
import { HomeIcon, ChevronDown, DownloadIcon, PrintIcon, ShareIcon } from '../utils/icons'

export default function Header({ fileName, pdfDoc, onOpenFile, onSave, onPrint, onDownload }) {
  return (
    <div className="header">
      <div className="header-left">
        <button className="header-home" title="Home" onClick={onOpenFile}>
          <HomeIcon />
        </button>
        {fileName && (
          <span className="header-filename">
            {fileName} <ChevronDown />
          </span>
        )}
      </div>

      <div className="header-tabs">
        <button className="header-tab active">Edit &amp; fill</button>
        <button className="header-tab" disabled title="Coming soon">Invite to sign</button>
        <button className="header-tab" disabled title="Coming soon">Create form</button>
      </div>

      <div className="header-right">
        <button className="header-icon-btn" onClick={onDownload} disabled={!pdfDoc} title="Download">
          <DownloadIcon />
        </button>
        <button className="header-icon-btn" onClick={onPrint} disabled={!pdfDoc} title="Print">
          <PrintIcon />
        </button>
        <button className="header-icon-btn" disabled title="Share">
          <ShareIcon />
        </button>
        <button className="btn-outlined" onClick={onOpenFile}>
          {pdfDoc ? 'Open another' : 'Open PDF'}
        </button>
        <button className="btn-primary-orange" onClick={onSave} disabled={!pdfDoc}>
          Save PDF
        </button>
      </div>
    </div>
  )
}
