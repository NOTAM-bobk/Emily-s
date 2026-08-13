import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  NotebookPen,
  Star,
  Image as ImageIcon,
  Mic,
  Search,
  SlidersHorizontal,
  X,
  SearchX,
} from 'lucide-react'
import { TINTS, MOOD_TINTS } from './copy.js'
import { formatEntryDate } from './dates.js'

const MOOD_FACE_PATHS = {
  happy: (
    <>
      <path d="M9 14c1 1.4 2.4 2.1 4 2.1s3-.7 4-2.1" strokeLinecap="round" />
      <path d="M9.5 9.5c.4-.5.9-.5 1.3 0" strokeLinecap="round" />
      <path d="M13.2 9.5c.4-.5.9-.5 1.3 0" strokeLinecap="round" />
    </>
  ),
  content: (
    <>
      <path d="M9 15c1 1 2.4 1.6 4 1.6s3-.6 4-1.6" strokeLinecap="round" />
      <path d="M8.8 9.6c.9-.7 1.9-.7 2.2 0" strokeLinecap="round" />
      <path d="M13 9.6c.9-.7 1.9-.7 2.2 0" strokeLinecap="round" />
    </>
  ),
  neutral: (
    <>
      <path d="M9 15h8" strokeLinecap="round" />
      <path d="M9 10h2.4" strokeLinecap="round" />
      <path d="M12.6 10H15" strokeLinecap="round" />
    </>
  ),
  calm: (
    <>
      <path d="M9 15c1 .6 2.4 1 4 1s3-.4 4-1" strokeLinecap="round" />
      <path d="M8.8 10c.9-.6 1.9-.6 2.2 0" strokeLinecap="round" />
      <path d="M13 10c.9-.6 1.9-.6 2.2 0" strokeLinecap="round" />
    </>
  ),
  sad: (
    <>
      <path d="M9 16.4c1-1.1 2.4-1.7 4-1.7s3 .6 4 1.7" strokeLinecap="round" />
      <path d="M9.5 10.3c.4.5.9.5 1.3 0" strokeLinecap="round" />
      <path d="M13.2 10.3c.4.5.9.5 1.3 0" strokeLinecap="round" />
    </>
  ),
}

function MoodFace({ mood = 'neutral', size = 24, strokeWidth = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="currentColor" strokeWidth={strokeWidth}>
        {MOOD_FACE_PATHS[mood] || MOOD_FACE_PATHS.neutral}
      </g>
    </svg>
  )
}

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

function toggleInList(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

/** Search + filter bar, plus the collapsible filter panel underneath it. */
function EntrySearchBar({
  searchQuery,
  onSearchChange,
  filtersOpen,
  onToggleFilters,
  activeFilterCount,
  moodOptions,
  typeOptions,
  tagOptions,
  selectedMoods,
  selectedTypes,
  selectedTags,
  onToggleMood,
  onToggleType,
  onToggleTag,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
}) {
  return (
    <div className="entry-search">
      <div className="search-bar">
        <Search size={16} className="search-bar__icon" />
        <input
          type="text"
          className="search-bar__input"
          placeholder="Search entries..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            className="search-bar__clear"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
        <span className="search-bar__divider" />
        <button
          className={`search-bar__filter-btn ${filtersOpen ? 'is-open' : ''} ${activeFilterCount > 0 ? 'is-active' : ''}`}
          onClick={onToggleFilters}
          aria-label="Filters"
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal size={15} />
          {activeFilterCount > 0 && <span className="search-bar__filter-count">{activeFilterCount}</span>}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {filtersOpen && (
          <motion.div
            className="filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="filter-panel__inner">
              {moodOptions.length > 0 && (
                <div className="filter-group">
                  <span className="filter-group__label">Mood</span>
                  <div className="filter-chip-row">
                    {moodOptions.map((mood) => {
                      const isSelected = selectedMoods.includes(mood)
                      return (
                        <button
                          key={mood}
                          className={`filter-chip filter-chip--mood ${isSelected ? 'is-selected' : ''}`}
                          style={isSelected ? { background: MOOD_TINTS[mood], borderColor: 'transparent' } : undefined}
                          onClick={() => onToggleMood(mood)}
                        >
                          <MoodFace mood={mood} size={14} />
                          <span>{mood}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {typeOptions.length > 0 && (
                <div className="filter-group">
                  <span className="filter-group__label">Type</span>
                  <div className="filter-chip-row">
                    {typeOptions.map(({ tag, tint }) => {
                      const isSelected = selectedTypes.includes(tag)
                      return (
                        <button
                          key={tag}
                          className={`filter-chip ${isSelected ? 'is-selected' : ''}`}
                          style={isSelected ? { background: TINTS[tint], borderColor: 'transparent' } : undefined}
                          onClick={() => onToggleType(tag)}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {tagOptions.length > 0 && (
                <div className="filter-group">
                  <span className="filter-group__label">Tags</span>
                  <div className="filter-chip-row">
                    {tagOptions.map((t) => (
                      <button
                        key={t}
                        className={`filter-chip ${selectedTags.includes(t) ? 'is-selected' : ''}`}
                        onClick={() => onToggleTag(t)}
                      >
                        #{t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="filter-group">
                <span className="filter-group__label">Date range</span>
                <div className="filter-date-row">
                  <input
                    type="date"
                    className="filter-date-input"
                    value={dateFrom}
                    max={dateTo || undefined}
                    onChange={(e) => onDateFromChange(e.target.value)}
                  />
                  <span className="filter-date-sep">to</span>
                  <input
                    type="date"
                    className="filter-date-input"
                    value={dateTo}
                    min={dateFrom || undefined}
                    onChange={(e) => onDateToChange(e.target.value)}
                  />
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button className="filter-panel__clear" onClick={onClearFilters}>
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Entries({ entries, onOpen, onNew }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedMoods, setSelectedMoods] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const moodOptions = useMemo(() => {
    const set = new Set()
    entries.forEach((e) => e.mood && set.add(e.mood))
    return Array.from(set)
  }, [entries])

  const typeOptions = useMemo(() => {
    const map = new Map()
    entries.forEach((e) => {
      if (e.tag && !map.has(e.tag)) map.set(e.tag, e.tint)
    })
    return Array.from(map.entries()).map(([tag, tint]) => ({ tag, tint }))
  }, [entries])

  const tagOptions = useMemo(() => {
    const set = new Set()
    entries.forEach((e) => e.tags?.forEach((t) => set.add(t)))
    return Array.from(set)
  }, [entries])

  const activeFilterCount =
    selectedMoods.length + selectedTypes.length + selectedTags.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null

    return entries.filter((entry) => {
      if (q) {
        const haystack = `${entry.title || ''} ${entry.body || ''}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (selectedMoods.length > 0 && !selectedMoods.includes(entry.mood)) return false
      if (selectedTypes.length > 0 && !selectedTypes.includes(entry.tag)) return false
      if (selectedTags.length > 0 && !selectedTags.some((t) => entry.tags?.includes(t))) return false
      if (from && entry.createdAt < from.getTime()) return false
      if (to && entry.createdAt > to.getTime()) return false
      return true
    })
  }, [entries, searchQuery, selectedMoods, selectedTypes, selectedTags, dateFrom, dateTo])

  function clearFilters() {
    setSelectedMoods([])
    setSelectedTypes([])
    setSelectedTags([])
    setDateFrom('')
    setDateTo('')
  }

  const isFiltering = searchQuery.trim() !== '' || activeFilterCount > 0

  return (
    <div className="screen">
      <header className="section-header">
        <h1>All Entries</h1>
        <motion.button
          className="entries-new-btn"
          onClick={onNew}
          aria-label="New entry"
          whileHover={{ scale: 1.06, y: -1 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        >
          <Plus size={19} strokeWidth={2.3} />
        </motion.button>
      </header>

      {entries.length > 0 && (
        <EntrySearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((o) => !o)}
          activeFilterCount={activeFilterCount}
          moodOptions={moodOptions}
          typeOptions={typeOptions}
          tagOptions={tagOptions}
          selectedMoods={selectedMoods}
          selectedTypes={selectedTypes}
          selectedTags={selectedTags}
          onToggleMood={(m) => setSelectedMoods((prev) => toggleInList(prev, m))}
          onToggleType={(t) => setSelectedTypes((prev) => toggleInList(prev, t))}
          onToggleTag={(t) => setSelectedTags((prev) => toggleInList(prev, t))}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onClearFilters={clearFilters}
        />
      )}

      {entries.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="No entries yet"
          subtitle="Tap the + above to write your first one."
        />
      ) : filteredEntries.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching entries"
          subtitle="Try a different search or clear your filters."
        />
      ) : (
        <section className="recent">
          <div className="recent__head">
            <h3>
              {isFiltering
                ? `${filteredEntries.length} of ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`
                : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`}
            </h3>
          </div>
          <div className="recent__list">
            {filteredEntries.map((entry, i) => (
              <motion.button
                key={entry.id}
                className="entry-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.04 * i }}
                whileHover={{ y: -2, boxShadow: 'var(--shadow-lift)' }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onOpen(entry)}
              >
                <div className="entry-card__top">
                  <span className="entry-card__date">
                    {entry.starred && <Star size={11} className="entry-card__star" fill="var(--butter-dark)" />}
                    {formatEntryDate(entry.createdAt)}
                  </span>
                  <span className="entry-card__tag" style={{ background: TINTS[entry.tint] }}>
                    {entry.tag}
                  </span>
                </div>
                <h4 className="entry-card__title">{entry.title}</h4>
                <p className="entry-card__body">{entry.body}</p>

                {entry.tags?.length > 0 && (
                  <div className="entry-card__tags">
                    {entry.tags.slice(0, 3).map((t) => (
                      <span key={t} className="tag-chip tag-chip--small">{t}</span>
                    ))}
                  </div>
                )}

                {entry.mood && (
                  <div
                    className="entry-card__mood"
                    style={{ background: MOOD_TINTS[entry.mood] || TINTS[entry.tint] }}
                  >
                    <MoodFace mood={entry.mood} size={16} />
                  </div>
                )}

                {(entry.attachments?.length > 0 || entry.voiceNote) && (
                  <div className="entry-card__meta">
                    {entry.attachments?.length > 0 && (
                      <span className="entry-card__meta-item">
                        <ImageIcon size={11} /> {entry.attachments.length}
                      </span>
                    )}
                    {entry.voiceNote && (
                      <span className="entry-card__meta-item">
                        <Mic size={11} />
                      </span>
                    )}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
