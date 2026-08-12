import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function QuizPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [topic] = useState(searchParams.get('topic') || 'Space')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState([])
  const [showResults, setShowResults] = useState(false)

  console.log('🎯 QuizPage mounted, topic:', searchParams.get('topic'), 'or default: Space')

  const fetchQuiz = async (selectedTopic) => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching quiz for topic:', selectedTopic)
      const response = await fetch('http://localhost:5000/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: selectedTopic })
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const result = await response.json()
      console.log('Quiz data received:', result)
      setData(result)
      setCurrentQuestionIndex(0)
      setSelectedAnswers(new Array(result.quiz.length).fill(null))
      setShowResults(false)
    } catch (err) {
      console.error('Error fetching quiz:', err)
      setError(err.message || 'Failed to fetch quiz')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('📋 useEffect hook triggered, calling fetchQuiz with topic:', topic)
    fetchQuiz(topic)
  }, [])

  const handleAnswerSelect = (optionIndex) => {
    if (!showResults) {
      const newAnswers = [...selectedAnswers]
      newAnswers[currentQuestionIndex] = optionIndex
      setSelectedAnswers(newAnswers)
    }
  }

  const handleNextQuestion = () => {
    if (selectedAnswers[currentQuestionIndex] !== null) {
      if (currentQuestionIndex < data.quiz.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        setShowResults(true)
      }
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const calculateScore = () => {
    let correct = 0
    data.quiz.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctIndex) {
        correct++
      }
    })
    return { correct, total: data.quiz.length, percentage: Math.round((correct / data.quiz.length) * 100) }
  }

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="loading-screen">⏳ GENERATING MISSION...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="quiz-page">
        <div className="error-screen">
          <div className="error-title">⚠️ TRANSMISSION ERROR</div>
          <div className="error-message">{error}</div>
          <button className="btn-pixel btn-pixel-primary" onClick={() => navigate('/')}>
            RETURN TO LAUNCH
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const score = showResults ? calculateScore() : null
  const currentQuestion = data.quiz[currentQuestionIndex]
  const isAnswered = selectedAnswers[currentQuestionIndex] !== null

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        {/* Header */}
        <div className="quiz-header">
          <button className="btn-back" onClick={() => navigate('/')}>
            ← ABORT MISSION
          </button>
          <h1>🎯 MISSION CONTROL</h1>
        </div>

        {/* Main Content */}
        {!showResults ? (
          <div className="quiz-content">
            {/* Progress Bar */}
            <div className="progress-section">
              <div className="progress-info">
                QUESTION {currentQuestionIndex + 1} / {data.quiz.length}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${((currentQuestionIndex + 1) / data.quiz.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="question-card">
              <div className="question-topic">
                📡 {data.topic}
              </div>
              <div className="question-text">
                {currentQuestion.question}
              </div>

              {/* Options */}
              <div className="options-grid">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === index
                  const isCorrect = index === currentQuestion.correctIndex
                  const showFeedback = showResults || isSelected
                  
                  return (
                    <button
                      key={index}
                      className={`option-button ${isSelected ? 'selected' : ''} ${
                        showFeedback && isCorrect ? 'correct' : ''
                      } ${showFeedback && isSelected && !isCorrect ? 'incorrect' : ''}`}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResults}
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="option-text">{option}</span>
                    </button>
                  )
                })}
              </div>

              {/* Explanation (shown after answer) */}
              {isAnswered && (
                <div className={`explanation ${selectedAnswers[currentQuestionIndex] === currentQuestion.correctIndex ? 'correct' : 'incorrect'}`}>
                  <strong>
                    {selectedAnswers[currentQuestionIndex] === currentQuestion.correctIndex ? '✓ CORRECT!' : '✗ INCORRECT'}
                  </strong>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="quiz-buttons">
              <button 
                className="btn-pixel btn-pixel-secondary"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                ← PREVIOUS
              </button>
              <button 
                className={`btn-pixel btn-pixel-primary ${!isAnswered ? 'disabled' : ''}`}
                onClick={handleNextQuestion}
                disabled={!isAnswered}
              >
                {currentQuestionIndex === data.quiz.length - 1 ? 'SUBMIT MISSION' : 'NEXT QUESTION →'}
              </button>
            </div>
          </div>
        ) : (
          /* Results Screen */
          <div className="results-screen">
            <div className="results-card">
              <div className="results-title">🏆 MISSION COMPLETE!</div>
              <div className="results-score">
                <div className="score-big">{score.percentage}%</div>
                <div className="score-detail">
                  {score.correct} / {score.total} CORRECT
                </div>
              </div>

              {/* Results breakdown */}
              <div className="results-questions">
                <h3>TELEMETRY REPORT</h3>
                {data.quiz.map((q, i) => {
                  const isCorrect = selectedAnswers[i] === q.correctIndex
                  return (
                    <div key={i} className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                      <span className="result-indicator">
                        {isCorrect ? '✓' : '✗'}
                      </span>
                      <span className="result-text">
                        {q.question.substring(0, 60)}...
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Action buttons */}
              <div className="results-buttons">
                <button 
                  className="btn-pixel btn-pixel-secondary"
                  onClick={() => fetchQuiz(topic)}
                >
                  🔄 RETRY MISSION
                </button>
                <button 
                  className="btn-pixel btn-pixel-primary"
                  onClick={() => navigate('/')}
                >
                  🚀 RETURN TO LAUNCH
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .quiz-page {
          min-height: 100vh;
          padding: 40px 20px;
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.05) 0%, rgba(138, 43, 226, 0.03) 100%);
        }

        .quiz-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .loading-screen,
        .error-screen {
          text-align: center;
          padding: 60px 20px;
          font-family: var(--font-code, 'Courier New', monospace);
          color: var(--cyan, #00f0ff);
          font-size: 24px;
          text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
        }

        .error-screen {
          color: #ff6b6b;
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }

        .error-title {
          font-size: 28px;
          margin-bottom: 10px;
        }

        .error-message {
          font-size: 14px;
          color: rgba(255, 107, 107, 0.8);
        }

        .quiz-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .quiz-header h1 {
          color: var(--cyan, #00f0ff);
          font-size: 32px;
          text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
          margin: 0;
          flex: 1;
          min-width: 200px;
        }

        .btn-back {
          padding: 10px 20px;
          background: rgba(138, 43, 226, 0.2);
          border: 2px solid var(--purple, #8a2be2);
          color: var(--purple, #8a2be2);
          font-family: var(--font-mono, 'Courier New', monospace);
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          transition: all 0.3s;
        }

        .btn-back:hover {
          background: var(--purple, #8a2be2);
          color: white;
          box-shadow: 0 0 10px rgba(138, 43, 226, 0.5);
        }

        .progress-section {
          margin-bottom: 30px;
        }

        .progress-info {
          font-family: var(--font-code, 'Courier New', monospace);
          font-size: 12px;
          color: var(--cyan, #00f0ff);
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(0, 240, 255, 0.1);
          border: 1px solid var(--cyan, #00f0ff);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--cyan, #00f0ff), var(--magenta, #ff00ff));
          transition: width 0.3s;
        }

        .question-card {
          background: rgba(232, 232, 255, 0.03);
          border: 2px solid var(--cyan, #00f0ff);
          padding: 30px;
          margin-bottom: 30px;
          border-radius: 4px;
        }

        .question-topic {
          font-size: 12px;
          color: var(--gold, #ffd700);
          font-family: var(--font-code, 'Courier New', monospace);
          margin-bottom: 15px;
          text-transform: uppercase;
        }

        .question-text {
          font-size: 18px;
          color: var(--text, #e8e8ff);
          margin-bottom: 25px;
          line-height: 1.6;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .option-button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(0, 240, 255, 0.05);
          border: 2px solid var(--cyan, #00f0ff);
          color: var(--text, #e8e8ff);
          font-family: var(--font-code, 'Courier New', monospace);
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          text-align: left;
        }

        .option-button:hover:not(:disabled) {
          background: rgba(0, 240, 255, 0.1);
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
        }

        .option-button.selected {
          background: rgba(0, 240, 255, 0.15);
          box-shadow: inset 0 0 10px rgba(0, 240, 255, 0.3);
          border-color: var(--cyan, #00f0ff);
        }

        .option-button.correct {
          background: rgba(39, 201, 63, 0.15);
          border-color: #27c93f;
          color: #27c93f;
        }

        .option-button.incorrect {
          background: rgba(255, 107, 107, 0.15);
          border-color: #ff6b6b;
          color: #ff6b6b;
        }

        .option-button:disabled {
          cursor: not-allowed;
        }

        .option-letter {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: rgba(0, 240, 255, 0.2);
          border: 1px solid var(--cyan, #00f0ff);
          font-weight: bold;
          font-size: 12px;
          flex-shrink: 0;
        }

        .option-button.correct .option-letter {
          background: rgba(39, 201, 63, 0.3);
          border-color: #27c93f;
          color: #27c93f;
        }

        .option-button.incorrect .option-letter {
          background: rgba(255, 107, 107, 0.3);
          border-color: #ff6b6b;
          color: #ff6b6b;
        }

        .option-text {
          flex: 1;
        }

        .explanation {
          padding: 16px;
          margin-top: 16px;
          border-left: 4px solid var(--cyan, #00f0ff);
          background: rgba(0, 240, 255, 0.05);
          font-size: 14px;
          line-height: 1.6;
        }

        .explanation.correct {
          border-left-color: #27c93f;
          background: rgba(39, 201, 63, 0.05);
          color: #27c93f;
        }

        .explanation.incorrect {
          border-left-color: #ff6b6b;
          background: rgba(255, 107, 107, 0.05);
          color: #ff6b6b;
        }

        .explanation strong {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .explanation p {
          margin: 0;
          color: var(--text, #e8e8ff);
        }

        .quiz-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-pixel {
          padding: 12px 24px;
          font-family: var(--font-mono, 'Courier New', monospace);
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid;
        }

        .btn-pixel-primary {
          background: var(--cyan, #00f0ff);
          border-color: var(--cyan, #00f0ff);
          color: #001a1a;
        }

        .btn-pixel-primary:hover:not(:disabled) {
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.6);
        }

        .btn-pixel-primary:disabled,
        .btn-pixel-primary.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-pixel-secondary {
          background: transparent;
          border-color: var(--cyan, #00f0ff);
          color: var(--cyan, #00f0ff);
        }

        .btn-pixel-secondary:hover:not(:disabled) {
          background: rgba(0, 240, 255, 0.1);
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.4);
        }

        .btn-pixel-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .results-screen {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 500px;
        }

        .results-card {
          background: rgba(232, 232, 255, 0.03);
          border: 2px solid var(--cyan, #00f0ff);
          padding: 40px;
          max-width: 600px;
          width: 100%;
          text-align: center;
        }

        .results-title {
          font-size: 28px;
          color: var(--cyan, #00f0ff);
          text-shadow: 0 0 15px rgba(0, 240, 255, 0.5);
          margin-bottom: 30px;
          font-family: var(--font-code, 'Courier New', monospace);
        }

        .results-score {
          margin-bottom: 40px;
          padding: 30px;
          background: rgba(0, 240, 255, 0.05);
          border: 1px solid var(--cyan, #00f0ff);
        }

        .score-big {
          font-size: 72px;
          color: var(--gold, #ffd700);
          font-weight: bold;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
          font-family: var(--font-code, 'Courier New', monospace);
        }

        .score-detail {
          font-size: 16px;
          color: var(--cyan, #00f0ff);
          margin-top: 10px;
          font-family: var(--font-code, 'Courier New', monospace);
        }

        .results-questions {
          text-align: left;
          margin-bottom: 30px;
          max-height: 300px;
          overflow-y: auto;
        }

        .results-questions h3 {
          color: var(--cyan, #00f0ff);
          font-size: 14px;
          text-transform: uppercase;
          margin-bottom: 16px;
          font-family: var(--font-code, 'Courier New', monospace);
        }

        .result-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          background: rgba(0, 240, 255, 0.05);
          border-left: 3px solid var(--cyan, #00f0ff);
          font-size: 13px;
        }

        .result-item.correct {
          background: rgba(39, 201, 63, 0.05);
          border-left-color: #27c93f;
        }

        .result-item.incorrect {
          background: rgba(255, 107, 107, 0.05);
          border-left-color: #ff6b6b;
        }

        .result-indicator {
          font-weight: bold;
          flex-shrink: 0;
        }

        .result-item.correct .result-indicator {
          color: #27c93f;
        }

        .result-item.incorrect .result-indicator {
          color: #ff6b6b;
        }

        .result-text {
          color: var(--text, #e8e8ff);
          flex: 1;
        }

        .results-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  )
}
