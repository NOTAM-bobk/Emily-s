import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

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

function WriteIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 28 L26 14 C27.5 12.5 29.5 12.5 31 14 C32.5 15.5 32.5 17.5 31 19 L17 33 L11 34 Z" stroke="var(--ink)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M23 17.5 L27.5 22" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11 34 L12 28" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PulseIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 22 H15 L18 14 L22 28 L25 20 L27 22 H33"
        stroke="var(--ink)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CompassIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="12.5" stroke="var(--ink)" strokeWidth="1.6" />
      <path d="M24.5 15.5 L21.5 21.5 L15.5 24.5 L18.5 18.5 Z" fill="var(--ink)" />
      <circle cx="20" cy="20" r="1.1" fill="var(--cream)" />
    </svg>
  )
}

const FEATURES = [
  {
    icon: WriteIcon,
    eyebrow: 'Write',
    headline: 'A private place for whatever\u2019s on your mind',
    body: 'No one reads this but you. Write a full page or a single line \u2014 however the day comes out.',
  },
  {
    icon: PulseIcon,
    eyebrow: 'Reflect',
    headline: 'Watch your patterns take shape',
    body: 'A quick check-in each day builds a picture you can\u2019t see day to day \u2014 what lifts you, what wears you down.',
  },
  {
    icon: CompassIcon,
    eyebrow: 'Notice',
    headline: 'Get a little closer to what you want',
    body: 'Putting a feeling into words is often how you find out you had one. Come back in a month and see how far you\u2019ve moved.',
  },
]

const STARTERS = [
  { id: 'gratitude', label: 'Gratitude', desc: 'Three things, however small' },
  { id: 'morning', label: 'Morning pages', desc: 'Clear your head before the day starts' },
  { id: 'mood', label: 'Mood check-in', desc: 'One line on how today felt' },
  { id: 'evening', label: 'Evening reflection', desc: 'What happened, what it meant' },
  { id: 'freewrite', label: 'Free write', desc: 'No prompt, no rules' },
]

// Step order: 0 = brand intro, 1-3 = features, 4 = name, 5 = starting prompts
const NAME_STEP = 1 + FEATURES.length
const PROMPTS_STEP = NAME_STEP + 1
const TOTAL_STEPS = PROMPTS_STEP + 1

const slideVariants = {
  enter: (direction) => ({ opacity: 0, x: direction > 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0 },
  exit: (direction) => ({ opacity: 0, x: direction > 0 ? -24 : 24 }),
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [name, setName] = useState('')
  const [selected, setSelected] = useState([])
  const shouldReduceMotion = useReducedMotion()

  function goTo(nextStep) {
    setDirection(nextStep > step ? 1 : -1)
    setStep(nextStep)
  }

  function handleNext(e) {
    e?.preventDefault()
    if (step < TOTAL_STEPS - 1) {
      goTo(step + 1)
    } else {
      onComplete(name.trim(), selected)
    }
  }

  function handleBack() {
    if (step > 0) goTo(step - 1)
  }

  function handleSkip() {
    onComplete('', [])
  }

  function toggleStarter(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const isFeatureStep = step >= 1 && step <= FEATURES.length
  const feature = isFeatureStep ? FEATURES[step - 1] : null
  const isNameStep = step === NAME_STEP
  const isPromptsStep = step === PROMPTS_STEP

  const ctaLabel = isPromptsStep ? 'Start journaling' : isNameStep ? 'Continue' : step === 0 ? 'Get started' : 'Next'

  return (
    <div className="onboarding">
      <motion.div
        className="onboarding__card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="onboarding__progress" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={
                'onboarding__dot' + (i === step ? ' onboarding__dot--active' : i < step ? ' onboarding__dot--done' : '')
              }
            />
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            className="onboarding__step"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: 'easeOut' }}
          >
            {step === 0 && (
              <div className="onboarding__panel">
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
              </div>
            )}

            {isFeatureStep && (
              <div className="onboarding__panel">
                <motion.span
                  className="onboarding__icon"
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.05, duration: 0.35 }}
                >
                  <feature.icon size={40} />
                </motion.span>
                <span className="onboarding__eyebrow">{feature.eyebrow}</span>
                <h2 className="onboarding__headline">{feature.headline}</h2>
                <p className="onboarding__body">{feature.body}</p>
              </div>
            )}

            {isNameStep && (
              <div className="onboarding__panel">
                <h2 className="onboarding__headline">What should we call you?</h2>
                <p className="onboarding__body">Just for the little hello on your homepage.</p>
                <input
                  className="onboarding__input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext(e)}
                  autoFocus
                />
              </div>
            )}

            {isPromptsStep && (
              <div className="onboarding__panel">
                <h2 className="onboarding__headline">Where do you want to start?</h2>
                <p className="onboarding__body">Pick a few \u2014 you can change this anytime.</p>
                <div className="onboarding__chips">
                  {STARTERS.map((s, i) => (
                    <motion.button
                      key={s.id}
                      type="button"
                      className={'onboarding__chip' + (selected.includes(s.id) ? ' onboarding__chip--selected' : '')}
                      onClick={() => toggleStarter(s.id)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: shouldReduceMotion ? 0 : 0.04 * i, duration: 0.25 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="onboarding__chip-label">{s.label}</span>
                      <span className="onboarding__chip-desc">{s.desc}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <form onSubmit={handleNext} className="onboarding__form">
          <motion.button type="submit" className="save-btn onboarding__cta" whileTap={{ scale: 0.95 }}>
            {ctaLabel}
          </motion.button>

          <div className="onboarding__footer-nav">
            {step > 0 && (
              <button type="button" className="link-btn onboarding__back" onClick={handleBack}>
                Back
              </button>
            )}
            {step < TOTAL_STEPS - 1 && (
              <button type="button" className="link-btn onboarding__skip" onClick={handleSkip}>
                Skip for now
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  )
}
