import { useState } from 'react'
import { motion } from 'framer-motion'

function CatMascot({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 8 L14 16 L20 13 L26 16 L29 8 L27 20 C27 26 24 29 20 29 C16 29 13 26 13 20 Z"
        fill="var(--ink)"
      />
      <circle cx="16.5" cy="19.5" r="1.1" fill="var(--cream)" />
      <circle cx="23.5" cy="19.5" r="1.1" fill="var(--cream)" />
      <path d="M18.3 22.5c.5.6 1 .6 1.5 0" stroke="var(--cream)" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M14 21.5l-3 .3M14 23l-3.2 1.3M26 21.5l3 .3M26 23l3.2 1.3" stroke="var(--ink)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

// NOTE: placeholder onboarding flow — functional and on-brand, but intended
// to be reworked into something more considered later.
export default function Onboarding({ onComplete }) {
  const [name, setName] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onComplete(name.trim())
  }

  return (
    <div className="onboarding">
      <motion.div
        className="onboarding__card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <motion.span
          className="onboarding__mascot"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <CatMascot size={48} />
        </motion.span>

        <h1>Solace</h1>
        <p className="onboarding__tagline">
          A quiet place to write, track how you feel, and notice what you want.
        </p>

        <form onSubmit={handleSubmit} className="onboarding__form">
          <input
            className="onboarding__input"
            placeholder="What should we call you?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <motion.button type="submit" className="save-btn onboarding__cta" whileTap={{ scale: 0.95 }}>
            Get started
          </motion.button>
          <button type="button" className="link-btn onboarding__skip" onClick={() => onComplete('')}>
            Skip for now
          </button>
        </form>
      </motion.div>
    </div>
  )
}
