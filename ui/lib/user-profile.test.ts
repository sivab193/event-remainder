import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createUserProfile, updateUserProfile, getUserProfile, getAllUserProfiles } from './user-profile'
import { setDoc, getDoc, updateDoc, getDocs } from 'firebase/firestore'

vi.mock('./firebase', () => ({
  db: {},
  auth: {}
}))

describe('user-profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a user profile and increment stats', async () => {
    await createUserProfile('user1', 'test@example.com')
    expect(setDoc).toHaveBeenCalled()
    expect(updateDoc).toHaveBeenCalled()
  })

  it('should handle error when updating stats', async () => {
    (updateDoc as any).mockRejectedValueOnce(new Error('fail'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    await createUserProfile('user1', 'test@example.com')
    expect(setDoc).toHaveBeenCalledTimes(2) // Once for user, once for stats retry
    consoleSpy.mockRestore()
  })

  it('should get a user profile with defaults if missing', async () => {
    const mockData = { userId: 'user1', email: 'test@example.com' };
    (getDoc as any).mockResolvedValueOnce({
      exists: () => true,
      data: () => mockData
    })

    const profile = await getUserProfile('user1')
    expect(profile).toHaveProperty('notifications')
    expect(profile?.notifications?.email.enabled).toBe(true)
  })

  it('should update user profile', async () => {
    await updateUserProfile('user1', { email: 'new@example.com' })
    expect(updateDoc).toHaveBeenCalled()
  })

  it('should get all user profiles with defaults', async () => {
    (getDocs as any).mockResolvedValueOnce({
      docs: [
        { data: () => ({ userId: 'u1', email: 'u1@e.com' }) },
        { data: () => ({ userId: 'u2', email: 'u2@e.com', notifications: { email: { enabled: false } } }) }
      ]
    })

    const profiles = await getAllUserProfiles()
    expect(profiles).toHaveLength(2)
    expect(profiles[0].notifications?.email.enabled).toBe(true)
  })

  it('should handle errors in getAllUserProfiles', async () => {
    (getDocs as any).mockRejectedValueOnce(new Error('fail'))
    await expect(getAllUserProfiles()).rejects.toThrow('fail')
  })
})
