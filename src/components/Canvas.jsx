import React, { useEffect, useRef, forwardRef, useCallback } from 'react'
import { RENDER_SCALE } from '../utils/constants'
import { fromNorm } from '../utils/coordinates'

const Canvas = forwardRef(function Canvas({ pdfDoc, zoomScale, entries, currentTool, onCanvasClick, onCanvasMouseDown, onPageChange }, ref) {
  const areaRef = useRef(null)
  const prevZoomRef = useRef(zoomScale)

  // Render all pages
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
        if (currentTool === 'select') textLayer.classList.add('select-mode')
        textLayer.dataset.page = i

        textLayer.addEventListener('click', (e) => {
          if (e.target !== e.currentTarget) return
          const rect = e.currentTarget.getBoundingClientRect()
          onCanvasClick(i, e.clientX - rect.left, e.clientY - rect.top, e.currentTarget)
        })

        textLayer.addEventListener('mousedown', (e) => {
          if (e.target !== e.currentTarget) return
          const rect = e.currentTarget.getBoundingClientRect()
          onCanvasMouseDown(i, e.clientX - rect.left, e.clientY - rect.top, e.currentTarget, e)
        })

        textLayer.addEventListener('touchend', (e) => {
          if (e.target !== e.currentTarget) return
          if (!e.changedTouches?.length) return
          const t = e.changedTouches[0]
          const rect = e.currentTarget.getBoundingClientRect()
          e.preventDefault()
          onCanvasClick(i, t.clientX - rect.left, t.clientY - rect.top, e.currentTarget)
        })

        container.appendChild(textLayer)
        wrapper.appendChild(container)
        area.appendChild(wrapper)

        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
      }

      // Restore entries
      entries.forEach(entry => {
        if (!entry.element || entry.type === 'watermark') return
        const layer = area.querySelector(`.text-layer[data-page="${entry.pageNum}"]`)
        if (!layer) return

        if (entry.type === 'draw') {
          // SVG paths need svg overlay
          let svg = layer.querySelector('.svg-overlay')
          if (!svg) {
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            svg.setAttribute('class', 'svg-overlay')
            svg.style.width = '100%'
            svg.style.height = '100%'
            layer.appendChild(svg)
          }
          // Re-scale path
          if (entry.pathD) {
            const s = RENDER_SCALE * zoomScale
            const scaledD = entry.pathD.replace(/[\d.]+/g, (match, offset, str) => {
              // Check if this is a number (not a command letter)
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
          // Update coordinates
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
          if (entry.fontSize) {
            entry.element.style.fontSize = (entry.fontSize * zoomScale) + 'px'
          }
          if (entry.normWidth && (entry.type !== 'text' && entry.type !== 'symbol' && entry.type !== 'date')) {
            entry.element.style.width = fromNorm(entry.normWidth, zoomScale) + 'px'
          }
          if (entry.normHeight && (entry.type !== 'text' && entry.type !== 'symbol' && entry.type !== 'date')) {
            entry.element.style.height = fromNorm(entry.normHeight, zoomScale) + 'px'
          }
          layer.appendChild(entry.element)
        }
      })
    }

    renderPages()
    prevZoomRef.current = zoomScale
  }, [pdfDoc, zoomScale, entries, currentTool, onCanvasClick, onCanvasMouseDown])

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
