// App-level content. This is copy/config the app ships with — not user data.
// All actual user data (entries, desires, profile) lives in localStorage
// via src/storage.js.

export const quotes = [
  { text: "The greatest fruit of self sufficiency is freedom.", author: "Epicurus" },
  { text: "What you pay attention to grows.", author: "Unknown" },
  { text: "Slowness is a form of honesty.", author: "Momo the Cat" },
  { text: "Name the feeling, and it loses its grip.", author: "Unknown" },
  { text: "A quiet day is still a day well lived.", author: "Unknown" },
  { text: "You don't have to have it figured out to begin.", author: "Unknown" },
  { text: "Rest is part of the work.", author: "Unknown" },
]

export function getTodaysQuote() {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const diff = Date.now() - start.getTime()
  const dayOfYear = Math.floor(diff / 86400000)
  return quotes[dayOfYear % quotes.length]
}

export const guidedPrompts = [
  "What moment from today would you like to remember?",
  "What's one thing that felt hard, and what helped even a little?",
  "What are you looking forward to tomorrow?",
  "What's a thought you keep circling back to?",
  "Who affected your mood today, and how?",
  "What's something you did today that your future self will thank you for?",
  "What are you avoiding right now, and what would happen if you faced it?",
  "What's a small win from today that's easy to overlook?",
  "If today had a title, what would it be — and why?",
  "What do you need to let go of before tomorrow?",
]

export const moods = [
  { id: "happy", label: "Happy", tint: "coral" },
  { id: "neutral", label: "Neutral", tint: "lavender" },
  { id: "sad", label: "Low", tint: "sage" },
  { id: "calm", label: "Calm", tint: "lavender-light" },
  { id: "content", label: "Content", tint: "butter" },
]

export const MOOD_TINTS = {
  happy: "var(--coral)",
  content: "var(--butter)",
  neutral: "var(--sage-200)",
  calm: "var(--lavender)",
  sad: "var(--sage-300)",
}

// Starter tag catalog for the entry composer's tag picker. Any tag the
// person creates there gets appended to this list in localStorage so it's
// selectable again next time (see solace_custom_tags in App.jsx).
export const presetTags = [
  "Work", "Family", "Health", "Ideas", "Travel", "Goals", "Relationships", "Gratitude",
]

export const quickActions = [
  {
    id: "keep",
    title: "Keep today's thoughts",
    subtitle: "A free write for whatever's here",
    icon: "notebook",
    tint: "sage",
    tag: "Reflection",
    mood: "content",
    prompt: "Hey, I'm here. Want to share what's been on your mind today?",
  },
  {
    id: "capture",
    title: "Capture what you want",
    subtitle: "Name a desire, out loud",
    icon: "flame",
    tint: "coral",
    tag: "Desire",
    mood: "happy",
    prompt: "What's something you've been wanting lately, even if it feels small?",
  },
  {
    id: "remember",
    title: "Remember a joy",
    subtitle: "Log a moment worth keeping",
    icon: "heart",
    tint: "lavender",
    tag: "Gratitude",
    mood: "happy",
    prompt: "Tell me about a moment today that felt good, even briefly.",
  },
  {
    id: "shift",
    title: "Shift a tough thought",
    subtitle: "Reframe with a little help",
    icon: "butterfly",
    tint: "butter",
    tag: "Reframe",
    mood: "calm",
    prompt: "What thought's been sitting heavy? Let's look at it together.",
  },
]

// Used when someone starts a blank entry (e.g. the "+" on the Entries tab)
// rather than coming in through one of the quick actions above.
export const freeformPreset = {
  id: "freeform",
  title: "New entry",
  tag: "Free write",
  tint: "sage",
  mood: "neutral",
  prompt: "Hey, I'm here. Want to share what's been on your mind today?",
}

export const TINTS = {
  sage: "var(--sage-100)",
  coral: "var(--coral)",
  lavender: "var(--lavender)",
  butter: "var(--butter)",
}
