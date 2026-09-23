import nodemailer from 'nodemailer'

const MIMSMS_URL = 'https://api.mimsms.com/api/V2/SMS'

export function normalizeBdPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('880')) return digits
  if (digits.startsWith('0')) return `880${digits.slice(1)}`
  return `880${digits}`
}

export async function sendSms(to: string, message: string) {
  const apiKey = process.env.MIMSMS_API_KEY
  const userName = process.env.MIMSMS_USERNAME
  const senderName = process.env.MIMSMS_SENDER_NAME
  if (!apiKey || !userName || !senderName) throw new Error('MIMSMS is not configured')

  const response = await fetch(MIMSMS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, userName, senderName, transactionType: 'T', mobileNumber: normalizeBdPhone(to), message }),
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error(`MIMSMS request failed: ${response.status}`)
  return response.json() as Promise<unknown>
}

export async function sendEmail(to: string, subject: string, html: string) {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  })
  return transport.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, html })
}
