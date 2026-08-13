import { useRef, useState } from 'react'
import { motion, useDragControls } from 'framer-motion'
import {
  X,
  RotateCcw,
  Check,
  Download,
  Upload,
  Shield,
  FileText,
  Lightbulb,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'

const LEGAL_LINKS = [
  {
    key: 'feature-board',
    icon: Lightbulb,
    tone: 'butter',
    title: 'Feature board',
    subtitle: 'See what\u2019s next, vote on ideas',
    href: 'https://example.com/features',
  },
  {
    key: 'privacy',
    icon: Shield,
    tone: 'sage',
    title: 'Privacy policy',
    subtitle: 'How your data is handled',
    href: 'https://example.com/privacy',
  },
  {
    key: 'terms',
    icon: FileText,
    tone: 'lavender',
    title: 'Terms & conditions',
    subtitle: 'The fine print',
    href: 'https://example.com/terms',
  },
]

function SettingsGroup({ label, children }) {
  return (
    <div className="settings__section">
      {label && <p className="settings__group-label">{label}</p>}
      <div className="settings__group">{children}</div>
    </div>
  )
}

function SettingsRow({ icon: Icon, tone = 'sage', title, subtitle, onClick, trailing, href, disabled }) {
  const content = (
    <>
      <span className={`settings__row-icon settings__row-icon--${tone}`}>
        <Icon size={15} />
      </span>
      <span className="settings__row-body">
        <span className="settings__row-title">{title}</span>
        {subtitle && <span className="settings__row-sub">{subtitle}</span>}
      </span>
      {trailing !== undefined ? trailing : <ChevronRight size={15} className="settings__row-chevron" />}
    </>
  )

  if (href) {
    return (
      <a
        className="settings__row"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    )
  }

  return (
    <button className="settings__row" onClick={onClick} disabled={disabled} type="button">
      {content}
    </button>
  )
}

export default function Settings({
  profile,
  setProfile,
  onClose,
  onResetData,
  entries = [],
  desires = [],
  customTags = [],
  setEntries,
  setDesires,
  setCustomTags,
}) {
  const [name, setName] = useState(profile.name || '')
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState(null)
  const [pendingImport, setPendingImport] = useState(null)

  const fileInputRef = useRef(null)
  const dragControls = useDragControls()

  const initial = (profile.name || '?').trim().charAt(0).toUpperCase() || '?'

  function flashToast(message) {
    setToast(message)
    setTimeout(() => setToast(null), 2200)
  }

  function handleSave() {
    setProfile((p) => ({ ...p, name: name.trim() }))
    setSaved(true)
    setTimeout(() => setSaved(false), 1400)
  }

  function handleExportData() {
    const payload = {
      app: 'Solace',
      exportVersion: 1,
      exportedAt: new Date().toISOString(),
      profile,
      entries,
      desires,
      customTags,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `solace-backup-${stamp}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    flashToast('Backup downloaded')
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleFileChosen(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        if (!parsed || typeof parsed !== 'object') throw new Error('bad shape')
        setPendingImport({
          fileName: file.name,
          data: {
            profile: parsed.profile && typeof parsed.profile === 'object' ? parsed.profile : null,
            entries: Array.isArray(parsed.entries) ? parsed.entries : [],
            desires: Array.isArray(parsed.desires) ? parsed.desires : [],
            customTags: Array.isArray(parsed.customTags) ? parsed.customTags : [],
          },
        })
      } catch {
        flashToast('Couldn\u2019t read that file')
      }
    }
    reader.onerror = () => flashToast('Couldn\u2019t read that file')
    reader.readAsText(file)
  }

  function confirmImport() {
    if (!pendingImport) return
    const { data } = pendingImport
    if (data.profile) setProfile((p) => ({ ...p, ...data.profile }))
    setEntries?.(data.entries)
    setDesires?.(data.desires)
    setCustomTags?.(data.customTags)
    if (data.profile?.name !== undefined) setName(data.profile.name || '')
    setPendingImport(null)
    flashToast('Data imported')
  }

  function handleDragEnd(_e, info) {
    if (info.offset.y > 110 || info.velocity.y > 700) {
      onClose()
    }
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
        className="sheet settings"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.55 }}
        onDragEnd={handleDragEnd}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sheet__grabber-zone"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <span className="sheet__grabber" />
        </div>

        <div className="sheet__header settings__header">
          <span className="sheet__date">Settings</span>
          <button className="sheet__close" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        {/* ---------- Profile ---------- */}
        <SettingsGroup label="Profile">
          <div className="settings__profile">
            <span className="settings__avatar">{initial}</span>
            <div className="settings__profile-fields">
              <label htmlFor="settings-name">Your name</label>
              <input
                id="settings-name"
                className="settings__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What should we call you?"
              />
            </div>
          </div>
          <div className="settings__profile-footer">
            <p className="settings__hint">Used in your Home screen greeting.</p>
            <motion.button
              className="save-btn settings__save"
              whileTap={{ scale: 0.94 }}
              onClick={handleSave}
              disabled={!name.trim() && !profile.name}
            >
              {saved ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={16} /> Saved
                </span>
              ) : (
                'Save name'
              )}
            </motion.button>
          </div>
        </SettingsGroup>

        {/* ---------- Data ---------- */}
        <SettingsGroup label="Data">
          <SettingsRow
            icon={Download}
            tone="sage"
            title="Export data"
            subtitle="Download everything as a backup file"
            onClick={handleExportData}
          />
          <SettingsRow
            icon={Upload}
            tone="lavender"
            title="Import data"
            subtitle="Restore from a backup file"
            onClick={handleImportClick}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="settings__file-input"
            onChange={handleFileChosen}
          />
        </SettingsGroup>

        {pendingImport && (
          <div className="settings__import-confirm">
            <div className="settings__import-confirm-head">
              <AlertCircle size={15} />
              <span>Replace current data?</span>
            </div>
            <p className="settings__hint">
              Importing <strong>{pendingImport.fileName}</strong> will overwrite your entries, desires
              and tags with {pendingImport.data.entries.length} entr
              {pendingImport.data.entries.length === 1 ? 'y' : 'ies'} and {pendingImport.data.desires.length}{' '}
              desire{pendingImport.data.desires.length === 1 ? '' : 's'} from the file.
            </p>
            <div className="detail__confirm">
              <button className="detail__confirm-yes" onClick={confirmImport}>Replace data</button>
              <button className="detail__confirm-no" onClick={() => setPendingImport(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* ---------- Support & legal ---------- */}
        <SettingsGroup label="Support & legal">
          {LEGAL_LINKS.map((link) => (
            <SettingsRow
              key={link.key}
              icon={link.icon}
              tone={link.tone}
              title={link.title}
              subtitle={link.subtitle}
              href={link.href}
            />
          ))}
        </SettingsGroup>

        {/* ---------- Danger zone ---------- */}
        <SettingsGroup label="Danger zone">
          <div className="settings__danger">
            <p className="settings__hint">
              Everything you write is stored only in this browser's local storage — nothing is sent
              anywhere. Exporting first is a good idea before resetting.
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
        </SettingsGroup>

        <p className="settings__version">Solace v1.0 — UI prototype</p>

        {toast && (
          <motion.div
            className="settings__toast"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <Check size={13} /> {toast}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
