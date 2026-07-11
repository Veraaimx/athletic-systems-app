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

// Same date if it's already Monday, otherwise the next upcoming Monday. Blocks
// always start on Monday so "Semana N" in the UI is always a clean Mon-Sun
// calendar week, instead of a partial week anchored to whatever day the block
// happened to be activated on.
export function nextMonday(fromISO: string): string {
  const d = new Date(fromISO + "T00:00:00Z");
  const dow = d.getUTCDay(); // 0=Sun..6=Sat
  const daysUntilMonday = (8 - dow) % 7;
  d.setUTCDate(d.getUTCDate() + daysUntilMonday);
  return d.toISOString().slice(0, 10);
}
