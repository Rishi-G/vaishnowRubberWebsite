/**
 * Posts an enquiry to Payload's REST API (/api/enquiries).
 * Success is only reported when the server confirms the record was created,
 * and the RFQ reference comes from the server (see collections/Enquiries.ts).
 */
export interface EnquiryPayload {
  type: 'rfq' | 'contact'
  fullName: string
  email: string
  companyName?: string
  phone?: string
  location?: string
  subject?: string
  category?: string
  productSlug?: string
  idSize?: string
  workingPressure?: string
  temperature?: string
  lengthMeters?: number
  fittingType?: string
  application?: string
  notes?: string
}

export type EnquiryResult = { ok: true; reference: string } | { ok: false; message: string }

/** Shape of Payload's error response: { errors: [{ message, data?: { errors: [{ path, message }] } }] } */
interface PayloadErrorBody {
  errors?: { message?: string; data?: { errors?: { path?: string; message?: string }[] } }[]
}

/**
 * Turns a failed response into the sentence the visitor sees under the submit button.
 *
 * TODO(you): decide how much detail visitors should get. Options:
 *  - Field-level: surface `body.errors[0].data.errors[*]` ("email: invalid email")
 *    — most helpful, but leaks internal field names.
 *  - Status-based: 400 → "check your details", 429 → "too many attempts",
 *    5xx → "our server is down, call +91 98102 94483".
 *  - Always include the phone fallback so a lead is never lost.
 */
function friendlyError(status: number, _body: PayloadErrorBody | null): string {
  return `We couldn't send your enquiry (error ${status}). Please try again or call +91 98102 94483.`
}

export async function submitEnquiry(data: EnquiryPayload): Promise<EnquiryResult> {
  try {
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const body = await res.json().catch(() => null)
    if (!res.ok) return { ok: false, message: friendlyError(res.status, body) }
    return { ok: true, reference: body?.doc?.reference ?? '' }
  } catch {
    return { ok: false, message: 'Network error — check your connection, or call +91 98102 94483.' }
  }
}
