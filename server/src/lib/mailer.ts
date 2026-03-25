import nodemailer from 'nodemailer'

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const verifyUrl = `${appUrl}/#/verify-email?token=${token}`

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject: 'Подтверждение email — Party Leader Dashboard',
    html: `
      <p>Для подтверждения вашего email перейдите по ссылке:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Ссылка действительна 24 часа.</p>
      <p>Если вы не регистрировались — просто проигнорируйте это письмо.</p>
    `,
  })
}
