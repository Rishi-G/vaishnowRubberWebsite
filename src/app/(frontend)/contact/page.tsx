import type { Metadata } from 'next'
import { ContactView } from '@/components/site/Views'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact Vaishno Rubber Industries — technical sales desk, factory address in Moradabad and enquiry form.',
  alternates: { canonical: '/contact' },
}

export default function Page() {
  return <ContactView />
}
