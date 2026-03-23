"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getBirthdays, addBirthday, updateBirthday, deleteBirthday } from "@/lib/birthdays"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BirthdayForm } from "@/components/birthday-form"
import { BirthdayCard } from "@/components/birthday-card"
import { Plus, LogOut, Cake, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { NotificationSettings } from "@/components/notification-settings"
import { ImportBirthdays } from "@/components/import-birthdays"
import type { Birthday } from "@/lib/types"

export function BirthdayDashboard() {
  const { user, logout } = useAuth()
  const [birthdays, setBirthdays] = useState<Birthday[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    loadBirthdays()
  }, [user])

  const loadBirthdays = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getBirthdays(user.uid)
      setBirthdays(
        data.sort((a, b) => {
          const dateA = new Date(a.birthdate + "T00:00:00")
          const dateB = new Date(b.birthdate + "T00:00:00")
          return dateA.getMonth() - dateB.getMonth() || dateA.getDate() - dateB.getDate()
        }),
      )
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (data: Omit<Birthday, "id" | "userId" | "createdAt">) => {
    if (!user) return
    await addBirthday({ ...data, userId: user.uid })
    await loadBirthdays()
    setIsAdding(false)
  }

  const handleUpdate = async (id: string, data: Omit<Birthday, "id" | "userId" | "createdAt">) => {
    await updateBirthday(id, data)
    await loadBirthdays()
  }

  const handleDelete = async (id: string) => {
    await deleteBirthday(id)
    await loadBirthdays()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cake className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Birthday Tracker</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-semibold text-foreground">Your Connections</h2>
            <p className="text-muted-foreground mt-1">
              {birthdays.length} {birthdays.length === 1 ? "person" : "people"} tracked
            </p>
          </div>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Birthday
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading birthdays...</p>
            </div>
          </div>
        ) : birthdays.length === 0 ? (
          <div className="flex flex-col gap-8 max-w-xl mx-auto py-12">
            <div className="text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                <Cake className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No birthdays yet</h3>
              <p className="text-muted-foreground mb-6">Start tracking birthdays to never miss an important date</p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Birthday
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <ImportBirthdays onImportComplete={loadBirthdays} />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {birthdays.map((birthday) => (
                <BirthdayCard key={birthday.id} birthday={birthday} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))}
            </div>
            
            <div className="max-w-md mx-auto pt-8 border-t border-border/50">
              <ImportBirthdays onImportComplete={loadBirthdays} />
            </div>
          </div>
        )}
      </main>

      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Birthday</DialogTitle>
          </DialogHeader>
          <BirthdayForm onSubmit={handleAdd} onCancel={() => setIsAdding(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
          </DialogHeader>
          <NotificationSettings />
        </DialogContent>
      </Dialog>
    </div>
  )
}
