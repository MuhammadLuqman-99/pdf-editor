import { rgb, degrees } from 'pdf-lib'
import { parseColor } from './coordinates'

function extractTextContent(el) {
  let text = ''
  el.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent
    } else if (node.nodeName === 'BR') {
      text += '\n'
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.classList.contains('delete-btn') || node.classList.contains('drag-handle')) return
      if (node.classList.contains('resize-handle')) return
      if (node.nodeName === 'DIV') {
        if (text.length > 0 && !text.endsWith('\n')) text += '\n'
        text += extractTextContent(node)
      }
    }
  })
  return text
}

export function saveTextEntry(page, entry, font, pageHeight) {
  const text = extractTextContent(entry.element).trim()
  if (!text) return
  const c = parseColor(entry.color)
  const lines = text.split('\n')
  const pdfX = entry.normX
  const pdfY = pageHeight - entry.normY - entry.fontSize
  for (let j = 0; j < lines.length; j++) {
    if (!lines[j] && j < lines.length - 1) continue
    page.drawText(lines[j] || ' ', {
      x: pdfX, y: pdfY - (j * entry.fontSize * 1.3),
      size: entry.fontSize, font, color: rgb(c.r, c.g, c.b),
    })
  }
}

export function saveCircleEntry(page, entry, pageHeight) {
  const c = parseColor(entry.borderColor || entry.color || '#000000')
  const r = entry.radius || 20
  page.drawEllipse({
    x: entry.normX + r, y: pageHeight - entry.normY - r,
    xScale: r, yScale: r,
    borderColor: rgb(c.r, c.g, c.b), borderWidth: entry.strokeWidth || 2,
  })
}

export function saveRectEntry(page, entry, pageHeight) {
  const w = entry.normWidth || 100
  const h = entry.normHeight || 40
  let fillColor, opacity = 1
  if (entry.type === 'blackout') fillColor = rgb(0, 0, 0)
  else if (entry.type === 'erase') fillColor = rgb(1, 1, 1)
  else if (entry.type === 'highlight') { fillColor = rgb(1, 1, 0); opacity = 0.3 }
  page.drawRectangle({
    x: entry.normX, y: pageHeight - entry.normY - h,
    width: w, height: h, color: fillColor, opacity,
  })
}

export function saveTextBoxEntry(page, entry, font, pageHeight) {
  const w = entry.normWidth || 100
  const h = entry.normHeight || 40
  const c = parseColor(entry.borderColor || '#000000')
  page.drawRectangle({
    x: entry.normX, y: pageHeight - entry.normY - h,
    width: w, height: h,
    borderColor: rgb(c.r, c.g, c.b), borderWidth: 1,
  })
  const text = extractTextContent(entry.element).trim()
  if (text) {
    const tc = parseColor(entry.color)
    const lines = text.split('\n')
    const pdfX = entry.normX + 4
    const pdfY = pageHeight - entry.normY - entry.fontSize - 4
    for (let j = 0; j < lines.length; j++) {
      if (!lines[j] && j < lines.length - 1) continue
      page.drawText(lines[j] || ' ', {
        x: pdfX, y: pdfY - (j * entry.fontSize * 1.3),
        size: entry.fontSize, font, color: rgb(tc.r, tc.g, tc.b),
      })
    }
  }
}

export function saveLineEntry(page, entry, pageHeight) {
  const c = parseColor(entry.strokeColor || entry.color || '#000000')
  page.drawLine({
    start: { x: entry.normX, y: pageHeight - entry.normY },
    end: { x: entry.normX2, y: pageHeight - entry.normY2 },
    thickness: entry.strokeWidth || 2,
    color: rgb(c.r, c.g, c.b),
  })
}

export function saveArrowEntry(page, entry, pageHeight) {
  saveLineEntry(page, entry, pageHeight)
  const c = parseColor(entry.strokeColor || entry.color || '#000000')
  const x1 = entry.normX, y1 = pageHeight - entry.normY
  const x2 = entry.normX2, y2 = pageHeight - entry.normY2
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const headLen = 12
  const a1 = angle - Math.PI / 6
  const a2 = angle + Math.PI / 6
  page.drawLine({
    start: { x: x2, y: y2 },
    end: { x: x2 - headLen * Math.cos(a1), y: y2 - headLen * Math.sin(a1) },
    thickness: entry.strokeWidth || 2, color: rgb(c.r, c.g, c.b),
  })
  page.drawLine({
    start: { x: x2, y: y2 },
    end: { x: x2 - headLen * Math.cos(a2), y: y2 - headLen * Math.sin(a2) },
    thickness: entry.strokeWidth || 2, color: rgb(c.r, c.g, c.b),
  })
}

export async function saveImageEntry(pdfDocLib, page, entry, pageHeight) {
  if (!entry.imageBytes) return
  let img
  if (entry.imageType === 'image/jpeg' || entry.imageType === 'image/jpg') {
    img = await pdfDocLib.embedJpg(entry.imageBytes)
  } else {
    img = await pdfDocLib.embedPng(entry.imageBytes)
  }
  const w = entry.normWidth || 100
  const h = entry.normHeight || 100
  page.drawImage(img, {
    x: entry.normX, y: pageHeight - entry.normY - h,
    width: w, height: h,
  })
}

export function saveDrawEntry(page, entry, pageHeight) {
  if (!entry.pathD) return
  const c = parseColor(entry.strokeColor || '#000000')
  try {
    page.drawSvgPath(entry.pathD, {
      x: 0, y: pageHeight,
      borderColor: rgb(c.r, c.g, c.b),
      borderWidth: entry.strokeWidth || 2,
    })
  } catch (e) {
    console.warn('Could not save freehand path:', e)
  }
}

export function saveStickyEntry(page, entry, font, pageHeight) {
  const w = entry.normWidth || 150
  const h = entry.normHeight || 100
  page.drawRectangle({
    x: entry.normX, y: pageHeight - entry.normY - h,
    width: w, height: h,
    color: rgb(1, 0.98, 0.77), borderColor: rgb(0.94, 0.9, 0.55), borderWidth: 1,
  })
  const text = extractTextContent(entry.element).trim()
  if (text) {
    const lines = text.split('\n')
    const pdfX = entry.normX + 6
    const pdfY = pageHeight - entry.normY - 14
    for (let j = 0; j < lines.length; j++) {
      page.drawText(lines[j] || ' ', {
        x: pdfX, y: pdfY - (j * 14),
        size: 10, font, color: rgb(0, 0, 0),
      })
    }
  }
}

export function saveTableEntry(page, entry, font, pageHeight) {
  const w = entry.normWidth || 200
  const h = entry.normHeight || 100
  const rows = entry.rows || 2
  const cols = entry.cols || 2
  const cellW = w / cols
  const cellH = h / rows
  const x0 = entry.normX
  const y0 = pageHeight - entry.normY
  for (let r = 0; r <= rows; r++) {
    page.drawLine({
      start: { x: x0, y: y0 - r * cellH },
      end: { x: x0 + w, y: y0 - r * cellH },
      thickness: 1, color: rgb(0, 0, 0),
    })
  }
  for (let c = 0; c <= cols; c++) {
    page.drawLine({
      start: { x: x0 + c * cellW, y: y0 },
      end: { x: x0 + c * cellW, y: y0 - h },
      thickness: 1, color: rgb(0, 0, 0),
    })
  }
  if (entry.cellData) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const txt = entry.cellData[r]?.[c]?.trim()
        if (txt) {
          page.drawText(txt, {
            x: x0 + c * cellW + 4, y: y0 - r * cellH - 14,
            size: 10, font, color: rgb(0, 0, 0),
          })
        }
      }
    }
  }
}

export function saveWatermarkEntry(pages, entry, font) {
  const text = entry.text || 'WATERMARK'
  const c = parseColor(entry.color || '#cccccc')
  const size = entry.wmSize || 60
  const opacity = entry.opacity || 0.2
  const rotation = entry.rotation || -45
  for (const page of pages) {
    const { width, height } = page.getSize()
    page.drawText(text, {
      x: width / 2 - (text.length * size * 0.3),
      y: height / 2,
      size, font,
      color: rgb(c.r, c.g, c.b),
      opacity,
      rotate: degrees(rotation),
    })
  }
}
