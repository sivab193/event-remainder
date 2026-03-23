import { NextResponse } from "next/server"
import { getUserProfile } from "@/lib/user-profile"
import { triggerNotifications } from "@/lib/notifications"
import type { Birthday } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const { userId, birthday }: { userId: string; birthday: Birthday } = await request.json()

    if (!userId || !birthday) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const profile = await getUserProfile(userId)
    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    await triggerNotifications(profile, birthday)

    return NextResponse.json({ success: true, message: "Test notifications sent" })
  } catch (error) {
    console.error("Test Notification Error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
