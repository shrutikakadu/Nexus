
import { Routes, Route } from 'react-router-dom'

import LandingPage from './pages/Landing/LandingPage'
import LoginPage from './pages/Auth/LoginPage'
import StudentDashboard from './pages/Student/StudentDashboard'

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminStudentManagement from './pages/Admin/AdminStudentManagement'
import DocumentVerification from './pages/Admin/DocumentVerification'
import NoDues from './pages/Admin/NoDues'
import GraduationRequests from './pages/Admin/GraduationRequests'
import Certificates from './pages/Admin/Certificates'
import Reports from './pages/Admin/Reports'

export default function App() {
    return (
        <Routes>

            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Student Portal */}
            <Route path="/student" element={<StudentDashboard />} />

            {/* Admin Portal */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<AdminStudentManagement />} />
            <Route path="/admin/documents" element={<DocumentVerification />} />
            <Route path="/admin/nodues" element={<NoDues />} />
            <Route path="/admin/graduation" element={<GraduationRequests />} />
            <Route path="/admin/certificates" element={<Certificates />} />
            <Route path="/admin/reports" element={<Reports />} />

        </Routes>
    )
}
