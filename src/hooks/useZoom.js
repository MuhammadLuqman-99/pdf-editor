import { useState, useCallback } from 'react'

export default function useZoom() {
  const [zoomScale, setZoomScale] = useState(1.0)

  const changeZoom = useCallback((delta) => {
    setZoomScale(prev => {
      const next = Math.round(Math.max(0.25, Math.min(3, prev + delta)) * 100) / 100
      return next
    })
  }, [])

  const fitZoom = useCallback(() => {
    setZoomScale(1.0)
  }, [])

  return { zoomScale, changeZoom, fitZoom, setZoomScale }
}
