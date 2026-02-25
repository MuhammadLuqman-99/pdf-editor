import React, { useEffect, useRef, forwardRef } from 'react'
import { RENDER_SCALE } from '../utils/constants'
import { fromNorm } from '../utils/coordinates'

const Canvas = forwardRef(function Canvas({ pdfDoc, zoomScale, entries, currentTool, onCanvasClick, onCanvasMouseDown, onPageChange }, ref) {
  const areaRef = useRef(null)

  // Store latest props in refs so event listeners always see current values
  const onClickRef = useRef(onCanvasClick)
  const onMouseDownRef = useRef(onCanvasMouseDown)
  const entriesRef = useRef(entries)
  const zoomRef = useRef(zoomScale)
  const toolRef = useRef(currentTool)

  useEffect(() => { onClickRef.current = onCanvasClick }, [onCanvasClick])
  useEffect(() => { onMouseDownRef.current = onCanvasMouseDown }, [onCanvasMouseDown])
  useEffect(() => { entriesRef.current = entries }, [entries])
  useEffect(() => { zoomRef.current = zoomScale }, [zoomScale])
  useEffect(() => { toolRef.current = currentTool }, [currentTool])

  // Update text-layer cursor when tool changes (without full re-render)
  useEffect(() => {
    if (!areaRef.current) return
    areaRef.current.querySelectorAll('.text-layer').forEach(layer => {
      layer.classList.toggle('select-mode', currentTool === 'select')
    })
  }, [currentTool])

  // Render pages — ONLY when pdfDoc or zoomScale changes
  useEffect(() => {
    if (!pdfDoc || !areaRef.current) return
    const area = areaRef.current
    area.innerHTML = ''

    const renderPages = async () => {
      const scale = RENDER_SCALE * zoomScale
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const viewport = page.getViewport({ scale })

        const wrapper = document.createElement('div')
        wrapper.className = 'page-wrapper'

        const badge = document.createElement('div')
        badge.className = 'page-badge'
        badge.textContent = `#${i}`
        wrapper.appendChild(badge)

        const container = document.createElement('div')
        container.className = 'page-container'
        container.dataset.page = i
        container.style.width = viewport.width + 'px'
        container.style.height = viewport.height + 'px'

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        container.appendChild(canvas)

        const textLayer = document.createElement('div')
        textLayer.className = 'text-layer'
        if (toolRef.current === 'select') textLayer.classList.add('select-mode')
        textLayer.dataset.page = i

        // Use refs so handlers always see latest state
        textLayer.addEventListener('click', (e) => {
          if (e.target !== e.currentTarget) return
          const rect = e.currentTarget.getBoundingClientRect()
          onClickRef.current(i, e.clientX - rect.left, e.clientY - rect.top, e.currentTarget)
        })

        textLayer.addEventListener('mousedown', (e) => {
          if (e.target !== e.currentTarget) return
          const rect = e.currentTarget.getBoundingClientRect()
          onMouseDownRef.current(i, e.clientX - rect.left, e.clientY - rect.top, e.currentTarget, e)
        })

        textLayer.addEventListener('touchend', (e) => {
          if (e.target !== e.currentTarget) return
          if (!e.changedTouches?.length) return
          const t = e.changedTouches[0]
          const rect = e.currentTarget.getBoundingClientRect()
          e.preventDefault()
          onClickRef.current(i, t.clientX - rect.left, t.clientY - rect.top, e.currentTarget)
        })

        container.appendChild(textLayer)
        wrapper.appendChild(container)
        area.appendChild(wrapper)

        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
      }

      // Restore existing entries after re-render (zoom change)
      const currentEntries = entriesRef.current
      currentEntries.forEach(entry => {
        if (!entry.element || entry.type === 'watermark') return
        const layer = area.querySelector(`.text-layer[data-page="${entry.pageNum}"]`)
        if (!layer) return

        if (entry.type === 'draw') {
          let svg = layer.querySelector('.svg-overlay')
          if (!svg) {
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            svg.setAttribute('class', 'svg-overlay')
            svg.style.width = '100%'
            svg.style.height = '100%'
            layer.appendChild(svg)
          }
          if (entry.pathD) {
            const s = RENDER_SCALE * zoomScale
            const scaledD = entry.pathD.replace(/[\d.]+/g, (match) => {
              const num = parseFloat(match)
              return isNaN(num) ? match : (num * s).toFixed(1)
            })
            entry.element.setAttribute('d', scaledD)
            entry.element.setAttribute('stroke-width', (entry.strokeWidth || 2) * zoomScale)
          }
          svg.appendChild(entry.element)
        } else if (entry.type === 'line' || entry.type === 'arrow') {
          let svg = layer.querySelector('.svg-overlay')
          if (!svg) {
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            svg.setAttribute('class', 'svg-overlay')
            svg.style.width = '100%'
            svg.style.height = '100%'
            layer.appendChild(svg)
          }
          const line = entry.element.querySelector('line')
          if (line) {
            line.setAttribute('x1', fromNorm(entry.normX, zoomScale))
            line.setAttribute('y1', fromNorm(entry.normY, zoomScale))
            line.setAttribute('x2', fromNorm(entry.normX2, zoomScale))
            line.setAttribute('y2', fromNorm(entry.normY2, zoomScale))
            line.setAttribute('stroke-width', (entry.strokeWidth || 2) * zoomScale)
          }
          svg.appendChild(entry.element)
        } else {
          entry.element.style.left = fromNorm(entry.normX, zoomScale) + 'px'
          entry.element.style.top = fromNorm(entry.normY, zoomScale) + 'px'
          // Set fontSize on the editable child (not the wrapper)
          const target = entry.editableEl || entry.element
          if (entry.fontSize) {
            target.style.fontSize = (entry.fontSize * RENDER_SCALE * zoomScale) + 'px'
          }
          if (entry.normWidth && !['text', 'symbol', 'date'].includes(entry.type)) {
            entry.element.style.width = fromNorm(entry.normWidth, zoomScale) + 'px'
          }
          if (entry.normHeight && !['text', 'symbol', 'date'].includes(entry.type)) {
            entry.element.style.height = fromNorm(entry.normHeight, zoomScale) + 'px'
          }
          layer.appendChild(entry.element)
        }
      })
    }

    renderPages()
  }, [pdfDoc, zoomScale]) // Only re-render on PDF load or zoom change

  // Scroll spy for page tracking
  useEffect(() => {
    const area = areaRef.current
    if (!area) return
    const onScroll = () => {
      const containers = area.querySelectorAll('.page-container')
      let closest = 1, closestDist = Infinity
      const areaRect = area.getBoundingClientRect()
      containers.forEach((c, i) => {
        const dist = Math.abs(c.getBoundingClientRect().top - areaRect.top)
        if (dist < closestDist) { closestDist = dist; closest = i + 1 }
      })
      onPageChange(closest)
    }
    area.addEventListener('scroll', onScroll)
    return () => area.removeEventListener('scroll', onScroll)
  }, [onPageChange])

  return <div ref={areaRef} className="canvas-area" />
})

export default Canvas
