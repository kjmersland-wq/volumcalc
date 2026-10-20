import React from 'react'
import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  name?: string
  email?: string
  phone?: string
  subject?: string
  message?: string
  locale?: string
}

const ContactNotification = ({ name, email, phone, subject, message, locale }: Props) => (
  <Html lang="no" dir="ltr">
    <Head />
    <Preview>{`Ny henvendelse fra ${name ?? 'kontaktskjemaet'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Ny henvendelse – VolumCalc</Heading>
        <Text style={label}>Emne: <strong>{subject ?? '-'}</strong></Text>
        <Text style={label}>Navn: {name ?? '-'}</Text>
        <Text style={label}>E-post: {email ?? '-'}</Text>
        <Text style={label}>Telefon: {phone || '-'}</Text>
        <Text style={label}>Språk: {locale ?? '-'}</Text>
        <Hr style={hr} />
        <Text style={body}>{message ?? ''}</Text>
        <Hr style={hr} />
        <Text style={foot}>Sendt fra kontaktskjemaet på volumcalc.com. Svar direkte på denne e-posten for å svare avsenderen.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactNotification,
  subject: (d: Record<string, any>) => `[VolumCalc] ${d['subject'] ?? 'Ny henvendelse'}`,
  displayName: 'Kontaktskjema – varsel til eier',
  to: 'kjmersland@gmail.com',
  previewData: { name: 'Ola Nordmann', email: 'ola@example.com', phone: '12345678', subject: 'Spørsmål om flytting', message: 'Hei, jeg lurer på...', locale: 'no' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { color: '#1e3a5f', fontSize: '20px', margin: '0 0 16px' }
const label = { color: '#334155', fontSize: '14px', margin: '4px 0' }
const body = { color: '#0f172a', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap' as const }
const hr = { borderColor: '#e2e8f0', margin: '16px 0' }
const foot = { color: '#64748b', fontSize: '12px' }
