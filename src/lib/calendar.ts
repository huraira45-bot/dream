import { prisma } from "./prisma" // Assuming a prisma client export exists
import { logger } from "./logger"

export interface CalendarEvent {
    title: string
    date: Date
    category: "National" | "Religious" | "Sports" | "Trend"
    suggestionPrompt: string
}

// Hardcoded seed data for Pakistani context
const PAKISTAN_EVENTS: CalendarEvent[] = [
    {
        title: "Pakistan Day",
        date: new Date("2026-03-23"),
        category: "National",
        suggestionPrompt: "Celebrate the resolution of Pakistan. Focus on green themes, patriotism, and unity."
    },
    {
        title: "Independence Day",
        date: new Date("2026-08-14"),
        category: "National",
        suggestionPrompt: "Freedom and pride. High-energy celebratory graphics with flags and green aesthetic."
    },
    {
        title: "Eid-ul-Fitr",
        date: new Date("2026-03-31"), // Estimated
        category: "Religious",
        suggestionPrompt: "Joy, family, and sweetness. Use gold and pastel colors. Focus on community and festivities."
    },
    {
        title: "PSL Season Peak",
        date: new Date("2026-02-15"),
        category: "Sports",
        suggestionPrompt: "Cricket fever. Use high-contrast colors, sports energy, and hype-focused hooks."
    },
    {
        title: "Defense Day",
        date: new Date("2026-09-06"),
        category: "National",
        suggestionPrompt: "Honoring our heroes. Sober yet proud aesthetic. Focus on courage and strength."
    }
]

export async function getUpcomingEvents(daysAhead: number = 7): Promise<CalendarEvent[]> {
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + daysAhead)

    // Filter from our directory (can also fetch from DB once seeded)
    return PAKISTAN_EVENTS.filter(event => {
        return event.date >= today && event.date <= futureDate
    })
}

export async function seedCalendar() {
    try {
        // This would use prisma to seed if available
        logger.info("Calendar Agent: Pakistani events localized and ready.");
    } catch (err) {
        logger.error("Calendar Seed Error: " + err);
    }
}
