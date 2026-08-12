import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StarField from './components/StarField'
import LandingPage from './pages/LandingPage'
import ModulesPage from './pages/ModulesPage'

export default function App() {
  return (
    <BrowserRouter>
      <StarField />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/modules" element={<ModulesPage />} />
      </Routes>
    </BrowserRouter>
  )
}