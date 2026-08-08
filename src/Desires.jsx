import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Plus, Minus, Trash2 } from 'lucide-react'

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {Icon && (
        <span className="empty-state__icon">
          <Icon size={22} strokeWidth={1.6} />
        </span>
      )}
      <p className="empty-state__title">{title}</p>
      {subtitle && <p className="empty-state__subtitle">{subtitle}</p>}
    </motion.div>
  )
}

export default function Desires({ desires, setDesires }) {
  const [draft, setDraft] = useState('')

  function addDesire(e) {
    e.preventDefault()
    const title = draft.trim()
    if (!title) return
    setDesires((prev) => [
      { id: crypto.randomUUID(), title, progress: 0, createdAt: Date.now() },
      ...prev,
    ])
    setDraft('')
  }

  function bump(id, delta) {
    setDesires((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, progress: Math.min(100, Math.max(0, d.progress + delta)) } : d
      )
    )
  }

  function remove(id) {
    setDesires((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <div className="screen">
      <header className="section-header">
        <p className="home-header__eyebrow">What you're reaching for</p>
        <h1>Desires</h1>
      </header>

      <form className="desire-form" onSubmit={addDesire}>
        <input
          className="desire-form__input"
          placeholder="Name something you're working toward…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <motion.button type="submit" className="desire-form__add" whileTap={{ scale: 0.9 }} aria-label="Add desire">
          <Plus size={17} />
        </motion.button>
      </form>

      {desires.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="Nothing added yet"
          subtitle="Name something you want, big or small, and track it here."
        />
      ) : (
        <div className="desires-list">
          <AnimatePresence initial={false}>
            {desires.map((d, i) => (
              <motion.div
                className="desire-card"
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="desire-card__top">
                  <Flame size={16} color="var(--coral-dark)" />
                  <p>{d.title}</p>
                  <button className="desire-card__remove" onClick={() => remove(d.id)} aria-label="Remove desire">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="desire-card__track">
                  <motion.div
                    className="desire-card__fill"
                    animate={{ width: `${d.progress}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
                <div className="desire-card__controls">
                  <button onClick={() => bump(d.id, -10)} aria-label="Decrease progress">
                    <Minus size={13} />
                  </button>
                  <span>{d.progress}%</span>
                  <button onClick={() => bump(d.id, 10)} aria-label="Increase progress">
                    <Plus size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
