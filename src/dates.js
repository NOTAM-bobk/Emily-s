const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function toKey(date) {
  const d = startOfDay(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Sunday-to-Saturday strip for the current week, each day flagged today/future. */
export function getWeekDates() {
  const today = startOfDay(new Date())
  const start = startOfDay(new Date(today))
  start.setDate(today.getDate() - today.getDay())

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return {
      key: toKey(d),
      day: DAY_LABELS[i],
      isToday: toKey(d) === toKey(today),
      isFuture: startOfDay(d) > today,
    }
  })
}

export function formatEntryDate(timestamp) {
  const date = new Date(timestamp)
  const today = startOfDay(new Date())
  const day = startOfDay(date)
  const diffDays = Math.round((today - day) / 86400000)
  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  if (diffDays === 0) return `Today, ${time}`
  if (diffDays === 1) return `Yesterday, ${time}`
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

/** Consecutive-day streak counting backward from today, based on entry dates. */
export function computeStreak(entries) {
  const activeDays = new Set(entries.map((e) => toKey(new Date(e.createdAt))))

  let streak = 0
  const cursor = startOfDay(new Date())
  while (activeDays.has(toKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Entry count per day for the current week, for the Insights bar chart. */
export function weeklyActivity(entries) {
  return getWeekDates().map(({ day, key }) => ({
    day,
    count: entries.filter((e) => toKey(new Date(e.createdAt)) === key).length,
  }))
}

export function topTag(entries) {
  if (entries.length === 0) return null
  const counts = {}
  entries.forEach((e) => {
    counts[e.tag] = (counts[e.tag] || 0) + 1
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

/** Date + time label for the composer header, always including the time. */
export function formatComposerDateTime(date) {
  const d = new Date(date)
  const today = startOfDay(new Date())
  const day = startOfDay(d)
  const diffDays = Math.round((today - day) / 86400000)
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  if (diffDays === 0) return `Today, ${time}`
  if (diffDays === 1) return `Yesterday, ${time}`
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`
}

/** Morning/Afternoon/Evening/Night, based on the hour of the given date. */
export function timeOfDayLabel(date) {
  const hour = new Date(date).getHours()
  if (hour < 5) return 'Night'
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  if (hour < 21) return 'Evening'
  return 'Night'
}

/** "Morning, Today" / "Afternoon, Aug 12" — the smart default entry title. */
export function defaultEntryTitle(date) {
  const d = new Date(date)
  const today = startOfDay(new Date())
  const day = startOfDay(d)
  const diffDays = Math.round((today - day) / 86400000)
  const dateLabel =
    diffDays === 0
      ? 'Today'
      : diffDays === 1
      ? 'Yesterday'
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  return `${timeOfDayLabel(d)}, ${dateLabel}`
}

/** Date <-> the string format <input type="datetime-local"> needs. */
export function toDateTimeLocalValue(date) {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromDateTimeLocalValue(value) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? new Date() : d
}

/** Starred entries pinned to top; everything else newest first. */
export function sortEntriesForDisplay(entries) {
  return [...entries].sort((a, b) => {
    const starDiff = (b.starred ? 1 : 0) - (a.starred ? 1 : 0)
    if (starDiff !== 0) return starDiff
    return b.createdAt - a.createdAt
  })
}

/* ============================== Insights analytics ============================== */
/* Everything below derives real numbers from the user's own entries — no
   placeholder or sample data — for the Insights tab. */

const DAY_FULL_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function wordCount(text) {
  if (!text) return 0
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

export function totalWordsWritten(entries) {
  return entries.reduce((sum, e) => sum + wordCount(e.body), 0)
}

export function averageWordsPerEntry(entries) {
  if (entries.length === 0) return 0
  return Math.round(totalWordsWritten(entries) / entries.length)
}

/** Longest run of consecutive journaling days across all of history (not just the current streak). */
export function longestStreak(entries) {
  const days = Array.from(new Set(entries.map((e) => toKey(new Date(e.createdAt))))).sort()
  if (days.length === 0) return 0
  let longest = 1
  let current = 1
  for (let i = 1; i < days.length; i++) {
    const diff = Math.round((new Date(days[i]) - new Date(days[i - 1])) / 86400000)
    current = diff === 1 ? current + 1 : 1
    longest = Math.max(longest, current)
  }
  return longest
}

/** Which mood shows up most, and the full breakdown with percentages, for entries that logged one. */
export function moodDistribution(entries) {
  const withMood = entries.filter((e) => e.mood)
  if (withMood.length === 0) return []
  const counts = {}
  withMood.forEach((e) => {
    counts[e.mood] = (counts[e.mood] || 0) + 1
  })
  return Object.entries(counts)
    .map(([mood, count]) => ({ mood, count, pct: Math.round((count / withMood.length) * 100) }))
    .sort((a, b) => b.count - a.count)
}

/** Category (tag) breakdown with counts + percentages, most-used first. Includes the tint of the
    first entry seen for that category, so the UI can color-match the "Free write" chips etc. */
export function tagBreakdown(entries) {
  if (entries.length === 0) return []
  const counts = {}
  const tints = {}
  entries.forEach((e) => {
    counts[e.tag] = (counts[e.tag] || 0) + 1
    if (!tints[e.tag]) tints[e.tag] = e.tint
  })
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count, tint: tints[tag], pct: Math.round((count / entries.length) * 100) }))
    .sort((a, b) => b.count - a.count)
}

/** Morning / Afternoon / Evening / Night split, scaled against the busiest bucket. */
export function timeOfDayDistribution(entries) {
  const labels = ['Morning', 'Afternoon', 'Evening', 'Night']
  const counts = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 }
  entries.forEach((e) => {
    counts[timeOfDayLabel(e.createdAt)] += 1
  })
  const max = Math.max(1, ...Object.values(counts))
  return labels.map((label) => ({ label, count: counts[label], pct: Math.round((counts[label] / max) * 100) }))
}

/** Daily entry counts for the last `days` days, oldest first — powers the activity heatmap grid. */
export function activityHeatmap(entries, days = 91) {
  const counts = {}
  entries.forEach((e) => {
    const key = toKey(new Date(e.createdAt))
    counts[key] = (counts[key] || 0) + 1
  })
  const today = startOfDay(new Date())
  const out = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = toKey(d)
    out.push({ key, date: d, count: counts[key] || 0 })
  }
  return out
}

/** Entry count per calendar week for the last `weeks` weeks (Sun–Sat), oldest first — for a trend line. */
export function weeklyTrend(entries, weeks = 8) {
  const today = startOfDay(new Date())
  const currentWeekStart = startOfDay(new Date(today))
  currentWeekStart.setDate(today.getDate() - today.getDay())

  const out = []
  for (let w = weeks - 1; w >= 0; w--) {
    const start = new Date(currentWeekStart)
    start.setDate(currentWeekStart.getDate() - w * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    const count = entries.filter((e) => {
      const d = startOfDay(new Date(e.createdAt))
      return d >= start && d <= end
    }).length
    out.push({ start, end, count })
  }
  return out
}

/** The weekday (full name) the user has historically written on most, or null with no entries. */
export function bestWritingDay(entries) {
  if (entries.length === 0) return null
  const counts = [0, 0, 0, 0, 0, 0, 0]
  entries.forEach((e) => {
    counts[new Date(e.createdAt).getDay()] += 1
  })
  const max = Math.max(...counts)
  if (max === 0) return null
  return DAY_FULL_LABELS[counts.indexOf(max)]
}
