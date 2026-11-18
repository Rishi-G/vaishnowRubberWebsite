'use client'

import React from 'react'
import { RelationshipField, useFormFields } from '@payloadcms/ui'
import type { RelationshipFieldClientComponent } from 'payload'
import { RAILWAY_MODEL_SLUGS } from '@/three/railwaySlugs'

/**
 * The normal Storage picker, but its empty state says which model the product page is
 * using: the built-in one (and which) or nothing yet. Once a file is picked, the picker
 * shows that file as usual.
 */
const ModelFileField: RelationshipFieldClientComponent = (props) => {
  const { slug, name, kind } = useFormFields(([fields]) => ({
    slug: fields.slug?.value as string | undefined,
    name: fields.name?.value as string | undefined,
    kind: fields.kind?.value as string | undefined,
  }))

  const placeholder =
    kind === 'hose'
      ? 'Linked: built-in hose model (generated from Construction) — pick a file to replace it'
      : slug && RAILWAY_MODEL_SLUGS.includes(slug)
        ? `Linked: built-in 3D model — ${name || slug} — pick a file to replace it`
        : 'No 3D model linked — pick or upload a file'

  return <RelationshipField {...props} field={{ ...props.field, admin: { ...props.field.admin, placeholder } }} />
}

export default ModelFileField
