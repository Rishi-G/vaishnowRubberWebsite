/**
 * Posts a career application to Payload's REST API (/api/applications) as multipart:
 * the resume is the upload, the other fields travel in `_payload`.
 * Success is reported only when the server confirms the record was created.
 */
export interface ApplicationInput {
  fullName: string
  email: string
  phone: string
  coverNote: string
  resume: File
}

export type ApplicationResult = { ok: true } | { ok: false; message: string }

const MAX_BYTES = 5 * 1024 * 1024
const OK_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

/** Client-side check so the visitor sees the problem before uploading; the server enforces it too. */
export const resumeProblem = (f: File | null): string => {
  if (!f) return 'Please attach your resume.'
  if (!OK_TYPES.includes(f.type) && !/\.(pdf|docx?)$/i.test(f.name)) return 'The resume must be a PDF or Word file.'
  if (f.size > MAX_BYTES) return 'The resume must be 5 MB or smaller.'
  return ''
}

export async function submitApplication(a: ApplicationInput, contact: { phone: string; email: string }): Promise<ApplicationResult> {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true') {
    // the static site has no server: open the visitor's mail app; they attach the resume themselves
    const body = `Name: ${a.fullName}\nPhone: ${a.phone}\nEmail: ${a.email}\n\n${a.coverNote}\n\n(Please attach your resume: ${a.resume.name})`
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(`Job application: ${a.fullName}`)}&body=${encodeURIComponent(body)}`
    return { ok: true }
  }
  const problem = resumeProblem(a.resume)
  if (problem) return { ok: false, message: problem }
  const form = new FormData()
  form.append('_payload', JSON.stringify({ fullName: a.fullName, email: a.email, phone: a.phone, coverNote: a.coverNote }))
  form.append('file', a.resume)
  try {
    const res = await fetch('/api/applications', { method: 'POST', body: form })
    if (res.ok) return { ok: true }
    const body = await res.json().catch(() => null)
    const detail: string = body?.errors?.[0]?.message ?? ''
    return { ok: false, message: `We couldn't send your application${detail ? ` (${detail})` : ` (error ${res.status})`}. Please try again or call ${contact.phone}.` }
  } catch {
    return { ok: false, message: `Network error — check your connection, or call ${contact.phone}.` }
  }
}
