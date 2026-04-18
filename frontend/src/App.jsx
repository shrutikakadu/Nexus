import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/Landing/LandingPage'
import LoginPage from './pages/Loginpage'
import StudentDashboard from './pages/Student/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
    )
}