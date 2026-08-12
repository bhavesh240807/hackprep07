import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

/* ── Level config matching the Notes page ── */
const LEVEL_CONFIG = {
  cadet: { label: 'CADET', color: '#00FF41', icon: '🟢', desc: 'BEGINNER' },
  pilot: { label: 'PILOT', color: '#FFD700', icon: '🟡', desc: 'INTERMEDIATE' },
  commander: { label: 'COMMANDER', color: '#FF007F', icon: '🔴', desc: 'ADVANCED' },
}

export default function QuizPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [topic] = useState(searchParams.get('topic') || 'Space')
  const [activeLevel, setActiveLevel] = useState('cadet')
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState([])
  const [showResults, setShowResults] = useState(false)

  const levelCfg = LEVEL_CONFIG[activeLevel]

  const fetchQuiz = async (selectedTopic, levelKey) => {
    setLoading(true)
    setError(null)
    try {
      // Pass the difficulty level to the backend
      const response = await fetch('http://localhost:5000/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: selectedTopic, level: levelKey })
      })
      
      if (!response.ok) throw new Error('Failed to connect to Mission Control')

      const result = await response.json()
      setData(result)
      setCurrentQuestionIndex(0)
      setSelectedAnswers(new Array(result.quiz.length).fill(null))
      setShowResults(false)
    } catch (err) {
      setError(err.message || 'Failed to fetch mission data')
    } finally {
      setLoading(false)
    }
  } // <-- Removed the extra closing brace that was right here

  // Refetch when difficulty tab changes
  useEffect(() => {
    fetchQuiz(topic, activeLevel)
  }, [topic, activeLevel])

  const handleAnswerSelect = (optionIndex) => {
    if (!showResults) {
      const newAnswers = [...selectedAnswers]
      newAnswers[currentQuestionIndex] = optionIndex
      setSelectedAnswers(newAnswers)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < data.quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      setShowResults(true)
    }
  }

  const calculateScore = () => {
    let correct = 0
    data.quiz.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctIndex) correct++
    })
    return { correct, total: data.quiz.length, percentage: Math.round((correct / data.quiz.length) * 100) }
  }

  if (loading) return (
    <div className="quiz-page">
      <div className="loading-screen">
        <div className="module-detail-icon">🛰️</div>
        <div>CALIBRATING {levelCfg.label} MISSION...</div>
      </div>
    </div>
  )
  
  if (error) return (
    <div className="quiz-page">
      <div className="error-screen">
        <div className="error-title">⚠️ TRANSMISSION ERROR</div>
        <div className="error-message">{error}</div>
        <button className="btn-pixel btn-pixel-primary" onClick={() => navigate('/')}>RETURN TO LAUNCH</button>
      </div>
    </div>
  )
  
  if (!data) return null

  const score = showResults ? calculateScore() : null
  const currentQuestion = data.quiz[currentQuestionIndex]
  const isAnswered = selectedAnswers[currentQuestionIndex] !== null
  const safeOptions = currentQuestion.options || currentQuestion.choices || [] 

  // Calculate difficulty out of 3 for the sidebar bars
  const difficultyInt = activeLevel === 'cadet' ? 1 : activeLevel === 'pilot' ? 2 : 3

  return (
    <div className="quiz-page">
      {/* Reusing your `.module-detail` structural classes from index.css */}
      <div className="module-detail" style={{ maxWidth: 1200, margin: '40px auto' }}>
        
        {/* Header */}
        <div className="module-detail-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            <span>◀</span> ABORT MISSION
          </button>
          <div className="module-detail-title-row">
            <span className="module-detail-icon">📡</span>
            <div>
              <div className="module-detail-sector" style={{ color: levelCfg.color }}>ACTIVE TOPIC {data.isFallback ? '• (OFFLINE SIMULATION)' : ''}</div>
              <h2 className="module-detail-name">{data.topic}</h2>
            </div>
          </div>
        </div>

        {/* Level Tabs */}
        <div className="level-tabs">
          {Object.entries(LEVEL_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              disabled={showResults}
              className={`level-tab ${activeLevel === key ? 'active' : ''}`}
              style={{
                '--tab-color': cfg.color,
                borderColor: activeLevel === key ? cfg.color : 'rgba(255,255,255,0.1)',
                color: activeLevel === key ? cfg.color : 'var(--grey)',
                opacity: showResults && activeLevel !== key ? 0.3 : 1
              }}
              onClick={() => setActiveLevel(key)}
            >
              <span className="level-tab-icon">{cfg.icon}</span>
              <span className="level-tab-label">{cfg.label}</span>
              <span className="level-tab-desc">{cfg.desc}</span>
            </button>
          ))}
        </div>

        <div className="scanline-sweep" style={{ position: 'absolute' }} />

        {/* Content Layout (Main + Sidebar) */}
        <div className="module-detail-content">
          
          {/* Main Question Area (Reusing notes-section style) */}
          <div className="notes-section" style={{ minHeight: '500px' }}>
            {!showResults ? (
              <>
                <div className="notes-section-header">
                  <span className="notes-section-label" style={{ color: levelCfg.color }}>
                    ▸ MISSION FEED — {levelCfg.label} LEVEL
                  </span>
                  <span className="notes-count">Q {currentQuestionIndex + 1} / {data.quiz.length}</span>
                </div>

                <div className="question-text" style={{ fontSize: '20px', color: 'var(--white)', marginBottom: '32px', lineHeight: '1.6' }}>
                  {currentQuestion.question}
                </div>

                <div className="options-grid">
                  {safeOptions.map((option, index) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === index
                    const isCorrect = index === currentQuestion.correctIndex
                    
                    // Style logic: If answered, highlight the correct option green. 
                    // If they picked wrong, highlight their choice red.
                    let borderColor = 'rgba(0, 240, 255, 0.08)'
                    let textColor = 'var(--white)'
                    let iconBg = 'transparent'
                    let iconColor = levelCfg.color

                    if (isAnswered) {
                      if (isCorrect) {
                        borderColor = '#27c93f'
                        textColor = '#27c93f'
                        iconBg = '#27c93f'
                        iconColor = 'var(--void)'
                      } else if (isSelected) {
                        borderColor = '#ff6b6b'
                        textColor = '#ff6b6b'
                        iconBg = '#ff6b6b'
                        iconColor = 'var(--void)'
                      }
                    } else if (isSelected) {
                      borderColor = levelCfg.color
                      iconBg = levelCfg.color
                      iconColor = 'var(--void)'
                      textColor = 'var(--cyan)'
                    }
                    
                    return (
                      <button
                        key={index}
                        className={`note-item option-button`}
                        onClick={() => handleAnswerSelect(index)}
                        style={{
                          cursor: isAnswered ? 'default' : 'pointer',
                          borderColor: borderColor,
                          transition: 'all 0.3s'
                        }}
                        disabled={isAnswered}
                      >
                        <div className="note-item-index" style={{ color: iconColor, background: iconBg, padding: '0 8px', borderRadius: '2px' }}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <p className="note-item-text" style={{ color: textColor, flex: 1, textAlign: 'left', margin: 0, fontWeight: isAnswered && isCorrect ? 'bold' : 'normal' }}>
                          {option}
                        </p>
                      </button>
                    )
                  })}
                </div>

                {isAnswered && (
                  <div className="fun-fact-callout reveal" style={{ marginTop: '24px', borderColor: selectedAnswers[currentQuestionIndex] === currentQuestion.correctIndex ? '#27c93f' : '#ff6b6b', background: 'rgba(0,0,0,0.3)' }}>
                    <div className="fun-fact-header">
                      <span className="fun-fact-icon">{selectedAnswers[currentQuestionIndex] === currentQuestion.correctIndex ? '✅' : '❌'}</span>
                      <span className="fun-fact-label" style={{ color: selectedAnswers[currentQuestionIndex] === currentQuestion.correctIndex ? '#27c93f' : '#ff6b6b' }}>
                        TELEMETRY FEEDBACK
                      </span>
                    </div>
                    
                    {/* Explicitly show the correct answer text if they got it wrong */}
                    {selectedAnswers[currentQuestionIndex] !== currentQuestion.correctIndex && (
                      <p style={{ color: '#ff6b6b', marginBottom: '12px', fontFamily: 'var(--font-code)', fontSize: '13px', fontWeight: 'bold' }}>
                        Correct Coordinate: {String.fromCharCode(65 + currentQuestion.correctIndex)} - {safeOptions[currentQuestion.correctIndex]}
                      </p>
                    )}
                    
                    <p className="fun-fact-text" style={{ color: 'var(--white)' }}>{currentQuestion.explanation}</p>
                  </div>
                )}

                <div className="quiz-buttons" style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                  <button className="btn-pixel btn-pixel-secondary" onClick={() => setCurrentQuestionIndex(prev => prev - 1)} disabled={currentQuestionIndex === 0} style={{ borderColor: levelCfg.color, color: levelCfg.color }}>
                    ← PREVIOUS
                  </button>
                  <button className={`btn-pixel btn-pixel-primary ${!isAnswered ? 'disabled' : ''}`} onClick={handleNextQuestion} disabled={!isAnswered} style={{ background: levelCfg.color, borderColor: levelCfg.color }}>
                    {currentQuestionIndex === data.quiz.length - 1 ? 'SUBMIT MISSION' : 'NEXT QUESTION →'}
                  </button>
                </div>
              </>
            ) : (
              /* Results Screen */
              <div className="results-screen reveal" style={{ textAlign: 'center', paddingTop: '40px' }}>
                <div className="results-title" style={{ fontFamily: 'var(--font-pixel)', fontSize: '28px', color: levelCfg.color, textShadow: `0 0 15px ${levelCfg.color}`, marginBottom: '30px' }}>
                  🏆 MISSION COMPLETE!
                </div>
                
                <div className="results-score" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${levelCfg.color}`, padding: '40px', marginBottom: '40px' }}>
                  <div className="score-big" style={{ fontFamily: 'var(--font-code)', fontSize: '72px', color: levelCfg.color, fontWeight: 'bold' }}>
                    {score.percentage}%
                  </div>
                  <div className="score-detail" style={{ fontFamily: 'var(--font-code)', fontSize: '16px', color: 'var(--white)', marginTop: '10px' }}>
                    {score.correct} / {score.total} CORRECT ON {levelCfg.label}
                  </div>
                </div>

                <div className="results-buttons" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                  <button className="btn-pixel btn-pixel-secondary" onClick={() => fetchQuiz(topic, activeLevel)} style={{ borderColor: levelCfg.color, color: levelCfg.color }}>
                    🔄 RETRY MISSION
                  </button>
                  <button className="btn-pixel btn-pixel-primary" onClick={() => navigate('/modules')} style={{ background: levelCfg.color, borderColor: levelCfg.color }}>
                    🚀 SELECT NEW SECTOR
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="notes-sidebar">
            
            {/* Progress / Status Box */}
            <div className="key-facts-box reveal">
              <div className="key-facts-header">
                <span>📊</span> MISSION STATUS
              </div>
              <div className="progress-bar-container" style={{ margin: '16px 0' }}>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ height: '100%', width: `${((currentQuestionIndex + (!showResults && isAnswered ? 1 : 0)) / data.quiz.length) * 100}%`, background: levelCfg.color, transition: 'width 0.3s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontFamily: 'var(--font-code)', fontSize: '10px', color: 'var(--grey)' }}>
                  <span>START</span>
                  <span>{Math.round((currentQuestionIndex / data.quiz.length) * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Difficulty indicator reused from ModulesPage */}
            <div className="difficulty-indicator reveal">
              <div className="difficulty-label">DIFFICULTY LEVEL</div>
              <div className="difficulty-bars">
                {[1, 2, 3].map(d => (
                  <div
                    key={d}
                    className={`difficulty-bar ${d <= difficultyInt ? 'active' : ''}`}
                    style={{
                      background: d <= difficultyInt ? levelCfg.color : 'rgba(255,255,255,0.08)',
                      boxShadow: d <= difficultyInt ? `0 0 8px ${levelCfg.color}55` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Quick Briefing */}
            <div className="quiz-preview-box reveal" style={{ flex: 1 }}>
              <div className="quiz-preview-header">
                <span>🧠</span> BRIEFING NOTES
              </div>
              <p style={{ fontFamily: 'var(--font-code)', fontSize: '12px', color: 'rgba(232,232,255,0.6)', lineHeight: '1.8' }}>
                {data.explainer}
              </p>
            </div>
            
          </div>
        </div>
      </div>

      {/* Specific Quiz Utility Styles */}
      <style>{`
        .quiz-page {
          min-height: 100vh;
          padding: 40px 20px;
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(138, 43, 226, 0.03) 100%);
        }
        .loading-screen, .error-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          font-family: var(--font-code);
          color: var(--cyan);
          text-align: center;
          gap: 24px;
        }
        .option-button:hover:not(:disabled) {
          border-left-color: var(--cyan) !important;
          background: rgba(13, 20, 34, 0.95);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), -3px 0 0 rgba(0, 240, 255, 0.3);
          transform: translateX(4px);
        }
        .option-button.correct {
          background: rgba(39, 201, 63, 0.05);
        }
        .option-button.incorrect {
          background: rgba(255, 107, 107, 0.05);
        }
        .option-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}