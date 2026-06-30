// Single-user app — hardcoding the athlete's timezone avoids UTC-drift bugs
// where the server thinks it's already "tomorrow" in the evening.
const TIMEZONE = "America/Mexico_City";

export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
