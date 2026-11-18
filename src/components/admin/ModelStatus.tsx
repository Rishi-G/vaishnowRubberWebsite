'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'
import { RAILWAY_MODEL_SLUGS } from '@/three/railwaySlugs'

/** Admin line that says which 3D model the product page will show. */
export default function ModelStatus() {
  const { slug, kind, show3d, modelFile } = useFormFields(([fields]) => ({
    slug: fields.slug?.value as string | undefined,
    kind: fields.kind?.value as string | undefined,
    show3d: fields.show3d?.value as boolean | undefined,
    modelFile: fields.modelFile?.value as unknown,
  }))

  let tone = '#16a34a'
  let text: string
  if (show3d === false) {
    tone = '#9ca3af'
    text = '3D model is switched off for this product.'
  } else if (modelFile) {
    text = 'Showing the uploaded model selected below.'
  } else if (kind === 'hose') {
    text = 'Showing the built-in hose model — generated automatically from the Construction and data-sheet fields.'
  } else if (slug && RAILWAY_MODEL_SLUGS.includes(slug)) {
    text = `Showing the built-in 3D model for this part (linked by its slug “${slug}”). Pick a file below to replace it.`
  } else {
    tone = '#d97706'
    text = 'No 3D model yet — upload a model file below, or switch 3D off.'
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px', fontSize: 13 }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: tone, flex: 'none' }} />
      <span>
        <strong>Current 3D model:</strong> {text}
      </span>
    </div>
  )
}
