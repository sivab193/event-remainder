import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('utils', () => {
  it('should merge tailwind classes', () => {
    expect(cn('a', 'b')).toBe('a b')
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('text-red-500', { 'bg-blue-500': true })).toBe('text-red-500 bg-blue-500')
  })
})
