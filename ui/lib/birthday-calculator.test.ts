import { describe, it, expect } from "vitest"
import { BirthdayCalculator } from "./birthday-calculator"
import { parseISO } from "date-fns"

describe("BirthdayCalculator", () => {
  describe("getAge", () => {
    it("should calculate exact age correctly", () => {
      const dob = parseISO("1990-05-15")
      const today = parseISO("2020-05-15")
      expect(BirthdayCalculator.getAge(dob, today)).toBe(30)
    })

    it("should calculate age correctly before birthday in current year", () => {
      const dob = parseISO("1990-05-15")
      const today = parseISO("2020-05-14")
      expect(BirthdayCalculator.getAge(dob, today)).toBe(29) // Not 30 yet
    })
  })

  describe("getNextBirthday", () => {
    it("should return same year if birthday hasn't passed", () => {
      const dob = parseISO("1990-12-31")
      const today = parseISO("2024-01-01")
      const nextBday = BirthdayCalculator.getNextBirthday(dob, today)
      expect(nextBday.getFullYear()).toBe(2024)
      expect(nextBday.getMonth()).toBe(11) // Dec
      expect(nextBday.getDate()).toBe(31)
    })

    it("should return next year if birthday has passed", () => {
      const dob = parseISO("1990-01-01")
      const today = parseISO("2024-12-31")
      const nextBday = BirthdayCalculator.getNextBirthday(dob, today)
      expect(nextBday.getFullYear()).toBe(2025)
      expect(nextBday.getMonth()).toBe(0) // Jan
      expect(nextBday.getDate()).toBe(1)
    })

    it("leap year baby on a non-leap year should celebrate on Feb 28", () => {
      const dob = parseISO("2000-02-29") // Leap year
      const today = parseISO("2023-01-01") // 2023 is not a leap year
      const nextBday = BirthdayCalculator.getNextBirthday(dob, today)
      expect(nextBday.getFullYear()).toBe(2023)
      expect(nextBday.getMonth()).toBe(1) // Feb
      expect(nextBday.getDate()).toBe(28)
    })

    it("leap year baby on a leap year should celebrate on Feb 29", () => {
      const dob = parseISO("2000-02-29")
      const today = parseISO("2024-01-01") // 2024 is a leap year
      const nextBday = BirthdayCalculator.getNextBirthday(dob, today)
      expect(nextBday.getFullYear()).toBe(2024)
      expect(nextBday.getMonth()).toBe(1) // Feb
      expect(nextBday.getDate()).toBe(29)
    })
  })

  describe("getTimezoneOffsetHours", () => {
    it("should return correct positive offset for Tokyo", () => {
      const offset = BirthdayCalculator.getTimezoneOffsetHours("Asia/Tokyo")
      expect(offset).toBe(9)
    })

    it("should return correct negative offset for New York", () => {
      const offset = BirthdayCalculator.getTimezoneOffsetHours("America/New_York")
      // Will be -4 or -5 depending on daylight savings. Asserting negative less than 0.
      expect(offset).toBeLessThan(0)
    })

    it("should return 0 for UTC", () => {
      expect(BirthdayCalculator.getTimezoneOffsetHours("UTC")).toBe(0)
    })
  })
})
