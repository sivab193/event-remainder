import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { ImportBirthdays } from "./index"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { addBirthday } from "@/lib/birthdays"

// Mock dependencies
vi.mock("@/lib/auth-context")
vi.mock("@/hooks/use-toast")
vi.mock("@/lib/birthdays")

describe("ImportBirthdays", () => {
  const mockOnImportComplete = vi.fn()
  const mockToast = vi.fn()
  const mockUser = { uid: "user123" }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuth as any).mockReturnValue({ user: mockUser })
    ;(useToast as any).mockReturnValue({ toast: mockToast })
  })

  it("should parse and import .ics files correctly", async () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:123
SUMMARY:John Doe's Birthday
DTSTART;VALUE=DATE:19900515
END:VEVENT
END:VCALENDAR`

    render(<ImportBirthdays onImportComplete={mockOnImportComplete} />)
    
    const file = new File([icsContent], "birthdays.ics", { type: "text/calendar" })
    const input = screen.getByLabelText(/Select File/i) as HTMLInputElement
    
    // Trigger file upload
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.change(input)

    await waitFor(() => {
      expect(addBirthday).toHaveBeenCalledWith(expect.objectContaining({
        name: "John Doe",
        birthdate: "1990-05-15",
        userId: "user123"
      }))
    })

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Import Successful",
      description: "Successfully imported 1 birthdays."
    }))
    expect(mockOnImportComplete).toHaveBeenCalled()
  })

  it("should parse and import .vcf files correctly", async () => {
    const vcfContent = `BEGIN:VCARD
VERSION:3.0
FN:Jane Smith
BDAY:1985-12-25
END:VCARD`

    render(<ImportBirthdays onImportComplete={mockOnImportComplete} />)
    
    const file = new File([vcfContent], "contacts.vcf", { type: "text/vcard" })
    const input = screen.getByLabelText(/Select File/i) as HTMLInputElement
    
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.change(input)

    await waitFor(() => {
      expect(addBirthday).toHaveBeenCalledWith(expect.objectContaining({
        name: "Jane Smith",
        birthdate: "1985-12-25",
        userId: "user123"
      }))
    })

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Import Successful",
      description: "Successfully imported 1 birthdays."
    }))
  })

  it("should handle invalid file types", async () => {
    render(<ImportBirthdays onImportComplete={mockOnImportComplete} />)
    
    const file = new File(["not a calendar"], "test.txt", { type: "text/plain" })
    const input = screen.getByLabelText(/Select File/i) as HTMLInputElement
    
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.change(input)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: "Import Failed",
        variant: "destructive"
      }))
    })
    
    expect(addBirthday).not.toHaveBeenCalled()
  })
})
