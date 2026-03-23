import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase App
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
}))

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}))

const mockDoc = {}
const mockCollection = {}

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => mockCollection),
  doc: vi.fn(() => mockDoc),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(),
  increment: vi.fn(),
  onSnapshot: vi.fn(),
}))

// Mock Resend as a class using function to be a constructor
vi.mock('resend', () => {
  class Resend {
    emails = {
      send: vi.fn().mockResolvedValue({ data: { id: "test-id" }, error: null })
    };
  }
  return { Resend }
})

// Mock global fetch
global.fetch = vi.fn()
