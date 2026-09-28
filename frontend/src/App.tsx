import { Route, Routes, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import CitizenDashboard from './pages/CitizenDashboard'
import CentralDashboard from './pages/CentralDashboard'
import PiaDashboard from './pages/PiaDashboard'
import DistrictDashboard from './pages/DistrictDashboard'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/citizen" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/central" element={<ProtectedRoute><CentralDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/national" element={<ProtectedRoute><CentralDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/pia" element={<ProtectedRoute><PiaDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/agency" element={<ProtectedRoute><PiaDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/district" element={<ProtectedRoute><DistrictDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/lao" element={<ProtectedRoute><DistrictDashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><CentralDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
