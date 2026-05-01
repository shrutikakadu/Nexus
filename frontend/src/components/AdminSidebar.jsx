import { useNavigate } from 'react-router-dom'

const ROLE_CONFIG = {
    library:   { icon: '📚', name: 'Library Admin',    dept: 'Library Department' },
    lab:       { icon: '🔬', name: 'Lab In-Charge',    dept: 'Laboratory Department' },
    accounts:  { icon: '💰', name: 'Accounts Admin',   dept: 'Accounts Department' },
    hostel:    { icon: '🏠', name: 'Hostel Admin',     dept: 'Hostel Administration' },
    hod:       { icon: '🎓', name: 'Head of Dept.',    dept: 'Dept. of Computer Science' },
    principal: { icon: '🏛️', name: 'Principal',        dept: 'Academic Office' },
}

const NAV_ITEMS = [
    { key: 'dashboard',   icon: '📊', label: 'Dashboard' },
    { key: 'clearances',  icon: '📋', label: 'Clearance Requests', badgeKey: 'pending' },
    { key: 'students',    icon: '👥', label: 'Student Records' },
    { key: 'notifications', icon: '🔔', label: 'Notifications', badgeKey: 'notifs' },
    { key: 'reports',     icon: '📈', label: 'Reports' },
]

export default function AdminSidebar({ role = 'library', activeItem = 'dashboard', onNavigate, badges = {} }) {
    const navigate = useNavigate()
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.library

    return (
        <aside className="admin-sidebar">
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-brand-logo" onClick={() => navigate('/')}>NEXUS</div>
                <div className="sidebar-role">
                    <div className="sidebar-role-icon">{config.icon}</div>
                    <div>
                        <div className="sidebar-role-name">{config.name}</div>
                        <div className="sidebar-role-dept">{config.dept}</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Main Menu</div>
                {NAV_ITEMS.map(item => (
                    <button
                        key={item.key}
                        className={`sidebar-link ${activeItem === item.key ? 'active' : ''}`}
                        onClick={() => onNavigate?.(item.key)}
                    >
                        <span className="sidebar-link-icon">{item.icon}</span>
                        {item.label}
                        {item.badgeKey && badges[item.badgeKey] > 0 && (
                            <span className="sidebar-link-badge">{badges[item.badgeKey]}</span>
                        )}
                    </button>
                ))}

                <div className="sidebar-section-label" style={{ marginTop: '1rem' }}>Quick Actions</div>
                {role === 'principal' && (
                    <button
                        className={`sidebar-link ${activeItem === 'certificates' ? 'active' : ''}`}
                        onClick={() => onNavigate?.('certificates')}
                    >
                        <span className="sidebar-link-icon">📜</span>
                        Certificates
                    </button>
                )}
                {(role === 'hod' || role === 'principal') && (
                    <button
                        className={`sidebar-link ${activeItem === 'heatmap' ? 'active' : ''}`}
                        onClick={() => onNavigate?.('heatmap')}
                    >
                        <span className="sidebar-link-icon">🗺️</span>
                        Clearance Heatmap
                    </button>
                )}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">AD</div>
                    <div>
                        <div className="sidebar-user-name">Admin User</div>
                        <div className="sidebar-user-email">admin@college.edu</div>
                    </div>
                </div>
                <button
                    className="sidebar-link"
                    style={{ color: 'var(--red)', marginTop: '0.25rem' }}
                    onClick={() => {
                        localStorage.removeItem('nexus_token')
                        localStorage.removeItem('nexus_role')
                        navigate('/login')
                    }}
                >
                    <span className="sidebar-link-icon">🚪</span>
                    Logout
                </button>
            </div>
        </aside>
    )
}
