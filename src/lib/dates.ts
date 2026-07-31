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

// Every date in this app is a date-only string parsed as UTC midnight, so day
// arithmetic never drifts with the server's timezone — only `todayISO()` knows
// about the athlete's timezone, and it's the single entry point for "now".

// Rejects both malformed strings and impossible dates: `Date` happily rolls
// "2026-02-31" over to March 3, which would silently generate a session for the
// wrong day. Round-tripping through toISOString catches that.
export function isValidISODate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function addDaysISO(dateISO: string, days: number): string {
  const d = new Date(dateISO + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Whole days from `fromISO` to `toISO` (negative if `toISO` is earlier).
export function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((Date.parse(toISO) - Date.parse(fromISO)) / (24 * 60 * 60 * 1000));
}

// 0=Sun..6=Sat, in the athlete's calendar rather than the server's.
export function dayOfWeek(dateISO: string): number {
  return new Date(dateISO + "T00:00:00Z").getUTCDay();
}

export function isSunday(dateISO: string): boolean {
  return dayOfWeek(dateISO) === 0;
}

// Spelled-out weekday for the engine prompts — the yoga complement's hypertrophy
// half is day-specific (Monday shoulders/triceps, Wednesday chest/biceps), and an
// ISO date alone leaves the model to derive the weekday itself.
export function weekdayName(dateISO: string): string {
  return new Intl.DateTimeFormat("es-MX", { weekday: "long", timeZone: "UTC" }).format(
    new Date(dateISO + "T00:00:00Z")
  );
}

// Where a date falls inside a block. day_offset is 1-based (day 1 = block start),
// matching the `day_offset` values stored in blocks.raw_plan.
export function blockPosition(blockStartISO: string, dateISO: string) {
  const daysIn = daysBetween(blockStartISO, dateISO);
  return {
    dayOffset: daysIn + 1,
    weekNumber: Math.min(4, Math.max(1, Math.floor(daysIn / 7) + 1)),
    // A 4-week block covers day_offset 1..28.
    isInsideBlock: daysIn >= 0 && daysIn < 28,
  };
}
