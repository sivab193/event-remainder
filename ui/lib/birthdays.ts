import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment,
  setDoc
} from "firebase/firestore"
import { db } from "./firebase"
import type { Birthday } from "./types"

const COLLECTION_NAME = "birthdays"

async function updateBirthdayStats(change: number) {
  try {
    const statsRef = doc(db, "stats", "counters")
    await updateDoc(statsRef, { birthdaysTracked: increment(change) })
  } catch (e) {
    // Document might not exist yet
    try {
      const initialCount = change > 0 ? change : 0
      await setDoc(doc(db, "stats", "counters"), { users: 0, birthdaysTracked: initialCount, visits: 0 }, { merge: true })
    } catch (err) {
      console.error("Failed to update stats", err)
    }
  }
}

export async function addBirthday(birthday: Omit<Birthday, "id" | "createdAt">) {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...birthday,
    createdAt: serverTimestamp(),
  })
  await updateBirthdayStats(1)
  return docRef.id
}

export async function updateBirthday(id: string, birthday: Partial<Birthday>) {
  const docRef = doc(db, COLLECTION_NAME, id)
  await updateDoc(docRef, birthday)
}

export async function deleteBirthday(id: string) {
  const docRef = doc(db, COLLECTION_NAME, id)
  await deleteDoc(docRef)
  await updateBirthdayStats(-1)
}

export async function getBirthdays(userId: string): Promise<Birthday[]> {
  const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Birthday[]
}
