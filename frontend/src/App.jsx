import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StarField from './components/StarField'
import LandingPage from './pages/LandingPage'
import ModulesPage from './pages/ModulesPage'
import QuizPage from './pages/QuizPage'

export default function App() {
  return (
    <BrowserRouter>
      <StarField />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/modules" element={<ModulesPage />} />
        <Route path="/quiz" element={<QuizPage />} />
      </Routes>
    </BrowserRouter>
  )
}