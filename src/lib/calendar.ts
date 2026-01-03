import { prisma } from "./prisma" // Assuming a prisma client export exists
import { logger } from "./logger"

export interface CalendarEvent {
    title: string
    date: Date
    category: "National" | "Religious" | "Sports" | "Trend"
    suggestionPrompt: string
}

// Hardcoded seed data for Pakistani context - Full Year 2026
const PAKISTAN_EVENTS: CalendarEvent[] = [
    {
        title: "New Year's Day",
        date: new Date("2026-01-01"),
        category: "Trend",
        suggestionPrompt: "Fresh starts and new beginnings. Focus on resolutions and premium vibes."
    },
    {
        title: "Kashmir Solidarity Day",
        date: new Date("2026-02-05"),
        category: "National",
        suggestionPrompt: "Unity and support. Use flag colors and emotive storytelling."
    },
    {
        title: "PSL 2026 Season Kickoff",
        date: new Date("2026-02-14"),
        category: "Sports",
        suggestionPrompt: "Cricket fever begins! High energy, team colors, and hype hooks."
    },
    {
        title: "Pakistan Day",
        date: new Date("2026-03-23"),
        category: "National",
        suggestionPrompt: "Celebrate the resolution of Pakistan. Focus on green themes, patriotism, and unity."
    },
    {
        title: "Ramadan Begins",
        date: new Date("2026-02-18"), // Approximate
        category: "Religious",
        suggestionPrompt: "Spirituality, blessings, and community. Use lanterns, crescents, and warm lighting."
    },
    {
        title: "Eid-ul-Fitr",
        date: new Date("2026-03-20"), // Approximate
        category: "Religious",
        suggestionPrompt: "Joy, family, and sweetness. Use gold and pastel colors. Focus on community and festivities."
    },
    {
        title: "Labour Day",
        date: new Date("2026-05-01"),
        category: "National",
        suggestionPrompt: "Honoring hard work. Use industrial or minimalist aesthetics."
    },
    {
        title: "Eid-ul-Adha",
        date: new Date("2026-05-27"), // Approximate
        category: "Religious",
        suggestionPrompt: "Sacrifice and devotion. Focus on family gatherings and traditional meals."
    },
    {
        title: "Ashura (9th & 10th Muharram)",
        date: new Date("2026-07-25"), // Approximate
        category: "Religious",
        suggestionPrompt: "Reflection and solemnity. Use respectful, sober aesthetics."
    },
    {
        title: "Independence Day",
        date: new Date("2026-08-14"),
        category: "National",
        suggestionPrompt: "Freedom and pride. High-energy celebratory graphics with flags and green aesthetic."
    },
    {
        title: "Defense Day",
        date: new Date("2026-09-06"),
        category: "National",
        suggestionPrompt: "Honoring our heroes. Sober yet proud aesthetic. Focus on courage and strength."
    },
    {
        title: "Eid Milad-un-Nabi",
        date: new Date("2026-08-26"), // Approximate
        category: "Religious",
        suggestionPrompt: "Celebrating the birth of the Prophet (PBUH). Use green lighting and spiritual themes."
    },
    {
        title: "Iqbal Day",
        date: new Date("2026-11-09"),
        category: "National",
        suggestionPrompt: "Legacy and poetry. Use classical, intellectual, or vintage aesthetics."
    },
    {
        title: "Quaid-e-Azam Day / Christmas",
        date: new Date("2026-12-25"),
        category: "National",
        suggestionPrompt: "Leadership and celebration. Focus on the founder's vision and festive joy."
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
