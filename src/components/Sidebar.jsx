import React, { useEffect, useRef } from 'react'

export default function Sidebar({ pdfDoc, open, currentPage, onPageClick }) {
  const sidebarRef = useRef(null)

  useEffect(() => {
    if (!pdfDoc || !sidebarRef.current) return
    const sidebar = sidebarRef.current
    sidebar.innerHTML = ''

    const renderThumbs = async () => {
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i)
        const viewport = page.getViewport({ scale: 0.3 })

        const wrapper = document.createElement('div')
        wrapper.className = `page-thumb ${i === currentPage ? 'active' : ''}`
        wrapper.dataset.page = i
        wrapper.onclick = () => onPageClick(i)

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        wrapper.appendChild(canvas)

        const num = document.createElement('div')
        num.className = 'page-thumb-num'
        num.textContent = i

        sidebar.appendChild(wrapper)
        sidebar.appendChild(num)

        const ctx = canvas.getContext('2d')
        await page.render({ canvasContext: ctx, viewport }).promise
      }
    }

    renderThumbs()
  }, [pdfDoc])

  // Update active state
  useEffect(() => {
    if (!sidebarRef.current) return
    sidebarRef.current.querySelectorAll('.page-thumb').forEach(t => {
      t.classList.toggle('active', parseInt(t.dataset.page) === currentPage)
    })
  }, [currentPage])

  return <div ref={sidebarRef} className={`sidebar ${open ? '' : 'hidden'}`} />
}
