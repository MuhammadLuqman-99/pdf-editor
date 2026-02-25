import { RENDER_SCALE } from './constants'

export function toNorm(px, zoomScale) {
  return px / (RENDER_SCALE * zoomScale)
}

export function fromNorm(norm, zoomScale) {
  return norm * (RENDER_SCALE * zoomScale)
}

export function updateNormPosition(entry, zoomScale) {
  const el = entry.element
  entry.normX = toNorm(parseFloat(el.style.left) || 0, zoomScale)
  entry.normY = toNorm(parseFloat(el.style.top) || 0, zoomScale)
}

export function parseColor(hex) {
  const h = hex || '#000000'
  return {
    r: parseInt(h.slice(1, 3), 16) / 255,
    g: parseInt(h.slice(3, 5), 16) / 255,
    b: parseInt(h.slice(5, 7), 16) / 255,
  }
}
