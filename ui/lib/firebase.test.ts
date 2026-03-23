import { describe, it, expect, vi } from 'vitest'

describe('firebase', () => {
  it('should initialize firebase and export db and auth', async () => {
    // Just import it to trigger initialization
    const { db, auth } = await import('./firebase')
    expect(db).toBeDefined()
    expect(auth).toBeDefined()
  })
})
