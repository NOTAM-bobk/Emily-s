import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, RotateCcw, Check } from 'lucide-react'

export default function Settings({ profile, setProfile, onClose, onResetData }) {
  const [name, setName] = useState(profile.name || '')
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setProfile((p) => ({ ...p, name: name.trim() }))
    setSaved(true)
    setTimeout(() => setSaved(false), 1400)
  }

  return (
    <motion.div
      className="sheet-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__header">
          <span className="sheet__date">Settings</span>
          <button className="sheet__close" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <div className="settings__field">
          <label htmlFor="settings-name">Your name</label>
          <input
            id="settings-name"
            className="settings__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should we call you?"
          />
          <p className="settings__hint">Used in your Home screen greeting.</p>
        </div>

        <motion.button className="save-btn settings__save" whileTap={{ scale: 0.94 }} onClick={handleSave}>
          {saved ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={16} /> Saved
            </span>
          ) : (
            'Save name'
          )}
        </motion.button>

        <div className="settings__danger">
          <h4>Data</h4>
          <p className="settings__hint">
            Everything you write is stored only in this browser's local storage — nothing is sent
            anywhere.
          </p>
          {confirmingReset ? (
            <div className="detail__confirm">
              <span>Erase all entries and desires?</span>
              <button
                className="detail__confirm-yes"
                onClick={() => {
                  onResetData()
                  setConfirmingReset(false)
                }}
              >
                Erase everything
              </button>
              <button className="detail__confirm-no" onClick={() => setConfirmingReset(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="settings__reset" onClick={() => setConfirmingReset(true)}>
              <RotateCcw size={14} /> Reset all data
            </button>
          )}
        </div>

        <p className="settings__version">Solace v1.0 — UI prototype</p>
      </motion.div>
    </motion.div>
  )
}
