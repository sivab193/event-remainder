import { NextResponse } from "next/server"
import { getAllUserProfiles } from "@/lib/user-profile"
import { getBirthdays } from "@/lib/birthdays"
import { triggerNotifications } from "@/lib/notifications"

export async function GET(request: Request) {
  // Check authorization (e.g., Vercel Cron Secret)
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const users = await getAllUserProfiles()
    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentDay = today.getDate()

    console.log(`Cron started: checking birthdays for ${users.length} users`)

    for (const user of users) {
      const birthdays = await getBirthdays(user.userId)
      
      for (const birthday of birthdays) {
        const [year, month, day] = birthday.birthdate.split("-").map(Number)
        
        if (month === currentMonth && day === currentDay) {
          console.log(`Birthday match found: ${birthday.name} for user ${user.email}`)
          await triggerNotifications(user, birthday)
        }
      }
    }

    return NextResponse.json({ success: true, message: "Notifications processed" })
  } catch (error) {
    console.error("Cron Error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
