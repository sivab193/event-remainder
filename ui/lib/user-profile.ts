import { doc, setDoc, getDoc, updateDoc, collection, getDocs, increment } from "firebase/firestore"
import { db } from "./firebase"

export interface UserProfile {
  email: string
  userId: string
  createdAt: number
  notifications?: {
    email: { enabled: boolean; address: string }
    telegram: { enabled: boolean; chatId: string }
    discord: { enabled: boolean; webhookUrl: string }
  }
}

export async function createUserProfile(userId: string, email: string) {
  await setDoc(doc(db, "users", userId), {
    email,
    userId,
    createdAt: Date.now(),
    notifications: {
      email: { enabled: true, address: email },
      telegram: { enabled: false, chatId: "" },
      discord: { enabled: false, webhookUrl: "" },
    },
  })

  try {
    const statsRef = doc(db, "stats", "counters")
    await updateDoc(statsRef, { users: increment(1) })
  } catch (e) {
    // Document might not exist yet
    try {
      await setDoc(doc(db, "stats", "counters"), { users: 1, birthdaysTracked: 0, visits: 0 }, { merge: true })
    } catch (err) {
      console.error("Failed to update stats", err)
    }
  }
}

export async function updateUserProfile(userId: string, profile: Partial<UserProfile>) {
  const docRef = doc(db, "users", userId)
  await updateDoc(docRef, profile)
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const docSnap = await getDoc(doc(db, "users", userId))
  if (docSnap.exists()) {
    const data = docSnap.data() as UserProfile
    // Ensure notifications exist for legacy users
    if (!data.notifications) {
      data.notifications = {
        email: { enabled: true, address: data.email },
        telegram: { enabled: false, chatId: "" },
        discord: { enabled: false, webhookUrl: "" },
      }
    }
    return data
  }
  return null
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  const querySnapshot = await getDocs(collection(db, "users"))
  return querySnapshot.docs.map((doc) => {
    const data = doc.data() as UserProfile
    if (!data.notifications) {
      data.notifications = {
        email: { enabled: true, address: data.email },
        telegram: { enabled: false, chatId: "" },
        discord: { enabled: false, webhookUrl: "" },
      }
    }
    return data
  })
}
