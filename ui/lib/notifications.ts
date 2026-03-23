import { Resend } from "resend"
import type { UserProfile } from "./user-profile"
import type { Birthday } from "./types"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmailNotification(
  email: string,
  birthday: Birthday,
) {
  const [year, month, day] = birthday.birthdate.split("-")
  const formattedDate = `${day}/${month}`

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Birthday Reminder</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🎂 Birthday Reminder</h1>
          </div>
          <div style="padding: 40px 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Hi there! 👋
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              This is a friendly reminder that it's time to wish <strong>${birthday.name}</strong> a happy birthday!
            </p>
            <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #667eea;">
              <div style="margin-bottom: 12px;">
                <span style="color: #6b7280; font-size: 14px;">Name:</span>
                <div style="color: #111827; font-size: 18px; font-weight: 600; margin-top: 4px;">${birthday.name}</div>
              </div>
              <div style="margin-bottom: 12px;">
                <span style="color: #6b7280; font-size: 14px;">Company:</span>
                <div style="color: #111827; font-size: 16px; margin-top: 4px;">${birthday.company}</div>
              </div>
              <div>
                <span style="color: #6b7280; font-size: 14px;">Birthday:</span>
                <div style="color: #111827; font-size: 16px; margin-top: 4px;">${formattedDate}</div>
              </div>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 24px 0 0 0;">
              Don't forget to reach out and make their day special! 🎉
            </p>
          </div>
          <div style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
              Sent by Birthday Tracker App
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  await resend.emails.send({
    from: process.env.FROM_EMAIL || "onboarding@resend.dev",
    to: email,
    subject: `🎂 Birthday Reminder: ${birthday.name}`,
    html,
  })
}

export async function sendTelegramNotification(
  chatId: string,
  birthday: Birthday,
) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN is missing")
    return
  }

  const message = `🎂 *Birthday Reminder*\n\nIt's time to wish *${birthday.name}* a happy birthday! 🎉\n🏢 Company: ${birthday.company}\n📅 Date: ${birthday.birthdate.split("-").reverse().slice(0, 2).join("/")}`

  const url = `https://api.telegram.org/bot${token}/sendMessage`
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error("Error sending Telegram notification:", errorData)
  }
}

export async function sendDiscordNotification(
  webhookUrl: string,
  birthday: Birthday,
) {
  const message = {
    content: `🎂 **Birthday Reminder**`,
    embeds: [
      {
        title: `Wish ${birthday.name} a Happy Birthday! 🎉`,
        fields: [
          { name: "Company", value: birthday.company, inline: true },
          { name: "Date", value: birthday.birthdate.split("-").reverse().slice(0, 2).join("/"), inline: true },
        ],
        color: 0x667eea,
      },
    ],
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  })

  if (!response.ok) {
    console.error("Error sending Discord notification:", response.statusText)
  }
}

export async function triggerNotifications(
  userProfile: UserProfile,
  birthday: Birthday,
) {
  const { notifications } = userProfile
  if (!notifications) return

  const promises: Promise<any>[] = []

  if (notifications.email.enabled && notifications.email.address) {
    promises.push(sendEmailNotification(notifications.email.address, birthday))
  }

  if (notifications.telegram.enabled && notifications.telegram.chatId) {
    promises.push(sendTelegramNotification(notifications.telegram.chatId, birthday))
  }

  if (notifications.discord.enabled && notifications.discord.webhookUrl) {
    promises.push(sendDiscordNotification(notifications.discord.webhookUrl, birthday))
  }

  await Promise.allSettled(promises)
}
