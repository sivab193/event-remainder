"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getUserProfile, updateUserProfile, type UserProfile } from "@/lib/user-profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Mail, Send, MessageSquare, Calendar, Copy } from "lucide-react"

export function NotificationSettings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const copyCalendarLink = () => {
    if (!user) return
    const url = `${window.location.origin}/api/calendar/${user.uid}`
    navigator.clipboard.writeText(url)
    toast({
      title: "Copied to clipboard",
      description: "You can now paste this URL into Apple Calendar or Google Calendar to receive push notifications.",
    })
  }

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    const data = await getUserProfile(user.uid)
    setProfile(data)
    setLoading(false)
  }

  const handleSave = async () => {
    if (!user || !profile) return
    setSaving(true)
    try {
      await updateUserProfile(user.uid, {
        notifications: profile.notifications,
      })
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) return null

  const updateNotification = (channel: keyof NonNullable<UserProfile["notifications"]>, field: string, value: any) => {
    setProfile({
      ...profile,
      notifications: {
        ...profile.notifications!,
        [channel]: {
          ...profile.notifications![channel],
          [field]: value,
        },
      },
    })
  }

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive reminders via email</p>
            </div>
          </div>
          <Switch
            checked={profile.notifications?.email.enabled}
            onCheckedChange={(checked: boolean) => updateNotification("email", "enabled", checked)}
          />
        </div>
        {profile.notifications?.email.enabled && (
          <div className="ml-8">
            <Input
              placeholder="Email address"
              value={profile.notifications.email.address}
              onChange={(e) => updateNotification("email", "address", e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Send className="h-5 w-5 text-[#0088cc]" />
            <div>
              <Label className="text-base">Telegram Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive reminders via Telegram</p>
            </div>
          </div>
          <Switch
            checked={profile.notifications?.telegram.enabled}
            onCheckedChange={(checked: boolean) => updateNotification("telegram", "enabled", checked)}
          />
        </div>
        {profile.notifications?.telegram.enabled && (
          <div className="ml-8 space-y-2">
            <Input
              placeholder="Telegram Chat ID"
              value={profile.notifications.telegram.chatId}
              onChange={(e) => updateNotification("telegram", "chatId", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              To get your Chat ID, message @userinfobot on Telegram.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-[#5865F2]" />
            <div>
              <Label className="text-base">Discord Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive reminders via Discord Webhook</p>
            </div>
          </div>
          <Switch
            checked={profile.notifications?.discord.enabled}
            onCheckedChange={(checked: boolean) => updateNotification("discord", "enabled", checked)}
          />
        </div>
        {profile.notifications?.discord.enabled && (
          <div className="ml-8 space-y-2">
            <Input
              placeholder="Discord Webhook URL"
              value={profile.notifications.discord.webhookUrl}
              onChange={(e) => updateNotification("discord", "webhookUrl", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Create a webhook in your Discord server settings.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <Label className="text-base">Calendar Feed (Mobile Push)</Label>
              <p className="text-sm text-muted-foreground">Subscribe in Apple/Google Calendar</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={copyCalendarLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copy URL
          </Button>
        </div>
      </div>

      <Button className="w-full" onClick={handleSave} disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Preferences
      </Button>
    </div>
  )
}
