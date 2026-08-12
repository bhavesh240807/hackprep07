import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { QUIZ_DATA, LEVEL_ORDER, LEVEL_CONFIG } from '../data/quizData'

/* ── LocalStorage helpers ── */
function getStardust() {
  return parseInt(localStorage.getItem('astroquest_stardust') || '0', 10)
}
function addStardust(amount) {
  const current = getStardust()
  localStorage.setItem('astroquest_stardust', String(current + amount))
  return current + amount
}
function getCompletedLevels(moduleId) {
  try {
    return JSON.parse(localStorage.getItem(`completed_${moduleId}`) || '[]')
  } catch { return [] }
}
function markLevelComplete(moduleId, level) {
  const done = getCompletedLevels(moduleId)
  if (!done.includes(level)) {
    localStorage.setItem(`completed_${moduleId}`, JSON.stringify([...done, level]))
  }
}

/* ── XP Float Particle ── */
function XPFloat({ amount, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div style={{
      position: 'fixed',
      top: '30%',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      fontFamily: 'var(--font-pixel)',
      fontSize: 22,
      color: 'var(--gold)',
      textShadow: '0 0 20px var(--gold)',
      animation: 'xpFloatUp 1.5s ease forwards',
      pointerEvents: 'none',
    }}>
      +{amount} ⭐ SD
    </div>
  )
}

/* ── Progress Ring ── */
function ProgressRing({ current, total, color }) {
  const r = 28, cx = 34, cy = 34
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference - (current / total) * circumference

  return (
    <svg width="68" height="68" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="square"
        style={{ transition: 'stroke-dashoffset 0.5s ease', filter: `drop-shadow(0 0 4px ${color})` }}
      />
      <text
        x={cx} y={cy + 1}
        textAnchor="middle" dominantBaseline="middle"
        fill="white"
        style={{ fontFamily: 'var(--font-pixel)', fontSize: 13, transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy}px` }}
      >
        {current}/{total}
      </text>
    </svg>
  )
}

/* ── Level Selector ── */
function LevelSelector({ moduleId, onSelect }) {
  const completed = getCompletedLevels(moduleId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 520 }}>
      <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: 'var(--cyan)', letterSpacing: 3, marginBottom: 8, textAlign: 'center' }}>
        SELECT DIFFICULTY
      </div>
      {LEVEL_ORDER.map((level, idx) => {
        const cfg = LEVEL_CONFIG[level]
        const isCompleted = completed.includes(level)
        const isLocked = idx > 0 && !completed.includes(LEVEL_ORDER[idx - 1])

        return (
          <button
            key={level}
            disabled={isLocked}
            onClick={() => !isLocked && onSelect(level)}
            style={{
              background: isLocked
                ? 'rgba(255,255,255,0.02)'
                : `rgba(${hexToRgb(cfg.color)}, 0.06)`,
              border: `2px solid ${isLocked ? 'rgba(255,255,255,0.08)' : cfg.color}`,
              borderRadius: 0,
              padding: '18px 24px',
              cursor: isLocked ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              transition: 'all 0.2s',
              opacity: isLocked ? 0.4 : 1,
              fontFamily: 'var(--font-pixel)',
              boxShadow: isLocked ? 'none' : `0 0 12px ${cfg.color}22`,
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => { if (!isLocked) e.currentTarget.style.transform = 'translateX(6px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)' }}
          >
            {/* Top accent bar */}
            {!isLocked && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
              }} />
            )}

            <span style={{ fontSize: 28 }}>{cfg.icon}</span>

            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{
                fontSize: 14, color: isLocked ? 'var(--grey)' : cfg.color,
                letterSpacing: 2, marginBottom: 4,
                textShadow: isLocked ? 'none' : `0 0 8px ${cfg.color}`,
              }}>
                {cfg.label}
              </div>
              <div style={{ fontSize: 9, color: 'var(--grey)', letterSpacing: 2 }}>
                {cfg.desc} · 10 QUESTIONS · {cfg.xpLabel} PER CORRECT
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              {isCompleted && (
                <div style={{ fontSize: 11, color: '#00FF41', letterSpacing: 1 }}>✓ CLEARED</div>
              )}
              {isLocked && (
                <div style={{ fontSize: 9, color: 'var(--grey)', letterSpacing: 1 }}>
                  🔒 {cfg.lockMsg}
                </div>
              )}
              {!isLocked && !isCompleted && (
                <div style={{ fontSize: 10, color: cfg.color }}>▸ LAUNCH</div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

/* helper */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

/* ── Result Screen ── */
function ResultScreen({ score, total, level, moduleId, moduleColor, onRetry, onNextLevel, onExit, xpEarned }) {
  const cfg = LEVEL_CONFIG[level]
  const pct = Math.round((score / total) * 100)
  const nextLevelIdx = LEVEL_ORDER.indexOf(level) + 1
  const hasNextLevel = nextLevelIdx < LEVEL_ORDER.length
  const nextLevel = hasNextLevel ? LEVEL_ORDER[nextLevelIdx] : null
  const isPerfect = score === total

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '70vh', gap: 32, padding: 40,
      animation: 'fadeInUp 0.5s ease',
    }}>
      {/* Result Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16, animation: 'floatY 3s ease-in-out infinite' }}>
          {pct === 100 ? '🏆' : pct >= 70 ? '🎖️' : pct >= 40 ? '⭐' : '💀'}
        </div>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 18,
          color: pct >= 70 ? '#00FF41' : pct >= 40 ? '#FFD700' : '#FF007F',
          textShadow: `0 0 15px ${pct >= 70 ? '#00FF41' : pct >= 40 ? '#FFD700' : '#FF007F'}`,
          marginBottom: 8,
          letterSpacing: 2,
        }}>
          {pct === 100 ? 'PERFECT MISSION!' : pct >= 70 ? 'MISSION SUCCESS' : pct >= 40 ? 'PARTIAL SUCCESS' : 'MISSION FAILED'}
        </div>
        <div style={{ fontFamily: 'var(--font-code)', fontSize: 14, color: 'var(--grey)' }}>
          {cfg.label} Level · {moduleId.replace('-', ' ').toUpperCase()}
        </div>
      </div>

      {/* Score Card */}
      <div style={{
        background: 'rgba(13,20,34,0.9)',
        border: `2px solid ${cfg.color}`,
        boxShadow: `0 0 30px ${cfg.color}33`,
        padding: '32px 48px',
        textAlign: 'center',
        position: 'relative',
        minWidth: 320,
      }}>
        <div className="pixel-corner pixel-corner-tl" style={{ borderColor: cfg.color }} />
        <div className="pixel-corner pixel-corner-tr" style={{ borderColor: cfg.color }} />
        <div className="pixel-corner pixel-corner-bl" style={{ borderColor: cfg.color }} />
        <div className="pixel-corner pixel-corner-br" style={{ borderColor: cfg.color }} />

        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 11, color: 'var(--grey)', letterSpacing: 2, marginBottom: 12 }}>
          MISSION REPORT
        </div>

        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 36, color: cfg.color, textShadow: `0 0 15px ${cfg.color}` }}>
              {score}/{total}
            </div>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--grey)', letterSpacing: 2 }}>CORRECT</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 36, color: 'var(--gold)', textShadow: '0 0 15px var(--gold)' }}>
              +{xpEarned}
            </div>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--grey)', letterSpacing: 2 }}>STARDUST</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 36, color: 'var(--white)' }}>
              {pct}%
            </div>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--grey)', letterSpacing: 2 }}>ACCURACY</div>
          </div>
        </div>

        {/* XP bar */}
        <div style={{ background: 'rgba(255,255,255,0.06)', height: 8, width: '100%' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${cfg.color}, #00F0FF)`,
            boxShadow: `0 0 8px ${cfg.color}`,
            transition: 'width 1s ease',
          }} />
        </div>

        {isPerfect && (
          <div style={{
            marginTop: 16, fontFamily: 'var(--font-pixel)', fontSize: 9,
            color: '#FFD700', letterSpacing: 2, animation: 'blink 1s step-end infinite',
          }}>
            ★ PERFECT CLEAR — BONUS UNLOCKED ★
          </div>
        )}
      </div>

      {/* Total stardust */}
      <div style={{
        fontFamily: 'var(--font-code)', fontSize: 13, color: 'var(--grey)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        Total Stardust: <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-pixel)', fontSize: 14 }}>
          ⭐ {getStardust()}
        </span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn-pixel btn-pixel-secondary" onClick={onRetry}>
          ↺ RETRY LEVEL
        </button>
        {hasNextLevel && pct >= 60 && (
          <button className="btn-pixel btn-pixel-primary" onClick={onNextLevel}>
            🚀 NEXT: {LEVEL_CONFIG[nextLevel].label}
          </button>
        )}
        <button className="btn-pixel btn-pixel-outline" onClick={onExit}>
          ◀ BACK TO SECTORS
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   QUIZ ENGINE (main component)
───────────────────────────────────────── */
export default function QuizPage({ module, onClose }) {
  const cfg_level = LEVEL_CONFIG
  const [phase, setPhase] = useState('select') // 'select' | 'quiz' | 'result'
  const [level, setLevel] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [showXP, setShowXP] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [answers, setAnswers] = useState([]) // track per-question results

  const moduleQuiz = QUIZ_DATA[module.id] || QUIZ_DATA['solar-system']

  function startLevel(lvl) {
    const qs = moduleQuiz[lvl] || []
    setLevel(lvl)
    setQuestions(qs)
    setCurrentQ(0)
    setSelected(null)
    setAnswered(false)
    setScore(0)
    setXpEarned(0)
    setAnswers([])
    setPhase('quiz')
  }

  function handleSelect(optIdx) {
    if (answered) return
    setSelected(optIdx)
    setAnswered(true)

    const q = questions[currentQ]
    const isCorrect = optIdx === q.answer

    if (isCorrect) {
      const earned = q.xp
      const newTotal = addStardust(earned)
      setScore(s => s + 1)
      setXpEarned(x => x + earned)
      setShowXP(earned)
    }

    setAnswers(prev => [...prev, { correct: isCorrect, selected: optIdx }])
  }

  function handleNext() {
    setShowXP(null)
    if (currentQ + 1 >= questions.length) {
      // Level complete
      markLevelComplete(module.id, level)
      setPhase('result')
    } else {
      setCurrentQ(q => q + 1)
      setSelected(null)
      setAnswered(false)
      setShowExplanation(false)
    }
  }

  function handleNextLevel() {
    const nextIdx = LEVEL_ORDER.indexOf(level) + 1
    if (nextIdx < LEVEL_ORDER.length) {
      startLevel(LEVEL_ORDER[nextIdx])
    }
  }

  const levelCfg = level ? cfg_level[level] : null
  const q = questions[currentQ]

  // ── SELECT PHASE ──
  if (phase === 'select') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 32, padding: '40px 24px', animation: 'fadeInUp 0.4s ease',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{module.icon}</div>
          <div style={{
            fontFamily: 'var(--font-pixel)', fontSize: 14,
            color: module.color, textShadow: `0 0 10px ${module.color}`,
            letterSpacing: 3, marginBottom: 6,
          }}>
            {module.sector}
          </div>
          <h2 style={{
            fontFamily: 'var(--font-pixel)', fontSize: 18, color: 'var(--white)',
            letterSpacing: 1, marginBottom: 8,
          }}>
            {module.name}
          </h2>
          <p style={{ fontFamily: 'var(--font-code)', fontSize: 13, color: 'var(--grey)', maxWidth: 440 }}>
            10 questions per difficulty. Earn Stardust for each correct answer.
            Complete lower difficulties to unlock higher ones.
          </p>
        </div>

        {/* Stardust Display */}
        <div style={{
          fontFamily: 'var(--font-pixel)', fontSize: 11, color: 'var(--gold)',
          textShadow: 'var(--glow-gold)', padding: '8px 20px',
          border: '1px solid rgba(255,215,0,0.3)',
          background: 'rgba(255,215,0,0.05)',
          letterSpacing: 2,
        }}>
          ⭐ {getStardust()} STARDUST
        </div>

        <LevelSelector moduleId={module.id} onSelect={startLevel} />

        <button className="btn-pixel btn-pixel-secondary" onClick={onClose} style={{ marginTop: 8 }}>
          ◀ BACK TO SECTORS
        </button>
      </div>
    )
  }

  // ── RESULT PHASE ──
  if (phase === 'result') {
    return (
      <ResultScreen
        score={score}
        total={questions.length}
        level={level}
        moduleId={module.id}
        moduleColor={module.color}
        xpEarned={xpEarned}
        onRetry={() => startLevel(level)}
        onNextLevel={handleNextLevel}
        onExit={onClose}
      />
    )
  }

  // ── QUIZ PHASE ──
  const optionLetters = ['A', 'B', 'C', 'D']
  const isCorrect = answered && selected === q.answer
  const isWrong = answered && selected !== q.answer

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 0,
      animation: 'fadeInUp 0.3s ease',
      minHeight: '80vh',
    }}>
      {/* XP Float */}
      {showXP && <XPFloat amount={showXP} onDone={() => setShowXP(null)} />}

      {/* Quiz Header */}
      <div style={{
        padding: '20px 28px',
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>{module.icon}</span>
          <div>
            <div style={{
              fontFamily: 'var(--font-pixel)', fontSize: 10,
              color: levelCfg.color, letterSpacing: 2,
              textShadow: `0 0 8px ${levelCfg.color}`,
            }}>
              {levelCfg.icon} {levelCfg.label}
            </div>
            <div style={{ fontFamily: 'var(--font-code)', fontSize: 11, color: 'var(--grey)' }}>
              {module.name}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Stardust */}
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: 'var(--gold)', letterSpacing: 1 }}>
            +{xpEarned} ⭐
          </div>
          {/* Score */}
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, color: '#00FF41' }}>
            {score}/{currentQ + (answered ? 1 : 0)} ✓
          </div>
          {/* Progress ring */}
          <ProgressRing current={currentQ + 1} total={questions.length} color={levelCfg.color} />
        </div>
      </div>

      {/* Question progress dots */}
      <div style={{
        display: 'flex', gap: 6, padding: '12px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(0,0,0,0.1)',
      }}>
        {questions.map((_, i) => {
          let dotColor = 'rgba(255,255,255,0.1)'
          if (i < answers.length) dotColor = answers[i].correct ? '#00FF41' : '#FF007F'
          else if (i === currentQ) dotColor = levelCfg.color
          return (
            <div key={i} style={{
              width: i === currentQ ? 20 : 8,
              height: 8,
              background: dotColor,
              boxShadow: i === currentQ ? `0 0 8px ${levelCfg.color}` : 'none',
              transition: 'all 0.3s ease',
              flexShrink: 0,
            }} />
          )
        })}
      </div>

      {/* Question Area */}
      <div style={{ flex: 1, padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Question number + text */}
        <div>
          <div style={{
            fontFamily: 'var(--font-pixel)', fontSize: 9,
            color: levelCfg.color, letterSpacing: 3, marginBottom: 12,
          }}>
            QUESTION {currentQ + 1} OF {questions.length}
          </div>
          <h3 style={{
            fontFamily: 'var(--font-code)', fontSize: 18, fontWeight: 600,
            color: 'var(--white)', lineHeight: 1.7,
          }}>
            {q.question}
          </h3>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {q.options.map((opt, idx) => {
            let borderColor = 'rgba(255,255,255,0.08)'
            let bg = 'rgba(255,255,255,0.02)'
            let textColor = 'var(--white)'
            let shadow = 'none'
            let icon = optionLetters[idx]

            if (answered) {
              if (idx === q.answer) {
                borderColor = '#00FF41'; bg = 'rgba(0,255,65,0.1)'
                shadow = '0 0 20px rgba(0,255,65,0.2)'; icon = '✓'
              } else if (idx === selected && idx !== q.answer) {
                borderColor = '#FF007F'; bg = 'rgba(255,0,127,0.1)'
                shadow = '0 0 20px rgba(255,0,127,0.2)'; icon = '✗'
                textColor = 'var(--magenta)'
              } else {
                textColor = 'var(--grey)'
              }
            }

            return (
              <button
                key={idx}
                disabled={answered}
                onClick={() => handleSelect(idx)}
                style={{
                  background: bg,
                  border: `2px solid ${borderColor}`,
                  borderRadius: 0,
                  padding: '14px 20px',
                  display: 'flex', alignItems: 'center', gap: 16,
                  cursor: answered ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: shadow,
                  fontFamily: 'var(--font-code)',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  if (!answered) {
                    e.currentTarget.style.borderColor = levelCfg.color
                    e.currentTarget.style.background = `rgba(${hexToRgb(levelCfg.color)}, 0.08)`
                    e.currentTarget.style.transform = 'translateX(6px)'
                  }
                }}
                onMouseLeave={e => {
                  if (!answered) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-pixel)', fontSize: 11,
                  color: answered && idx === q.answer ? '#00FF41'
                    : answered && idx === selected ? '#FF007F'
                    : levelCfg.color,
                  minWidth: 24, textAlign: 'center',
                }}>
                  {icon}
                </span>
                <span style={{ color: textColor, fontSize: 15, lineHeight: 1.5 }}>{opt}</span>
              </button>
            )
          })}
        </div>

        {/* Feedback + Explanation */}
        {answered && (
          <div style={{ animation: 'fadeInUp 0.3s ease' }}>
            {/* Feedback bar */}
            <div style={{
              padding: '12px 20px',
              background: isCorrect ? 'rgba(0,255,65,0.08)' : 'rgba(255,0,127,0.08)',
              border: `1px solid ${isCorrect ? '#00FF41' : '#FF007F'}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <div style={{
                fontFamily: 'var(--font-pixel)', fontSize: 11,
                color: isCorrect ? '#00FF41' : '#FF007F',
                letterSpacing: 2,
              }}>
                {isCorrect ? `✓ CORRECT! +${q.xp} STARDUST` : '✗ INCORRECT'}
              </div>
              {q.explanation && (
                <button
                  onClick={() => setShowExplanation(e => !e)}
                  style={{
                    background: 'transparent', border: 'none',
                    fontFamily: 'var(--font-code)', fontSize: 12,
                    color: 'var(--cyan)', cursor: 'pointer', letterSpacing: 1,
                  }}
                >
                  {showExplanation ? '▲ HIDE' : '▼ WHY?'}
                </button>
              )}
            </div>

            {/* Explanation */}
            {showExplanation && q.explanation && (
              <div style={{
                padding: '16px 20px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(0,240,255,0.15)',
                fontFamily: 'var(--font-code)', fontSize: 13,
                color: 'var(--text-secondary)', lineHeight: 1.8,
                animation: 'fadeInUp 0.3s ease',
                marginBottom: 12,
              }}>
                <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>TELEMETRY: </span>
                {q.explanation}
              </div>
            )}

            {/* Next button */}
            <button
              className="btn-pixel btn-pixel-primary"
              onClick={handleNext}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {currentQ + 1 >= questions.length ? '▸ VIEW RESULTS' : '▸ NEXT QUESTION'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

