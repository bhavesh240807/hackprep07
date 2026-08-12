import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import spaceData from '../data/spaceNotes.json'

/* ── Scroll reveal hook ── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) }
      }),
      { threshold: 0.12 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ── Level config ── */
const LEVEL_CONFIG = {
  cadet: { label: 'CADET', color: '#00FF41', icon: '🟢', desc: 'BEGINNER' },
  pilot: { label: 'PILOT', color: '#FFD700', icon: '🟡', desc: 'INTERMEDIATE' },
  commander: { label: 'COMMANDER', color: '#FF007F', icon: '🔴', desc: 'ADVANCED' },
}

/* ── Note Card ── */
function NoteCard({ text, index, color }) {
  return (
    <div className="note-item reveal" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="note-item-index" style={{ color, textShadow: `0 0 8px ${color}55` }}>
        {String(index + 1).padStart(2, '0')}
      </div>
      <p className="note-item-text">{text}</p>
    </div>
  )
}

/* ── Key Fact Chip ── */
function KeyFactChip({ text, index }) {
  return (
    <div className="key-fact-chip" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
      <span className="key-fact-bullet">◆</span>
      <span>{text}</span>
    </div>
  )
}

/* ── Fun Fact Callout ── */
function FunFactCallout({ text }) {
  return (
    <div className="fun-fact-callout reveal">
      <div className="fun-fact-header">
        <span className="fun-fact-icon">💡</span>
        <span className="fun-fact-label">DID YOU KNOW?</span>
      </div>
      <p className="fun-fact-text">{text}</p>
    </div>
  )
}

/* ── Module Detail Panel ── */
function ModuleDetail({ module, onClose }) {
  const [activeLevel, setActiveLevel] = useState('cadet')
  const levelData = module.levels[activeLevel]
  const levelCfg = LEVEL_CONFIG[activeLevel]

  /* Re-trigger scroll reveals when level changes */
  useEffect(() => {
    const els = document.querySelectorAll('.module-detail .reveal')
    els.forEach(el => {
      el.classList.remove('visible')
      void el.offsetWidth // force reflow
      el.classList.add('visible')
    })
  }, [activeLevel])

  return (
    <div className="module-detail-overlay" onClick={onClose}>
      <div className="module-detail" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="module-detail-header">
          <button className="back-btn" onClick={onClose}>
            <span>◀</span> BACK TO SECTORS
          </button>
          <div className="module-detail-title-row">
            <span className="module-detail-icon">{module.icon}</span>
            <div>
              <div className="module-detail-sector" style={{ color: module.color }}>{module.sector}</div>
              <h2 className="module-detail-name">{module.name}</h2>
            </div>
          </div>
        </div>

        {/* Level Tabs */}
        <div className="level-tabs">
          {Object.entries(LEVEL_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              className={`level-tab ${activeLevel === key ? 'active' : ''}`}
              style={{
                '--tab-color': cfg.color,
                borderColor: activeLevel === key ? cfg.color : 'rgba(255,255,255,0.1)',
                color: activeLevel === key ? cfg.color : 'var(--grey)',
              }}
              onClick={() => setActiveLevel(key)}
            >
              <span className="level-tab-icon">{cfg.icon}</span>
              <span className="level-tab-label">{cfg.label}</span>
              <span className="level-tab-desc">{cfg.desc}</span>
            </button>
          ))}
        </div>

        {/* Scanline */}
        <div className="scanline-sweep" style={{ position: 'absolute' }} />

        {/* Content */}
        <div className="module-detail-content">
          {/* Notes */}
          <div className="notes-section">
            <div className="notes-section-header">
              <span className="notes-section-label" style={{ color: levelCfg.color }}>
                ▸ MISSION NOTES — {levelCfg.label} LEVEL
              </span>
              <span className="notes-count">{levelData.notes.length} ENTRIES</span>
            </div>
            <div className="notes-list">
              {levelData.notes.map((note, i) => (
                <NoteCard key={`${activeLevel}-${i}`} text={note} index={i} color={levelCfg.color} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="notes-sidebar">
            {/* Key Facts */}
            <div className="key-facts-box reveal">
              <div className="key-facts-header">
                <span>📋</span> KEY INTEL
              </div>
              {levelData.keyFacts.map((fact, i) => (
                <KeyFactChip key={i} text={fact} index={i} />
              ))}
            </div>

            {/* Fun Fact */}
            <FunFactCallout text={levelData.funFact} />

            {/* Difficulty indicator */}
            <div className="difficulty-indicator reveal">
              <div className="difficulty-label">DIFFICULTY</div>
              <div className="difficulty-bars">
                {[1, 2, 3].map(d => (
                  <div
                    key={d}
                    className={`difficulty-bar ${d <= levelData.difficulty ? 'active' : ''}`}
                    style={{
                      background: d <= levelData.difficulty ? levelCfg.color : 'rgba(255,255,255,0.08)',
                      boxShadow: d <= levelData.difficulty ? `0 0 8px ${levelCfg.color}55` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Module Card ── */
function ModuleCard({ module, index, onClick }) {
  const levelKeys = Object.keys(LEVEL_CONFIG)
  return (
    <div
      className="module-card reveal"
      style={{ '--card-accent': module.color, animationDelay: `${index * 0.1}s` }}
      onClick={onClick}
    >
      <div className="pixel-corner pixel-corner-tl" style={{ borderColor: module.color }} />
      <div className="pixel-corner pixel-corner-br" style={{ borderColor: module.color }} />

      <div className="module-card-sector" style={{ color: module.color }}>{module.sector}</div>
      <div className="module-card-icon">{module.icon}</div>
      <h3 className="module-card-title">{module.name}</h3>
      <p className="module-card-desc">{module.description}</p>

      <div className="module-card-levels">
        {levelKeys.map(key => (
          <span
            key={key}
            className="module-card-level-dot"
            style={{ background: LEVEL_CONFIG[key].color, boxShadow: `0 0 6px ${LEVEL_CONFIG[key].color}66` }}
            title={LEVEL_CONFIG[key].label}
          />
        ))}
        <span className="module-card-level-text">3 LEVELS</span>
      </div>

      <div className="module-card-launch" style={{ color: module.color, borderColor: module.color }}>
        ACCESS SECTOR ▸
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   MODULES PAGE (ROOT)
───────────────────────────────────────── */
export default function ModulesPage() {
  useReveal()
  const navigate = useNavigate()
  const [selectedModule, setSelectedModule] = useState(null)

  /* Re-trigger reveals when returning from detail */
  useEffect(() => {
    if (!selectedModule) {
      const els = document.querySelectorAll('.reveal')
      els.forEach(el => {
        el.classList.remove('visible')
        void el.offsetWidth
      })
      const io = new IntersectionObserver(
        (entries) => entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) }
        }),
        { threshold: 0.12 }
      )
      const revealEls = document.querySelectorAll('.reveal')
      revealEls.forEach(el => io.observe(el))
      return () => io.disconnect()
    }
  }, [selectedModule])

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          orbit<span>Ed.</span>
        </div>
        <ul className="nav-links">
          <li><a className="nav-link" onClick={() => navigate('/')}>HOME</a></li>
          <li><a className="nav-link active-link">MODULES</a></li>
          <li><a className="nav-link">RANKS</a></li>
          <li><a className="nav-link">LEADERBOARD</a></li>
        </ul>
        <div className="nav-actions">
          <button className="btn-pixel btn-pixel-secondary" style={{ fontSize: 9, padding: '8px 16px' }}>
            SIGN IN
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <div className="modules-page">
        {/* Hero Banner */}
        <div className="modules-hero">
          <div className="modules-hero-content">
            <div className="section-label">
              STAR MAP — KNOWLEDGE SECTORS
            </div>
            <h1 className="modules-hero-title">
              MISSION <span className="accent-cyan">SECTORS</span>
            </h1>
            <p className="modules-hero-desc">
              Select a sector to access classified space intelligence. Each sector contains
              three clearance levels — <span style={{ color: '#00FF41' }}>Cadet</span>,{' '}
              <span style={{ color: '#FFD700' }}>Pilot</span>, and{' '}
              <span style={{ color: '#FF007F' }}>Commander</span>.
              Study the briefings. Master the knowledge. Rank up.
            </p>
          </div>

          {/* Stats bar */}
          <div className="modules-stats-bar">
            <div className="modules-stat">
              <span className="modules-stat-value">{spaceData.modules.length}</span>
              <span className="modules-stat-label">SECTORS</span>
            </div>
            <div className="modules-stat">
              <span className="modules-stat-value">{spaceData.modules.length * 3}</span>
              <span className="modules-stat-label">LEVELS</span>
            </div>
            <div className="modules-stat">
              <span className="modules-stat-value">
                {spaceData.modules.reduce((sum, m) =>
                  sum + Object.values(m.levels).reduce((s, l) => s + l.notes.length, 0), 0
                )}
              </span>
              <span className="modules-stat-label">NOTES</span>
            </div>
            <div className="modules-stat">
              <span className="modules-stat-value">∞</span>
              <span className="modules-stat-label">KNOWLEDGE</span>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="modules-grid-container">
          <div className="modules-grid">
            {spaceData.modules.map((module, i) => (
              <ModuleCard
                key={module.id}
                module={module}
                index={i}
                onClick={() => setSelectedModule(module)}
              />
            ))}
          </div>
        </div>

        {/* Back to Launch */}
        <div className="modules-footer-cta reveal">
          <button
            className="btn-pixel btn-pixel-secondary"
            onClick={() => navigate('/')}
          >
            ◀ RETURN TO SPACEPORT
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">orbit<span style={{ color: 'var(--gold)' }}>Ed.</span></div>
          <div className="footer-copy">
            © 2026 orbitEd. ENGINE.{' '}
            <span className="insert">INSERT COIN.</span>
          </div>
          <div className="footer-links">
            {['PRIVACY', 'TERMS', 'GITHUB', 'CONTACT'].map(l => (
              <span className="footer-link" key={l}>{l}</span>
            ))}
          </div>
        </div>
      </footer>

      {/* Module Detail Overlay */}
      {selectedModule && (
        <ModuleDetail
          module={selectedModule}
          onClose={() => setSelectedModule(null)}
        />
      )}
    </>
  )
}
