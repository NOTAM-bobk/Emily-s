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
  { text: "In the depth of winter, I finally learned that within me there lay an invincible summer.", author: "Albert Camus" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Everything has beauty, but not everyone sees it.", author: "Confucius" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "Change your thoughts and you change your world.", author: "Norman Vincent Peale" },
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "Happiness depends upon ourselves.", author: "Aristotle" },
  { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.", author: "Albert Einstein" },
  { text: "So many books, so little time.", author: "Frank Zappa" },
  { text: "A room without books is like a body without a soul.", author: "Marcus Tullius Cicero" },
  { text: "You only live once, but if you do it right, once is enough.", author: "Mae West" },
  { text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "In three words I can sum up everything I've learned about life: it goes on.", author: "Robert Frost" },
  { text: "If you tell the truth, you don't have to remember anything.", author: "Mark Twain" },
  { text: "A friend is someone who knows all about you and still loves you.", author: "Elbert Hubbard" },
  { text: "Darkness cannot drive out darkness: only light can do that. Hate cannot drive out hate: only love can do that.", author: "Martin Luther King Jr." },
  { text: "To live is the rarest thing in the world. Most people exist, that is all.", author: "Oscar Wilde" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "We accept the love we think we deserve.", author: "Stephen Chbosky" },
  { text: "Without music, life would be a blank to me.", author: "Jane Austen" },
  { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author: "Ralph Waldo Emerson" },
  { text: "Insanity is doing the same thing, over and over again, but expecting different results.", author: "Albert Einstein" },
  { text: "It is never too late to be what you might have been.", author: "George Eliot" },
  { text: "There is some good in this world, and it's worth fighting for.", author: "J.R.R. Tolkien" },
  { text: "Imagination is more important than knowledge. For knowledge is limited, whereas imagination embraces the entire world.", author: "Albert Einstein" },
  { text: "Not all of us can do great things. But we can do small things with great love.", author: "Mother Teresa" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas A. Edison" },
  { text: "A creative person is motivated by the desire to achieve, not by the desire to beat others.", author: "Ayn Rand" },
  { text: "Logic will get you from A to Z; imagination will get you everywhere.", author: "Albert Einstein" },
  { text: "Life is what happens to us while we are making other plans.", author: "Allen Saunders" },
  { text: "Good friends, good books, and a sleepy conscience: this is the ideal life.", author: "Mark Twain" },
  { text: "Life is really simple, but we insist on making it complicated.", author: "Confucius" },
  { text: "May your choices reflect your hopes, not your fears.", author: "Nelson Mandela" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Whoever is happy will make others happy too.", author: "Anne Frank" },
  { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa" },
  { text: "When you reach the end of your rope, tie a knot in it and hang on.", author: "Franklin D. Roosevelt" },
  { text: "Always remember that you are absolutely unique. Just like everyone else.", author: "Margaret Mead" },
  { text: "Don't judge each day by the harvest you reap but by the seeds that you plant.", author: "Robert Louis Stevenson" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "The best way to predict your future is to create it.", author: "Abraham Lincoln" },
  { text: "Kindness is a language which the deaf can hear and the blind can see.", author: "Mark Twain" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { text: "Genius is one percent inspiration and ninety-nine percent perspiration.", author: "Thomas Edison" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Do what you feel in your heart to be right—for you'll be criticized anyway.", author: "Eleanor Roosevelt" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", author: "Charles R. Swindoll" },
  { text: "The best preparation for tomorrow is doing your best today.", author: "H. Jackson Brown Jr." },
  { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
  { text: "Limit your 'always' and your 'nevers'.", author: "Amy Poehler" },
  { text: "Curiosity is one of the permanent and certain characteristics of a vigorous intellect.", author: "Samuel Johnson" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" }
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
