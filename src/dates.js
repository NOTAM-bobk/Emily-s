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
