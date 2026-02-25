import { useState, useCallback } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

export default function usePdfLoader() {
  const [pdfDoc, setPdfDoc] = useState(null)
  const [pdfBytes, setPdfBytes] = useState(null)
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadPdf = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    try {
      const bytes = await file.arrayBuffer()
      const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise
      setPdfBytes(bytes)
      setPdfDoc(doc)
      setFileName(file.name)
      setLoading(false)
      return doc
    } catch (err) {
      setError(err.message)
      setLoading(false)
      return null
    }
  }, [])

  return { pdfDoc, pdfBytes, fileName, loading, error, loadPdf }
}
