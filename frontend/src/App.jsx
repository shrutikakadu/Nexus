import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/Landing/LandingPage'
import LoginPage from './pages/Loginpage'
import StudentDashboard from './pages/Student/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LibraryDashboard from './pages/Admin/LibraryDashboard'
import LabDashboard from './pages/Admin/LabDashboard'
import AccountsDashboard from './pages/Admin/AccountsDashboard'
import HostelDashboard from './pages/Admin/HostelDashboard'
import HODDashboard from './pages/Admin/HODDashboard'
import PrincipalDashboard from './pages/Admin/PrincipalDashboard'
import ProfileSetup from './pages/Profilesetup'
import VerifyCertificate from './pages/VerifyCertificate'

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/edit-profile" element={<ProfileSetup editMode={true} />} />
            <Route path="/student" element={<StudentDashboard />} />
            {/* Legacy admin route */}
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Role-specific admin dashboards */}
            <Route path="/admin/library" element={<LibraryDashboard />} />
            <Route path="/admin/lab" element={<LabDashboard />} />
            <Route path="/admin/accounts" element={<AccountsDashboard />} />
            <Route path="/admin/hostel" element={<HostelDashboard />} />
            <Route path="/admin/hod" element={<HODDashboard />} />
            <Route path="/admin/principal" element={<PrincipalDashboard />} />
<<<<<<< HEAD
            {/* Public Certificate Verification */}
            <Route path="/verify/:certId" element={<VerifyCertificate />} />
            {/* Fallback — must be LAST */}
=======
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/edit-profile" element={<ProfileSetup editMode={true} />} />
            {/* Fallback */}
>>>>>>> 4d86a8e (Restore lost source code and features from detached HEAD)
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}