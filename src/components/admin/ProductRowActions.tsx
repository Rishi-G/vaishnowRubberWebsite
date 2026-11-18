'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const btn: React.CSSProperties = {
  padding: '3px 10px',
  fontSize: 12,
  borderRadius: 4,
  border: '1px solid var(--theme-elevation-300)',
  background: 'transparent',
  color: 'var(--theme-text)',
  cursor: 'pointer',
  textDecoration: 'none',
  lineHeight: '18px',
}

/** Row buttons for the Products list: View on site, Edit, Delete. */
export default function ProductRowActions({ rowData }: { rowData?: { id?: string | number; slug?: string } }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  if (!rowData?.id) return null

  const remove = async () => {
    if (!window.confirm('Delete this product permanently? To only hide it from the site, set it to Inactive instead.')) return
    setBusy(true)
    const res = await fetch(`/api/products/${rowData.id}`, { method: 'DELETE', credentials: 'include' })
    setBusy(false)
    if (res.ok) router.refresh()
    else window.alert('Could not delete the product.')
  }

  return (
    <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
      <a href={`/products/${rowData.slug}`} target="_blank" rel="noreferrer" style={btn}>View</a>
      <a href={`/admin/collections/products/${rowData.id}`} style={btn}>Edit</a>
      <button type="button" onClick={remove} disabled={busy} style={{ ...btn, color: 'var(--theme-error-500)', borderColor: 'var(--theme-error-500)' }}>
        {busy ? '…' : 'Delete'}
      </button>
    </div>
  )
}
