import React, { useState, useCallback, useRef, useEffect } from 'react'
import usePdfLoader from './hooks/usePdfLoader'
import useUndoRedo from './hooks/useUndoRedo'
import useZoom from './hooks/useZoom'
import Header from './components/Header'
import Toolbar from './components/Toolbar'
import SubToolbar from './components/SubToolbar'
import UploadArea from './components/UploadArea'
import Canvas from './components/Canvas'
import Sidebar from './components/Sidebar'
import BottomBar from './components/BottomBar'
import Toast from './components/Toast'
import LoadingOverlay from './components/LoadingOverlay'
import SignatureModal from './components/modals/SignatureModal'
import WatermarkModal from './components/modals/WatermarkModal'
import TableSelector from './components/modals/TableSelector'
import { RENDER_SCALE, TEXT_TOOLS } from './utils/constants'
import { toNorm, updateNormPosition } from './utils/coordinates'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import {
  saveTextEntry, saveCircleEntry, saveRectEntry, saveTextBoxEntry,
  saveLineEntry, saveArrowEntry, saveImageEntry, saveDrawEntry,
  saveStickyEntry, saveTableEntry, saveWatermarkEntry,
} from './utils/saveHelpers'

export default function App() {
  const { pdfDoc, pdfBytes, fileName, loading: pdfLoading, error: pdfError, loadPdf } = usePdfLoader()
  const { entries, addEntry, removeEntry, undo, redo, clearAll, updateEntries } = useUndoRedo()
  const { zoomScale, changeZoom, fitZoom } = useZoom()

  const [currentTool, setCurrentTool] = useState('text')
  const [fontSize, setFontSize] = useState(11)
  const [textColor, setTextColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [editMode, setEditMode] = useState(true)
  const [toast, setToast] = useState(null)
  const [loadingMsg, setLoadingMsg] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Modals
  const [signModal, setSignModal] = useState(null) // null | 'sign' | 'initials'
  const [watermarkModal, setWatermarkModal] = useState(false)
  const [tableModal, setTableModal] = useState(false)

  // Pending placement
  const [pendingImage, setPendingImage] = useState(null) // { dataUrl, imageBytes, imageType }
  const [pendingSignature, setPendingSignature] = useState(null) // { dataUrl, imageBytes }

  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const canvasAreaRef = useRef(null)
  const dragStateRef = useRef({ active: false, el: null, entry: null, startX: 0, startY: 0, origLeft: 0, origTop: 0 })
  const drawStateRef = useRef({ active: false, points: [], svgPath: null, pageNum: null })
  const rectDrawRef = useRef({ active: false, startX: 0, startY: 0, element: null, pageNum: null, layer: null })

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // File handling
  const handleFile = useCallback(async (file) => {
    if (!file || file.type !== 'application/pdf') {
      showToast('Please select a PDF file', 'error')
      return
    }
    setLoadingMsg('Loading PDF...')
    const doc = await loadPdf(file)
    setLoadingMsg(null)
    if (doc) showToast('PDF loaded! Click anywhere to add content.')
  }, [loadPdf, showToast])

  // Tool selection
  const handleToolSelect = useCallback((toolId) => {
    if (toolId === 'undo') { undo(); showToast('Undone', 'success'); return }
    if (toolId === 'redo') { redo(); showToast('Redone', 'success'); return }
    if (toolId === 'pages') { setSidebarOpen(p => !p); return }
    if (toolId === 'sign') { setSignModal('sign'); return }
    if (toolId === 'initials') { setSignModal('initials'); return }
    if (toolId === 'image') { imageInputRef.current?.click(); return }
    if (toolId === 'watermark') { setWatermarkModal(true); return }
    if (toolId === 'table') { setTableModal(true); return }
    setCurrentTool(toolId)
  }, [undo, redo, showToast])

  // Global drag controller
  useEffect(() => {
    const onMove = (e) => {
      const ds = dragStateRef.current
      if (!ds.active) return
      const cx = e.touches ? e.touches[0].clientX : e.clientX
      const cy = e.touches ? e.touches[0].clientY : e.clientY
      ds.el.style.left = (ds.origLeft + cx - ds.startX) + 'px'
      ds.el.style.top = (ds.origTop + cy - ds.startY) + 'px'
      if (e.cancelable) e.preventDefault()
    }
    const onUp = () => {
      const ds = dragStateRef.current
      if (!ds.active) return
      ds.active = false
      if (ds.entry) updateNormPosition(ds.entry, zoomScale)
      ds.el = null
      ds.entry = null
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
    }
  }, [zoomScale])

  // Rect drawing (blackout/highlight/erase/textbox) drag handler
  useEffect(() => {
    const onMove = (e) => {
      const rd = rectDrawRef.current
      if (!rd.active || !rd.element) return
      const cx = e.touches ? e.touches[0].clientX : e.clientX
      const cy = e.touches ? e.touches[0].clientY : e.clientY
      const layerRect = rd.layer.getBoundingClientRect()
      const curX = cx - layerRect.left
      const curY = cy - layerRect.top
      const x = Math.min(rd.startX, curX)
      const y = Math.min(rd.startY, curY)
      const w = Math.abs(curX - rd.startX)
      const h = Math.abs(curY - rd.startY)
      rd.element.style.left = x + 'px'
      rd.element.style.top = y + 'px'
      rd.element.style.width = w + 'px'
      rd.element.style.height = h + 'px'
      if (e.cancelable) e.preventDefault()
    }
    const onUp = () => {
      const rd = rectDrawRef.current
      if (!rd.active) return
      rd.active = false
      const w = parseFloat(rd.element.style.width) || 0
      const h = parseFloat(rd.element.style.height) || 0
      if (w < 5 || h < 5) {
        rd.element.remove()
        return
      }
      const scale = RENDER_SCALE * zoomScale
      const entry = {
        element: rd.element,
        pageNum: rd.pageNum,
        normX: toNorm(parseFloat(rd.element.style.left), zoomScale),
        normY: toNorm(parseFloat(rd.element.style.top), zoomScale),
        normWidth: w / scale,
        normHeight: h / scale,
        type: currentTool,
        color: textColor,
        borderColor: textColor,
        fontSize: fontSize,
        strokeWidth: strokeWidth,
      }
      if (currentTool === 'textbox') {
        rd.element.contentEditable = 'true'
        rd.element.focus()
      }
      const delBtn = document.createElement('button')
      delBtn.className = 'delete-btn'
      delBtn.innerHTML = '&times;'
      delBtn.onmousedown = (e) => { e.stopPropagation(); e.preventDefault() }
      delBtn.onclick = (e) => { e.stopPropagation(); removeEntry(entry) }
      rd.element.appendChild(delBtn)
      addEntry(entry)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
    }
  }, [zoomScale, currentTool, textColor, fontSize, strokeWidth, addEntry, removeEntry])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const isTyping = document.activeElement?.contentEditable === 'true'
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) { e.preventDefault(); redo() }
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); handleSave() }
      if (e.key === 'Escape' && isTyping) document.activeElement.blur()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [undo, redo])

  // Image file handler
  const handleImageFile = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await new Promise(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(file)
    })
    const imageBytes = await file.arrayBuffer()
    setPendingImage({ dataUrl, imageBytes: new Uint8Array(imageBytes), imageType: file.type })
    setCurrentTool('image')
    showToast('Click on the PDF to place the image')
    e.target.value = ''
  }, [showToast])

  // Signature completed
  const handleSignatureComplete = useCallback((dataUrl) => {
    fetch(dataUrl).then(r => r.arrayBuffer()).then(buf => {
      setPendingSignature({ dataUrl, imageBytes: new Uint8Array(buf) })
      setCurrentTool(signModal === 'initials' ? 'initials' : 'sign')
      setSignModal(null)
      showToast('Click on the PDF to place ' + (signModal === 'initials' ? 'initials' : 'signature'))
    })
  }, [signModal, showToast])

  // Table selected
  const handleTableSelect = useCallback((rows, cols) => {
    setTableModal(false)
    setCurrentTool('table')
    // Store pending table config
    window.__pendingTable = { rows, cols }
    showToast(`Click on the PDF to place ${rows}x${cols} table`)
  }, [showToast])

  // Watermark applied
  const handleWatermarkApply = useCallback((config) => {
    setWatermarkModal(false)
    // Add watermark as a special entry
    const entry = {
      element: null,
      pageNum: 0, // 0 means all pages
      normX: 0, normY: 0,
      type: 'watermark',
      text: config.text,
      wmSize: config.size,
      opacity: config.opacity,
      rotation: config.rotation,
      color: config.color,
    }
    addEntry(entry)
    showToast('Watermark added to all pages')
  }, [addEntry, showToast])

  // Place element on canvas click
  const handleCanvasClick = useCallback((pageNum, x, y, layer) => {
    if (!editMode) return
    if (currentTool === 'select') return

    const scale = RENDER_SCALE * zoomScale

    // Drag-draw tools start on mousedown instead
    if (['blackout', 'highlight', 'erase', 'textbox'].includes(currentTool)) return

    if (currentTool === 'text') {
      const box = document.createElement('div')
      box.className = 'text-box'
      box.contentEditable = 'true'
      box.style.left = x + 'px'
      box.style.top = y + 'px'
      box.style.fontSize = (fontSize * zoomScale) + 'px'
      box.style.color = textColor
      const entry = {
        element: box, pageNum,
        normX: toNorm(x, zoomScale), normY: toNorm(y, zoomScale),
        type: 'text', fontSize, color: textColor,
      }
      const delBtn = document.createElement('button')
      delBtn.className = 'delete-btn'
      delBtn.innerHTML = '&times;'
      delBtn.onmousedown = (e) => { e.stopPropagation(); e.preventDefault() }
      delBtn.onclick = (e) => { e.stopPropagation(); removeEntry(entry) }
      box.appendChild(delBtn)
      addDragHandle(box, entry)
      layer.appendChild(box)
      box.focus()
      addEntry(entry)
    }
    else if (currentTool === 'check' || currentTool === 'cross') {
      const symbol = currentTool === 'check' ? '\u2713' : '\u2717'
      const box = document.createElement('div')
      box.className = 'text-box'
      box.style.left = x + 'px'
      box.style.top = (y - 8) + 'px'
      box.style.fontSize = (fontSize * zoomScale) + 'px'
      box.style.color = textColor
      box.style.fontWeight = 'bold'
      box.textContent = symbol
      const entry = {
        element: box, pageNum,
        normX: toNorm(x, zoomScale), normY: toNorm(y - 8, zoomScale),
        type: 'symbol', fontSize, color: textColor,
      }
      const delBtn = document.createElement('button')
      delBtn.className = 'delete-btn'
      delBtn.innerHTML = '&times;'
      delBtn.onmousedown = (e) => { e.stopPropagation(); e.preventDefault() }
      delBtn.onclick = (e) => { e.stopPropagation(); removeEntry(entry) }
      box.appendChild(delBtn)
      addDragHandle(box, entry)
      layer.appendChild(box)
      addEntry(entry)
    }
    else if (currentTool === 'date') {
      const now = new Date()
      const dateStr = `${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}/${now.getFullYear()}`
      const box = document.createElement('div')
      box.className = 'text-box'
      box.contentEditable = 'true'
      box.style.left = x + 'px'
      box.style.top = y + 'px'
      box.style.fontSize = (fontSize * zoomScale) + 'px'
      box.style.color = textColor
      box.textContent = dateStr
      const entry = {
        element: box, pageNum,
        normX: toNorm(x, zoomScale), normY: toNorm(y, zoomScale),
        type: 'date', fontSize, color: textColor,
      }
      const delBtn = document.createElement('button')
      delBtn.className = 'delete-btn'
      delBtn.innerHTML = '&times;'
      delBtn.onmousedown = (e) => { e.stopPropagation(); e.preventDefault() }
      delBtn.onclick = (e) => { e.stopPropagation(); removeEntry(entry) }
      box.appendChild(delBtn)
      addDragHandle(box, entry)
      layer.appendChild(box)
      box.focus()
      addEntry(entry)
    }
    else if (currentTool === 'circle') {
      const radius = 25 * zoomScale
      const el = document.createElement('div')
      el.className = 'shape-element'
      el.style.left = (x - radius) + 'px'
      el.style.top = (y - radius) + 'px'
      el.style.width = (radius * 2) + 'px'
      el.style.height = (radius * 2) + 'px'
      el.style.borderRadius = '50%'
      el.style.border = `${strokeWidth}px solid ${textColor}`
      const entry = {
        element: el, pageNum,
        normX: toNorm(x - radius, zoomScale), normY: toNorm(y - radius, zoomScale),
        type: 'circle', radius: 25, color: textColor, borderColor: textColor, strokeWidth,
      }
      const delBtn = document.createElement('button')
      delBtn.className = 'delete-btn'
      delBtn.innerHTML = '&times;'
      delBtn.onmousedown = (e) => { e.stopPropagation(); e.preventDefault() }
      delBtn.onclick = (e) => { e.stopPropagation(); removeEntry(entry) }
      el.appendChild(delBtn)
      el.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('delete-btn')) return
        startDrag(e, el, entry)
      })
      layer.appendChild(el)
      addEntry(entry)
    }
    else if (currentTool === 'line' || currentTool === 'arrow') {
      // Two-click line: use svg overlay
      let svg = layer.querySelector('.svg-overlay')
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('class', 'svg-overlay')
        svg.style.width = '100%'
        svg.style.height = '100%'
        layer.appendChild(svg)
      }
      if (!window.__lineStart) {
        window.__lineStart = { x, y, pageNum }
        showToast('Click again to set the end point')
        return
      }
      const start = window.__lineStart
      if (start.pageNum !== pageNum) {
        window.__lineStart = null
        showToast('Start and end must be on same page', 'warning')
        return
      }
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', start.x)
      line.setAttribute('y1', start.y)
      line.setAttribute('x2', x)
      line.setAttribute('y2', y)
      line.setAttribute('stroke', textColor)
      line.setAttribute('stroke-width', strokeWidth * zoomScale)
      line.setAttribute('stroke-linecap', 'round')
      svg.appendChild(line)

      if (currentTool === 'arrow') {
        const angle = Math.atan2(y - start.y, x - start.x)
        const headLen = 14 * zoomScale
        const a1 = angle - Math.PI / 6
        const a2 = angle + Math.PI / 6
        const ah = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
        ah.setAttribute('points', `${x - headLen*Math.cos(a1)},${y - headLen*Math.sin(a1)} ${x},${y} ${x - headLen*Math.cos(a2)},${y - headLen*Math.sin(a2)}`)
        ah.setAttribute('stroke', textColor)
        ah.setAttribute('stroke-width', strokeWidth * zoomScale)
        ah.setAttribute('fill', 'none')
        ah.setAttribute('stroke-linecap', 'round')
        ah.setAttribute('stroke-linejoin', 'round')
        svg.appendChild(ah)
      }

      // Wrapper for delete
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      g.style.cursor = 'pointer'
      svg.removeChild(line)
      g.appendChild(line)
      if (currentTool === 'arrow') {
        const ah = svg.lastChild
        svg.removeChild(ah)
        g.appendChild(ah)
      }
      svg.appendChild(g)

      const entry = {
        element: g, pageNum,
        normX: toNorm(start.x, zoomScale), normY: toNorm(start.y, zoomScale),
        normX2: toNorm(x, zoomScale), normY2: toNorm(y, zoomScale),
        type: currentTool, strokeColor: textColor, strokeWidth, color: textColor,
      }
      g.addEventListener('click', () => {
        if (confirm('Delete this ' + currentTool + '?')) removeEntry(entry)
      })
      addEntry(entry)
      window.__lineStart = null
    }
    else if (currentTool === 'sign' || currentTool === 'initials') {
      if (!pendingSignature) { showToast('Draw a signature first', 'warning'); return }
      const imgW = currentTool === 'initials' ? 80 : 160
      const imgH = currentTool === 'initials' ? 40 : 80
      const el = document.createElement('div')
      el.className = 'image-element'
      el.style.left = x + 'px'
      el.style.top = y + 'px'
      el.style.width = (imgW * zoomScale) + 'px'
      el.style.height = (imgH * zoomScale) + 'px'
      const img = document.createElement('img')
      img.src = pendingSignature.dataUrl
      img.style.width = '100%'
      img.style.height = '100%'
      el.appendChild(img)
      const entry = {
        element: el, pageNum,
        normX: toNorm(x, zoomScale), normY: toNorm(y, zoomScale),
        normWidth: imgW, normHeight: imgH,
        type: currentTool === 'initials' ? 'initials' : 'signature',
        imageBytes: pendingSignature.imageBytes, imageType: 'image/png',
        dataUrl: pendingSignature.dataUrl,
      }
      const delBtn = document.createElement('button')
      delBtn.className = 'delete-btn'
      delBtn.innerHTML = '&times;'
      delBtn.onmousedown = (e) => { e.stopPropagation(); e.preventDefault() }
      delBtn.onclick = (e) => { e.stopPropagation(); removeEntry(entry) }
      el.appendChild(delBtn)
      addResizeHandles(el, entry)
      el.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('delete-btn') || e.target.classList.contains('resize-handle')) return
        startDrag(e, el, entry)
      })
      layer.appendChild(el)
      addEntry(entry)
      setPendingSignature(null)
    }
    else if (currentTool === 'image') {
      if (!pendingImage) { showToast('Select an image first', 'warning'); return }
      const el = document.createElement('div')
      el.className = 'image-element'
      el.style.left = x + 'px'
      el.style.top = y + 'px'
      el.style.width = (150 * zoomScale) + 'px'
      el.style.height = 'auto'
      const img = document.createElement('img')
      img.src = pendingImage.dataUrl
      img.style.width = '100%'
      img.onload = () => {
        const ratio = img.naturalHeight / img.naturalWidth
        const normW = 150
        const normH = normW * ratio
        entry.normHeight = normH
        el.style.height = (normH * zoomScale) + 'px'
      }
      el.appendChild(img)
      const entry = {
        element: el, pageNum,
        normX: toNorm(x, zoomScale), normY: toNorm(y, zoomScale),
        normWidth: 150, normHeight: 150,
        type: 'image',
        imageBytes: pendingImage.imageBytes, imageType: pendingImage.imageType,
        dataUrl: pendingImage.dataUrl,
      }
      const delBtn = document.createElement('button')
      delBtn.className = 'delete-btn'
      delBtn.innerHTML = '&times;'
      delBtn.onmousedown = (e) => { e.stopPropagation(); e.preventDefault() }
      delBtn.onclick = (e) => { e.stopPropagation(); removeEntry(entry) }
      el.appendChild(delBtn)
      addResizeHandles(el, entry)
      el.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('delete-btn') || e.target.classList.contains('resize-handle')) return
        startDrag(e, el, entry)
      })
      layer.appendChild(el)
      addEntry(entry)
      setPendingImage(null)
    }
    else if (currentTool === 'sticky') {
      const el = document.createElement('div')
      el.className = 'sticky-note'
      el.contentEditable = 'true'
      el.style.left = x + 'px'
      el.style.top = y + 'px'
      const entry = {
        element: el, pageNum,
        normX: toNorm(x, zoomScale), normY: toNorm(y, zoomScale),
        normWidth: 150 / (RENDER_SCALE * zoomScale) * RENDER_SCALE,
        normHeight: 100 / (RENDER_SCALE * zoomScale) * RENDER_SCALE,
        type: 'sticky', fontSize: 10, color: '#000000',
      }
      const delBtn = document.createElement('button')
      delBtn.className = 'delete-btn'
      delBtn.innerHTML = '&times;'
      delBtn.onmousedown = (e) => { e.stopPropagation(); e.preventDefault() }
      delBtn.onclick = (e) => { e.stopPropagation(); removeEntry(entry) }
      el.appendChild(delBtn)
      const handle = document.createElement('div')
      handle.className = 'drag-handle'
      handle.innerHTML = '\u2630'
      handle.addEventListener('mousedown', (e) => startDrag(e, el, entry))
      handle.addEventListener('touchstart', (e) => startDrag(e, el, entry), { passive: false })
      el.appendChild(handle)
      layer.appendChild(el)
      el.focus()
      addEntry(entry)
    }
    else if (currentTool === 'table') {
      const tc = window.__pendingTable || { rows: 3, cols: 3 }
      const cellW = 80 * zoomScale
      const cellH = 30 * zoomScale
      const tW = cellW * tc.cols
      const tH = cellH * tc.rows
      const el = document.createElement('div')
      el.className = 'shape-element'
      el.style.left = x + 'px'
      el.style.top = y + 'px'
      el.style.width = tW + 'px'
      el.style.height = tH + 'px'
      el.style.display = 'grid'
      el.style.gridTemplateColumns = `repeat(${tc.cols}, 1fr)`
      el.style.gridTemplateRows = `repeat(${tc.rows}, 1fr)`
      const cellData = []
      for (let r = 0; r < tc.rows; r++) {
        cellData[r] = []
        for (let c = 0; c < tc.cols; c++) {
          const cell = document.createElement('div')
          cell.contentEditable = 'true'
          cell.style.border = '1px solid #000'
          cell.style.padding = '2px 4px'
          cell.style.fontSize = (10 * zoomScale) + 'px'
          cell.style.outline = 'none'
          cell.style.overflow = 'hidden'
          cell.style.background = '#fff'
          cellData[r][c] = ''
          const ri = r, ci = c
          cell.addEventListener('input', () => {
            if (entry.cellData) entry.cellData[ri][ci] = cell.textContent
          })
          cell.addEventListener('mousedown', (e) => e.stopPropagation())
          el.appendChild(cell)
        }
      }
      const entry = {
        element: el, pageNum,
        normX: toNorm(x, zoomScale), normY: toNorm(y, zoomScale),
        normWidth: tW / (RENDER_SCALE * zoomScale),
        normHeight: tH / (RENDER_SCALE * zoomScale),
        type: 'table', rows: tc.rows, cols: tc.cols, cellData,
        fontSize: 10, color: '#000000',
      }
      const delBtn = document.createElement('button')
      delBtn.className = 'delete-btn'
      delBtn.innerHTML = '&times;'
      delBtn.onmousedown = (e) => { e.stopPropagation(); e.preventDefault() }
      delBtn.onclick = (e) => { e.stopPropagation(); removeEntry(entry) }
      el.appendChild(delBtn)
      el.addEventListener('mousedown', (e) => {
        if (e.target.contentEditable === 'true') return
        if (e.target.classList.contains('delete-btn')) return
        startDrag(e, el, entry)
      })
      layer.appendChild(el)
      addEntry(entry)
      window.__pendingTable = null
    }
  }, [currentTool, fontSize, textColor, strokeWidth, zoomScale, editMode, addEntry, removeEntry, showToast, pendingSignature, pendingImage])

  // Canvas mousedown for drag-draw tools
  const handleCanvasMouseDown = useCallback((pageNum, x, y, layer, e) => {
    if (!editMode) return
    if (['blackout', 'highlight', 'erase', 'textbox'].includes(currentTool)) {
      const el = document.createElement('div')
      el.className = 'shape-element'
      el.style.left = x + 'px'
      el.style.top = y + 'px'
      el.style.width = '0px'
      el.style.height = '0px'
      if (currentTool === 'blackout') el.style.background = '#000'
      else if (currentTool === 'highlight') { el.style.background = 'rgba(255,255,0,0.3)' }
      else if (currentTool === 'erase') { el.style.background = '#fff'; el.style.border = '1px dashed #ccc' }
      else if (currentTool === 'textbox') {
        el.style.border = `1px solid ${textColor}`
        el.style.background = 'transparent'
        el.style.fontSize = (fontSize * zoomScale) + 'px'
        el.style.color = textColor
        el.style.padding = '4px'
        el.style.fontFamily = 'Arial, Helvetica, sans-serif'
        el.style.outline = 'none'
        el.style.cursor = 'text'
        el.style.whiteSpace = 'pre-wrap'
        el.style.wordBreak = 'break-word'
      }
      layer.appendChild(el)
      rectDrawRef.current = { active: true, startX: x, startY: y, element: el, pageNum, layer }
      e.preventDefault()
    }
    else if (currentTool === 'draw') {
      const ds = drawStateRef.current
      ds.active = true
      ds.points = [{ x, y }]
      ds.pageNum = pageNum
      let svg = layer.querySelector('.svg-overlay')
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('class', 'svg-overlay')
        svg.style.width = '100%'
        svg.style.height = '100%'
        layer.appendChild(svg)
      }
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('stroke', textColor)
      path.setAttribute('stroke-width', strokeWidth * zoomScale)
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke-linecap', 'round')
      path.setAttribute('stroke-linejoin', 'round')
      path.setAttribute('d', `M ${x} ${y}`)
      svg.appendChild(path)
      ds.svgPath = path
      e.preventDefault()
    }
  }, [currentTool, editMode, textColor, fontSize, strokeWidth, zoomScale])

  // Freehand draw mousemove/mouseup
  useEffect(() => {
    const onMove = (e) => {
      const ds = drawStateRef.current
      if (!ds.active || !ds.svgPath) return
      const layer = document.querySelector(`.text-layer[data-page="${ds.pageNum}"]`)
      if (!layer) return
      const rect = layer.getBoundingClientRect()
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
      ds.points.push({ x: cx, y: cy })
      let d = `M ${ds.points[0].x} ${ds.points[0].y}`
      for (let i = 1; i < ds.points.length; i++) {
        d += ` L ${ds.points[i].x} ${ds.points[i].y}`
      }
      ds.svgPath.setAttribute('d', d)
      if (e.cancelable) e.preventDefault()
    }
    const onUp = () => {
      const ds = drawStateRef.current
      if (!ds.active) return
      ds.active = false
      if (ds.points.length < 2 || !ds.svgPath) return
      const scale = RENDER_SCALE * zoomScale
      // Build normalized path
      let normD = `M ${ds.points[0].x / scale} ${ds.points[0].y / scale}`
      for (let i = 1; i < ds.points.length; i++) {
        normD += ` L ${ds.points[i].x / scale} ${ds.points[i].y / scale}`
      }
      const entry = {
        element: ds.svgPath, pageNum: ds.pageNum,
        normX: 0, normY: 0,
        type: 'draw', pathD: normD,
        strokeColor: textColor, strokeWidth, color: textColor,
      }
      ds.svgPath.style.cursor = 'pointer'
      ds.svgPath.style.pointerEvents = 'stroke'
      ds.svgPath.addEventListener('click', () => {
        if (confirm('Delete this drawing?')) {
          ds.svgPath.remove()
          removeEntry(entry)
        }
      })
      addEntry(entry)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
    }
  }, [zoomScale, textColor, strokeWidth, addEntry, removeEntry])

  const startDrag = (e, el, entry) => {
    const cx = e.touches ? e.touches[0].clientX : e.clientX
    const cy = e.touches ? e.touches[0].clientY : e.clientY
    dragStateRef.current = {
      active: true, el, entry,
      startX: cx, startY: cy,
      origLeft: parseFloat(el.style.left) || 0,
      origTop: parseFloat(el.style.top) || 0,
    }
    el.classList.add('selected')
    e.preventDefault()
    e.stopPropagation()
  }

  const addDragHandle = (box, entry) => {
    const handle = document.createElement('div')
    handle.className = 'drag-handle'
    handle.innerHTML = '\u2630'
    handle.addEventListener('mousedown', (e) => startDrag(e, box, entry))
    handle.addEventListener('touchstart', (e) => startDrag(e, box, entry), { passive: false })
    box.appendChild(handle)
  }

  const addResizeHandles = (el, entry) => {
    ['se'].forEach(pos => {
      const handle = document.createElement('div')
      handle.className = `resize-handle ${pos}`
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        e.preventDefault()
        const startX = e.clientX
        const startY = e.clientY
        const startW = parseFloat(el.style.width) || 150
        const startH = parseFloat(el.style.height) || 100
        const onMove = (ev) => {
          const dx = ev.clientX - startX
          const dy = ev.clientY - startY
          const newW = Math.max(40, startW + dx)
          const newH = Math.max(30, startH + dy)
          el.style.width = newW + 'px'
          el.style.height = newH + 'px'
          if (el.querySelector('img')) el.querySelector('img').style.height = newH + 'px'
          const scale = RENDER_SCALE * zoomScale
          entry.normWidth = newW / scale
          entry.normHeight = newH / scale
        }
        const onUp = () => {
          document.removeEventListener('mousemove', onMove)
          document.removeEventListener('mouseup', onUp)
        }
        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
      })
      el.appendChild(handle)
    })
  }

  // Save PDF
  const handleSave = useCallback(async () => {
    if (!pdfBytes || entries.length === 0) {
      showToast('No changes to save', 'warning')
      return
    }
    setLoadingMsg('Saving PDF...')
    try {
      const pdfDocLib = await PDFDocument.load(pdfBytes)
      const font = await pdfDocLib.embedFont(StandardFonts.Helvetica)
      const pages = pdfDocLib.getPages()

      // Update positions
      entries.forEach(entry => {
        if (entry.element && entry.type !== 'watermark' && entry.type !== 'draw') {
          updateNormPosition(entry, zoomScale)
        }
      })

      for (const entry of entries) {
        if (entry.type === 'watermark') {
          saveWatermarkEntry(pages, entry, font)
          continue
        }
        const page = pages[entry.pageNum - 1]
        if (!page) continue
        const pageHeight = page.getSize().height

        switch (entry.type) {
          case 'text': case 'symbol': case 'date':
            saveTextEntry(page, entry, font, pageHeight); break
          case 'circle':
            saveCircleEntry(page, entry, pageHeight); break
          case 'blackout': case 'highlight': case 'erase':
            saveRectEntry(page, entry, pageHeight); break
          case 'textbox':
            saveTextBoxEntry(page, entry, font, pageHeight); break
          case 'line':
            saveLineEntry(page, entry, pageHeight); break
          case 'arrow':
            saveArrowEntry(page, entry, pageHeight); break
          case 'signature': case 'initials': case 'image':
            await saveImageEntry(pdfDocLib, page, entry, pageHeight); break
          case 'draw':
            saveDrawEntry(page, entry, pageHeight); break
          case 'sticky':
            saveStickyEntry(page, entry, font, pageHeight); break
          case 'table':
            saveTableEntry(page, entry, font, pageHeight); break
        }
      }

      const savedBytes = await pdfDocLib.save()
      const blob = new Blob([savedBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = (fileName || 'document').replace('.pdf', '') + '_edited.pdf'
      a.click()
      URL.revokeObjectURL(url)
      setLoadingMsg(null)
      showToast('PDF saved successfully!')
    } catch (err) {
      setLoadingMsg(null)
      showToast('Error saving: ' + err.message, 'error')
      console.error(err)
    }
  }, [pdfBytes, entries, zoomScale, fileName, showToast])

  const handlePrint = useCallback(() => window.print(), [])

  const showSubToolbar = pdfDoc && TEXT_TOOLS.concat(['circle', 'line', 'arrow', 'draw', 'blackout', 'highlight', 'erase', 'textbox']).includes(currentTool)

  return (
    <>
      <Header
        fileName={fileName}
        pdfDoc={pdfDoc}
        onOpenFile={() => fileInputRef.current?.click()}
        onSave={handleSave}
        onPrint={handlePrint}
        onDownload={handleSave}
      />
      <Toolbar
        currentTool={currentTool}
        onToolSelect={handleToolSelect}
        editMode={editMode}
        onToggleEditMode={() => setEditMode(p => !p)}
      />
      {showSubToolbar && (
        <SubToolbar
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          textColor={textColor}
          onTextColorChange={setTextColor}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          currentTool={currentTool}
        />
      )}

      <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]) }} />
      <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/jpg" style={{ display: 'none' }} onChange={handleImageFile} />

      {!pdfDoc ? (
        <UploadArea onFile={handleFile} hasSubToolbar={showSubToolbar} />
      ) : (
        <div className={`workspace ${showSubToolbar ? 'has-subtoolbar' : ''}`}>
          <Sidebar pdfDoc={pdfDoc} open={sidebarOpen} currentPage={currentPage} onPageClick={(p) => {
            setCurrentPage(p)
            const target = document.querySelector(`.page-container[data-page="${p}"]`)
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }} />
          <Canvas
            ref={canvasAreaRef}
            pdfDoc={pdfDoc}
            zoomScale={zoomScale}
            entries={entries}
            currentTool={currentTool}
            onCanvasClick={handleCanvasClick}
            onCanvasMouseDown={handleCanvasMouseDown}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {pdfDoc && (
        <BottomBar
          currentPage={currentPage}
          totalPages={pdfDoc.numPages}
          zoomScale={zoomScale}
          onPageChange={(p) => {
            setCurrentPage(p)
            const target = document.querySelector(`.page-container[data-page="${p}"]`)
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          onZoomChange={changeZoom}
          onFit={fitZoom}
        />
      )}

      {signModal && (
        <SignatureModal
          type={signModal}
          onApply={handleSignatureComplete}
          onClose={() => setSignModal(null)}
        />
      )}
      {watermarkModal && (
        <WatermarkModal
          onApply={handleWatermarkApply}
          onClose={() => setWatermarkModal(false)}
        />
      )}
      {tableModal && (
        <TableSelector
          onSelect={handleTableSelect}
          onClose={() => setTableModal(false)}
        />
      )}

      <Toast toast={toast} />
      {(loadingMsg || pdfLoading) && <LoadingOverlay message={loadingMsg || 'Loading...'} />}
    </>
  )
}
