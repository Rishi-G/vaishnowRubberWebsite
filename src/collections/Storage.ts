import type { CollectionConfig } from 'payload'

const ALLOWED = ['.zip', '.glb', '.gltf', '.obj']
const MAX_BYTES = 60 * 1024 * 1024

/**
 * Storage — 3D model files for the product pages. Upload a .zip (or a single .glb / .gltf / .obj);
 * the file is kept on the server and linked from a product's "3D model" field.
 */
export const Storage: CollectionConfig = {
  slug: 'storage',
  labels: { singular: 'Storage file', plural: 'Storage' },
  admin: { useAsTitle: 'filename', group: 'Catalogue', description: '3D model files (.zip, .glb, .gltf, .obj) used by product pages.' },
  access: { read: () => true },
  upload: { staticDir: 'storage' },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        const file = req.file
        if (file) {
          const name = file.name.toLowerCase()
          if (!ALLOWED.some((ext) => name.endsWith(ext))) throw new Error('Upload a .zip, .glb, .gltf or .obj file.')
          if (file.size > MAX_BYTES) throw new Error('The file is larger than 60 MB.')
        }
        return data
      },
    ],
  },
  fields: [{ name: 'title', type: 'text', admin: { description: 'Optional label, e.g. the product name.' } }],
}
