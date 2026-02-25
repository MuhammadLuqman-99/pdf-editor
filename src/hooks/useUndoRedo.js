import { useState, useCallback, useRef } from 'react'

export default function useUndoRedo() {
  const [entries, setEntries] = useState([])
  const redoStackRef = useRef([])

  const addEntry = useCallback((entry) => {
    setEntries(prev => [...prev, entry])
    redoStackRef.current = []
  }, [])

  const removeEntry = useCallback((entry) => {
    if (entry.element?.parentNode) entry.element.remove()
    setEntries(prev => prev.filter(e => e !== entry))
  }, [])

  const undo = useCallback(() => {
    setEntries(prev => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      if (last.element?.parentNode) last.element.remove()
      redoStackRef.current.push(last)
      return prev.slice(0, -1)
    })
  }, [])

  const redo = useCallback(() => {
    const entry = redoStackRef.current.pop()
    if (!entry) return
    const layer = document.querySelector(`.text-layer[data-page="${entry.pageNum}"]`)
    if (layer) {
      layer.appendChild(entry.element)
      setEntries(prev => [...prev, entry])
    }
  }, [])

  const clearAll = useCallback(() => {
    setEntries(prev => {
      prev.forEach(e => { if (e.element?.parentNode) e.element.remove() })
      return []
    })
    redoStackRef.current = []
  }, [])

  const updateEntries = useCallback((fn) => {
    setEntries(fn)
  }, [])

  return { entries, addEntry, removeEntry, undo, redo, clearAll, updateEntries, redoStackRef }
}
