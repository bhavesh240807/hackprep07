import { useEffect, useRef, useState } from 'react'

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

/* ── Stardust counter ── */
function useStardust() {
  const [sd, setSd] = useState(() => {
    try { return parseInt(localStorage.getItem('astroquest_stardust') || '0', 10) } catch { return 0 }
  })
  return sd
}

/* ── Pixel Space Station (CSS art) ── */
function SpaceStation() {
  return (
    <div className="space-station">
      <div className="station-ring station-ring-3" />
      <div className="station-ring station-ring-2" />
      <div className="station-ring station-ring-1" />
      <div className="station-core" />
    </div>
  )
}

/* ── Retro Terminal Preview ── */
function TerminalPreview() {
  const [lines, setLines] = useState(0)
  const content = [
    { cls: 't-green', text: '> FLIGHT COMPUTER v2.5 ONLINE' },
    { cls: 't-grey', text: '  initializing mission data...' },
    { cls: 't-cyan', text: '> TOPIC: Orbital Mechanics' },
    { cls: 't-grey', text: '  generating briefing...' },
    { cls: 't-gold', text: '> MISSION LOADED ✓' },
    { cls: 't-grey', text: '  questions: 5  |  xp: +500' },
    { cls: 't-magenta', text: '> AWAITING ASTRONAUT...' },
  ]
  useEffect(() => {
    if (lines >= content.length) return
    const t = setTimeout(() => setLines(l => l + 1), 400 + Math.random() * 200)
    return () => clearTimeout(t)
  }, [lines])

  return (
    <div className="terminal-preview">
      <div className="terminal-bar">
        <div className="terminal-dot" style={{ borderColor: '#ff5f56' }} />
        <div className="terminal-dot" style={{ borderColor: '#ffbd2e' }} />
        <div className="terminal-dot" style={{ borderColor: '#27c93f' }} />
        <span style={{ fontFamily: 'var(--font-code)', fontSize: 10, color: 'var(--grey)', marginLeft: 6 }}>
          FLIGHT_COMPUTER.exe
        </span>
      </div>
      <div className="terminal-body">
        {content.slice(0, lines).map((l, i) => (
          <div key={i} className={l.cls}>{l.text}</div>
        ))}
        {lines < content.length && <span className="t-cursor" />}
      </div>
    </div>
  )
}

/* ── Animated counter ── */
function AnimCounter({ target, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef()
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        io.disconnect()
        let start = 0
        const step = target / 60
        const t = setInterval(() => {
          start = Math.min(start + step, target)
          setVal(Math.floor(start))
          if (start >= target) clearInterval(t)
        }, 16)
      }
    }, { threshold: 0.5 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [target])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

/* ─────────────────────────────────────────
   NAVBAR
───────────────────────────────────────── */
function Navbar({ stardust }) {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        orbit<span>Ed.</span>
      </div>

      <ul className="nav-links">
        {['MISSIONS', 'RANKS', 'LEADERBOARD', 'ABOUT'].map(l => (
          <li key={l}><a className="nav-link">{l}</a></li>
        ))}
      </ul>

      <div className="nav-actions">
        {stardust > 0 && (
          <div className="nav-stardust">⭐ {stardust} SD</div>
        )}
        <button className="btn-pixel btn-pixel-secondary" style={{ fontSize: 9, padding: '8px 16px' }}>
          SIGN IN
        </button>
        <button className="btn-pixel btn-pixel-primary" style={{ fontSize: 9, padding: '10px 18px' }}>
          LAUNCH
        </button>
      </div>
    </nav>
  )
}

/* ─────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-tagline">
          GAMIFIED ASTROPHYSICS ENGINE
        </div>

        <h1 className="hero-title">
          <span className="line1">CHART YOUR</span>
          <span className="line2">orbitEd.</span>
          <span className="line1" style={{ fontSize: '0.55em', color: 'rgba(232,232,255,0.7)' }}>
            LEARNING ORBIT
          </span>
        </h1>

        <p className="hero-subtitle">
          Master <span className="highlight">orbital mechanics</span>, stellar evolution &amp;
          astrophysics — not through textbooks, but by actually{' '}
          <span className="highlight">flying, dodging, and launching</span> through space.
          Powered by an infinite AI flight computer.
        </p>

        <div className="hero-cta-group">
          <button className="btn-pixel btn-pixel-primary btn-lg">
            <span>🚀</span>
            <span className="btn-blink-label">[ INITIATE IGNITION ]</span>
          </button>
          <button className="btn-pixel btn-pixel-secondary">
            VIEW MISSIONS
          </button>
        </div>

        <div className="hero-stats">
          {[
            { val: 12000, suffix: '+', label: 'MISSIONS FLOWN' },
            { val: 99, suffix: '%', label: 'MISSION SUCCESS' },
            { val: 5, suffix: '+', label: 'GAME MODES' },
          ].map((s, i) => (
            <div className="hero-stat" key={i}>
              <div className="hero-stat-value">
                <AnimCounter target={s.val} suffix={s.suffix} />
              </div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-visual">
        {/* Planets */}
        <div className="planet planet-saturn" style={{ position: 'absolute', top: '15%', right: '5%' }} />
        <div className="planet planet-blue" style={{ position: 'absolute', top: '60%', right: '22%' }} />
        <div className="planet planet-red" style={{ position: 'absolute', top: '25%', right: '35%' }} />

        {/* Space Station */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -55%)' }}>
          <SpaceStation />
        </div>

        {/* Rocket */}
        <div style={{ position: 'absolute', bottom: '20%', left: '15%' }}>
          <div className="pixel-rocket">🚀</div>
        </div>

        {/* Asteroid belt decorations */}
        {['🪨', '💫', '⭐', '✨'].map((e, i) => (
          <div key={i} style={{
            position: 'absolute',
            fontSize: [16, 20, 14, 18][i] + 'px',
            top: [30, 70, 80, 45][i] + '%',
            left: [10, 70, 40, 80][i] + '%',
            animation: `floatY ${4 + i}s ease-in-out infinite ${i * 0.7}s`,
            opacity: 0.7,
          }}>{e}</div>
        ))}

        <TerminalPreview />
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   FEATURES SECTION
───────────────────────────────────────── */
const FEATURES = [
  {
    icon: '🛸',
    number: '01',
    title: 'DYNAMIC MISSIONS',
    titleAccent: 'DYNAMIC',
    desc: 'Infinite knowledge powered by the AI flight computer. Every launch generates a unique briefing, quiz set, and telemetry report — no two missions are alike.',
    tag: 'AI POWERED',
    color: 'var(--cyan)',
    delay: '0s',
  },
  {
    icon: '🌌',
    number: '02',
    title: 'ARCADE PHYSICS',
    titleAccent: 'ARCADE',
    desc: 'Learn orbital mechanics by actually flying. Steer through asteroid fields, slingshot around gravity wells, and pilot rovers across lunar terrain.',
    tag: 'GAMEPLAY',
    color: 'var(--magenta)',
    delay: '0.15s',
  },
  {
    icon: '🏆',
    number: '03',
    title: 'RANK UP SYSTEM',
    titleAccent: 'RANK UP',
    desc: 'Earn Stardust, unlock Telemetry Badges, maintain Orbit Streaks, and ascend from Space Cadet to Cosmic Explorer. Your progress persists across sessions.',
    tag: 'PROGRESSION',
    color: 'var(--gold)',
    delay: '0.3s',
  },
  {
    icon: '⚡',
    number: '04',
    title: 'STREAK ENGINE',
    titleAccent: 'STREAK',
    desc: "Log in daily to maintain your Orbit Streak. Miss a day and your hull cools down. Chain 7 days and become a Week Warrior with bonus Stardust rewards.",
    tag: 'RETENTION',
    color: 'var(--purple)',
    delay: '0.45s',
  },
  {
    icon: '📡',
    number: '05',
    title: 'TELEMETRY ARCHIVES',
    titleAccent: 'TELEMETRY',
    desc: 'Review every answered question in your mission logs. Study-mode lets you replay failed briefings, track accuracy by sector, and earn remedial Stardust.',
    tag: 'REVIEW',
    color: 'var(--green)',
    delay: '0.6s',
  },
  {
    icon: '🎖️',
    number: '06',
    title: 'BADGE COLLECTION',
    titleAccent: 'BADGE',
    desc: 'Unlock pixel-art achievement badges: "Event Horizon Survivor", "Lunar Rover Legend", "Zero-G Scholar". Show them off on your Astronaut profile.',
    tag: 'ACHIEVEMENTS',
    color: 'var(--magenta)',
    delay: '0.75s',
  },
]

function FeaturesSection() {
  return (
    <section className="section" id="features">
      <div className="pixel-divider" />
      <div style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 60 }}>
        <div className="section-label reveal">MISSION PARAMETERS</div>
        <h2 className="section-title reveal">
          WHY <span className="accent">orbitEd.</span>{' '}
          <span className="accent-cyan">WORKS</span>
        </h2>
        <p className="section-desc reveal">
          Six core systems working in harmony to make learning feel like the best game you've ever played.
        </p>

        <div className="features-grid">
          {FEATURES.map((f) => (
            <div
              key={f.number}
              className="feature-card glass-card reveal"
              style={{ '--card-accent': f.color, animationDelay: f.delay }}
            >
              <div className="pixel-corner pixel-corner-tl" style={{ borderColor: f.color }} />
              <div className="pixel-corner pixel-corner-br" style={{ borderColor: f.color }} />
              <div className="feature-card-number">{f.number}</div>
              <span className="feature-card-icon">{f.icon}</span>
              <h3 className="feature-card-title">{f.title}</h3>
              <p className="feature-card-desc">{f.desc}</p>
              <div className="feature-card-tag" style={{ borderColor: f.color, color: f.color }}>
                {f.tag}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────── */
const STEPS = [
  {
    num: '01',
    title: 'CHOOSE YOUR\nSECTOR',
    desc: 'Browse the interactive Star Map. Pick a learning domain — Black Holes, Orbital Mechanics, Stellar Evolution, or any subject your curiosity charts.',
    delay: '0s',
  },
  {
    num: '02',
    title: 'READ THE\nBRIEFING',
    desc: 'The AI Flight Computer generates a 3-sentence mission summary in a retro green terminal. Absorb it fast — the clock is ticking.',
    delay: '0.2s',
  },
  {
    num: '03',
    title: 'FLY THE\nMISSION',
    desc: 'Pilot through arcade physics games where your answers steer the ship. Get it right: +100 Stardust. Get it wrong: read the telemetry, try again.',
    delay: '0.4s',
  },
]

function HowItWorksSection() {
  return (
    <section className="section" style={{ background: 'rgba(0,240,255,0.02)' }}>
      <div className="pixel-divider" />
      <div style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 60 }}>
        <div className="section-label reveal">MISSION BRIEFING</div>
        <h2 className="section-title reveal" style={{ textAlign: 'center' }}>
          HOW THE <span className="accent-cyan">FLIGHT LOOP</span> WORKS
        </h2>
        <p className="section-desc reveal" style={{ textAlign: 'center', margin: '0 auto 60px' }}>
          Three phases. Zero boredom. Infinite knowledge.
        </p>

        <div className="mission-steps">
          {STEPS.map((s, i) => (
            <div className="mission-step reveal" key={i} style={{ animationDelay: s.delay }}>
              <div className="step-number">{s.num}</div>
              <h3 className="step-title" style={{ whiteSpace: 'pre-line' }}>{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   GAME MODES
───────────────────────────────────────── */
const GAME_MODES = [
  {
    num: '01',
    icon: '🚀',
    title: 'ASTEROID QUIZ RUNNER',
    titleAccent: 'ASTEROID',
    desc: 'A vertically scrolling rocket. Question on HUD. Four pixelated asteroids marked A–D spawn ahead. Steer your ship to crash into the correct answer. Wrong = hull damage. Right = Stardust shower.',
    tags: [{ label: 'ARCADE', cls: '' }, { label: 'ACTION', cls: 'magenta' }, { label: '+100 SD', cls: 'gold' }],
  },
  {
    num: '02',
    icon: '🌀',
    title: 'ORBITAL TRAJECTORY SIM',
    titleAccent: 'ORBITAL',
    desc: 'Slingshot a probe around a gravity well using real orbital physics. Earning Fuel Cells for each launch attempt requires answering a comms-satellite trivia prompt first.',
    tags: [{ label: 'PHYSICS PUZZLE', cls: '' }, { label: 'STRATEGY', cls: 'magenta' }, { label: '+150 SD', cls: 'gold' }],
  },
  {
    num: '03',
    icon: '🌕',
    title: 'ROVER PAYLOAD COLLECTOR',
    titleAccent: 'ROVER',
    desc: 'Side-scrolling lunar rover jumping craters. Security gates block the path — hitting a gate triggers a terminal prompt. Correct = gate opens. Wrong = checkpoint reset.',
    tags: [{ label: 'PLATFORMER', cls: '' }, { label: 'EXPLORATION', cls: 'magenta' }, { label: '+200 SD', cls: 'gold' }],
  },
]

function GameModesSection() {
  return (
    <section className="section" id="missions">
      <div className="pixel-divider" />
      <div style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 60 }}>
        <div className="section-label reveal">GAME ENGINES</div>
        <h2 className="section-title reveal">
          3 WAYS TO <span className="accent-cyan">LEARN</span>{' '}
          BY <span className="accent">FLYING</span>
        </h2>
        <p className="section-desc reveal">
          Each game mode injects real LLM-generated questions directly into the physics engine.
          Learning happens mid-mission — not in a classroom.
        </p>

        <div className="game-modes">
          {GAME_MODES.map((m, i) => (
            <div className="game-mode-card reveal" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="game-mode-num">{m.num}</div>
              <div className="game-mode-content">
                <h3 className="game-mode-title">{m.title}</h3>
                <p className="game-mode-desc">{m.desc}</p>
                <div className="game-mode-tags">
                  {m.tags.map((t, j) => (
                    <span className={`game-mode-tag ${t.cls}`} key={j}>{t.label}</span>
                  ))}
                </div>
              </div>
              <div className="game-mode-icon">{m.icon}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   RANKS SECTION
───────────────────────────────────────── */
const RANKS = [
  {
    emoji: '👨‍🚀',
    range: '0 — 299 SD',
    title: 'SPACE\nCADET',
    desc: 'Fresh out of the academy. Your first missions await, cadet. Don\'t get sucked into a black hole.',
    featured: false,
    delay: '0s',
  },
  {
    emoji: '🛸',
    range: '300 — 599 SD',
    title: 'STAR\nPILOT',
    desc: 'You\'ve logged serious flight hours. The asteroid belt no longer scares you.',
    featured: false,
    delay: '0.15s',
  },
  {
    emoji: '🚀',
    range: '600 — 1199 SD',
    title: 'FLIGHT\nCOMMANDER',
    desc: 'You command respect in the cosmos. Junior cadets look up to you.',
    featured: true,
    delay: '0.3s',
  },
  {
    emoji: '🌌',
    range: '1200+ SD',
    title: 'COSMIC\nEXPLORER',
    desc: 'Legendary status. You\'ve mapped the furthest reaches of the known galaxy.',
    featured: false,
    delay: '0.45s',
  },
]

function RanksSection() {
  return (
    <section className="section" id="ranks" style={{ background: 'rgba(138,43,226,0.03)' }}>
      <div className="pixel-divider" />
      <div style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 60 }}>
        <div className="section-label reveal">ASTRONAUT RANKS</div>
        <h2 className="section-title reveal">
          EARN <span className="accent">STARDUST</span>.{' '}
          CLAIM YOUR <span className="accent-cyan">RANK</span>.
        </h2>
        <p className="section-desc reveal">
          Every correct answer, every completed mission, every maintained streak earns Stardust.
          Ascend through four ranks — and prove you belong among the stars.
        </p>

        <div className="ranks-grid">
          {RANKS.map((r, i) => (
            <div
              className={`rank-card reveal ${r.featured ? 'featured' : ''}`}
              key={i}
              style={{ animationDelay: r.delay }}
            >
              {r.featured && <div className="rank-corner" />}
              <div className="pixel-corner pixel-corner-tl" />
              <div className="pixel-corner pixel-corner-br" />
              <span className="rank-badge-emoji">{r.emoji}</span>
              <span className="rank-range">{r.range}</span>
              <h3 className="rank-title" style={{ whiteSpace: 'pre-line' }}>{r.title}</h3>
              <p className="rank-desc">{r.desc}</p>
              {r.featured && (
                <div style={{
                  marginTop: 14,
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 8,
                  color: 'var(--gold)',
                  letterSpacing: 2,
                  animation: 'glowPulseGold 2s ease-in-out infinite',
                }}>
                  ★ MOST SOUGHT AFTER
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stardust formula */}
        <div className="reveal" style={{
          marginTop: 48,
          padding: '28px 32px',
          background: 'rgba(13, 20, 34, 0.8)',
          border: '2px solid rgba(0,240,255,0.15)',
          maxWidth: 600,
          margin: '48px auto 0',
          textAlign: 'center',
          position: 'relative',
        }}>
          <div className="pixel-corner pixel-corner-tl" />
          <div className="pixel-corner pixel-corner-tr" />
          <div className="pixel-corner pixel-corner-bl" />
          <div className="pixel-corner pixel-corner-br" />
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: 'var(--grey)', marginBottom: 12, letterSpacing: 2 }}>
            LEVEL FORMULA
          </div>
          <div style={{ fontFamily: 'var(--font-code)', fontSize: 16, color: 'var(--cyan)' }}>
            Level = ⌊ Stardust / 300 ⌋ + 1
          </div>
          <div style={{ fontFamily: 'var(--font-code)', fontSize: 12, color: 'var(--grey)', marginTop: 10 }}>
            +100 Stardust per correct answer · +100 per completed stage
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   CTA SECTION
───────────────────────────────────────── */
function CTASection() {
  return (
    <section className="cta-section">
      <div className="particles-container">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${10 + i * 11}%`,
            bottom: '20%',
            animationDuration: `${3 + i * 0.5}s`,
            animationDelay: `${-i * 0.4}s`,
            background: ['var(--cyan)', 'var(--gold)', 'var(--magenta)', 'var(--purple)'][i % 4],
          }} />
        ))}
      </div>

      <div className="cta-coin-text">[ INSERT COIN TO CONTINUE ]</div>

      <h2 className="cta-title reveal">
        READY TO{' '}
        <span className="accent-cyan">LAUNCH</span>
        <br />
        YOUR ORBIT?
      </h2>

      <p className="cta-desc reveal">
        Join thousands of space cadets already earning Stardust, unlocking badges,
        and conquering the cosmos — one mission at a time.
      </p>

      <div className="reveal" style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button className="btn-pixel btn-pixel-primary btn-lg">
          <span>🚀</span>
          <span className="btn-blink-label">[ PRESS START TO LAUNCH ]</span>
        </button>
        <button className="btn-pixel btn-pixel-outline">
          VIEW LEADERBOARD
        </button>
      </div>

      <div className="cta-badge-row reveal">
        {[
          { icon: '🔥', text: 'Daily Orbit Streaks' },
          { icon: '⭐', text: 'Infinite Stardust' },
          { icon: '🎖️', text: 'Telemetry Badges' },
          { icon: '📡', text: 'AI-Powered Missions' },
        ].map((b, i) => (
          <div className="cta-badge" key={i}>
            <span className="cta-badge-icon">{b.icon}</span>
            <span>{b.text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   FOOTER
───────────────────────────────────────── */
function Footer() {
  return (
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
  )
}

/* ─────────────────────────────────────────
   LANDING PAGE (ROOT)
───────────────────────────────────────── */
export default function LandingPage() {
  useReveal()
  const stardust = useStardust()

  return (
    <>
      <Navbar stardust={stardust} />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <GameModesSection />
      <RanksSection />
      <CTASection />
      <Footer />
    </>
  )
}
