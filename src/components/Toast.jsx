import React from 'react'

export default function Toast({ toast }) {
  if (!toast) return <div className="toast" />
  return <div className={`toast show ${toast.type || 'success'}`}>{toast.msg}</div>
}
