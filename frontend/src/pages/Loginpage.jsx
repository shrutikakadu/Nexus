import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
    const navigate = useNavigate()
    const [role, setRole] = useState('student')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // ─── DEMO CREDENTIALS (Hackathon bypass) ───────────────────────────
    const [adminRole, setAdminRole] = useState('library')
    const ADMIN_ROLES = [
        { value: 'library',   label: '📚 Library Admin' },
        { value: 'lab',       label: '🔬 Lab In-Charge' },
        { value: 'accounts',  label: '💰 Accounts Admin' },
        { value: 'hostel',    label: '🏠 Hostel Admin' },
        { value: 'hod',       label: '🎓 Head of Dept. (HOD)' },
        { value: 'principal', label: '🏛️ Principal' },
    ]
    const ROLE_ROUTES = { library: '/admin/library', lab: '/admin/lab', accounts: '/admin/accounts', hostel: '/admin/hostel', hod: '/admin/hod', principal: '/admin/principal' }
    // ───────────────────────────────────────────────────────────────────

    async function handleLogin() {
        setError('')
        if (!email || !password) {
            setError('Please enter both email and password.')
            return
        }

        // ── DEMO BYPASS: works with ANY email if password is demo123 ──
        if (password === 'demo123') {
            localStorage.setItem('nexus_token', 'demo_token')
            if (role === 'student') {
                localStorage.setItem('nexus_role', 'student')
                navigate('/student')
            } else {
                localStorage.setItem('nexus_role', adminRole)
                navigate(ROLE_ROUTES[adminRole])
            }
            return
        }

        // ── REAL BACKEND (runs only for non-demo passwords) ──
        setIsLoading(true)
        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await response.json()
            if (response.ok) {
                localStorage.setItem('nexus_token', data.access_token)
                if (role === 'student') {
                    localStorage.setItem('nexus_role', 'student')
                    navigate('/student')
                } else {
                    localStorage.setItem('nexus_role', adminRole)
                    navigate(ROLE_ROUTES[adminRole])
                }
            } else {
                // FastAPI 422 validation errors return detail as an array of objects
                // Safely convert to a readable string to avoid React render crash
                const detail = data.detail
                if (Array.isArray(detail)) {
                    setError(detail.map(e => e.msg).join(', '))
                } else if (typeof detail === 'string') {
                    setError(detail)
                } else {
                    setError('Invalid credentials. Please try again.')
                }
            }
        } catch (err) {
            setError('Backend offline. Use password: demo123 to enter demo mode.')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDemoRegister() {
        try {
            await fetch('http://127.0.0.1:8000/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email || 'test@college.edu', password: password || '12345', role })
            })
            alert('Demo account registered! You can now log in.')
        } catch {
            alert('Registration failed — backend may be offline.')
        }
    }

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', display: 'flex' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        :root {
          --bg: #f7fdf9; --bg2: #edf7f1;
          --surface: #ffffff; --border: #d4ead9; --border2: #c0dfc8;
          --green: #1a7a4a; --green-mid: #22a05e; --green-lt: #d6f0e2; --green-xlt: #eaf7f0;
          --text: #0f2718; --text2: #3d6b4f; --text3: #7aaa8a;
          --red: #c0392b; --red-lt: #fdecea;
          --serif: 'DM Serif Display', serif;
          --sans: 'Plus Jakarta Sans', sans-serif;
          --mono: 'DM Mono', monospace;
          --radius: 12px; --radius-lg: 18px;
        }
        .auth-left {
          width: 44%; background: var(--green);
          display: flex; flex-direction: column; justify-content: center;
          padding: 4rem 3.5rem; position: relative; overflow: hidden;
        }
        .auth-left::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background-image:
            radial-gradient(circle at 30% 60%, rgba(255,255,255,0.06) 0%, transparent 60%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 40%);
        }
        .auth-dots { position: absolute; inset: 0; pointer-events: none; background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px); background-size: 32px 32px; }
        .auth-left-logo { font-family: var(--mono); font-size: 0.9rem; letter-spacing: 0.2em; color: rgba(255,255,255,0.6); text-transform: uppercase; margin-bottom: 3rem; cursor: pointer; }
        .auth-left h2 { font-family: var(--serif); font-size: 2.6rem; color: #fff; line-height: 1.2; margin-bottom: 1rem; position: relative; }
        .auth-left > p { color: rgba(255,255,255,0.7); font-size: 0.92rem; line-height: 1.8; margin-bottom: 2.5rem; position: relative; }
        .auth-testimonial { background: rgba(255,255,255,0.1); border-radius: 12px; padding: 1.25rem 1.5rem; border: 1px solid rgba(255,255,255,0.12); position: relative; }
        .auth-testimonial p { font-size: 0.85rem; color: rgba(255,255,255,0.85); margin-bottom: 0.75rem; font-style: italic; line-height: 1.7; }
        .auth-testimonial-author { font-size: 0.75rem; color: rgba(255,255,255,0.5); font-family: var(--mono); letter-spacing: 0.08em; }
        .auth-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 3rem 2rem; background: var(--bg); }
        .auth-box { width: 100%; max-width: 420px; }
        .back-btn { background: none; border: none; color: var(--green); font-family: var(--sans); font-size: 0.85rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; padding: 0; margin-bottom: 2rem; }
        .back-btn:hover { color: var(--green-mid); }
        .auth-box h3 { font-family: var(--serif); font-size: 2rem; margin-bottom: 0.4rem; color: var(--text); }
        .auth-sub { color: var(--text2); font-size: 0.9rem; margin-bottom: 2rem; }
        .role-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 1.8rem; }
        .role-tab { padding: 0.85rem; border-radius: 10px; border: 1.5px solid var(--border); background: var(--surface); cursor: pointer; text-align: center; transition: all 0.2s; font-family: var(--sans); color: var(--text2); }
        .role-tab.selected { border-color: var(--green-mid); background: var(--green-xlt); color: var(--green); }
        .role-tab-icon { font-size: 1.3rem; display: block; margin-bottom: 0.3rem; }
        .role-tab-label { font-size: 0.82rem; font-weight: 600; }
        .form-group { margin-bottom: 1.1rem; }
        .form-label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--text2); margin-bottom: 0.4rem; }
        .form-input { width: 100%; padding: 0.75rem 1rem; border-radius: 8px; border: 1.5px solid var(--border); background: var(--surface); font-family: var(--sans); font-size: 0.9rem; color: var(--text); transition: border-color 0.2s; outline: none; box-sizing: border-box; }
        .form-input:focus { border-color: var(--green-mid); box-shadow: 0 0 0 3px rgba(34,160,94,0.12); }
        .btn-auth { width: 100%; padding: 0.9rem; background: var(--green); color: #fff; border: none; border-radius: 10px; font-family: var(--sans); font-size: 0.97rem; font-weight: 600; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; }
        .btn-auth:hover { background: var(--green-mid); transform: translateY(-1px); }
        .btn-auth:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .error-msg { background: var(--red-lt); color: var(--red); padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.83rem; margin-bottom: 1rem; border: 1px solid #fca5a5; }
        .demo-hint { background: var(--green-xlt); border: 1px solid var(--border2); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.2rem; }
        .demo-hint-title { font-family: var(--mono); font-size: 0.62rem; letter-spacing: 0.12em; color: var(--green); text-transform: uppercase; margin-bottom: 0.35rem; }
        .demo-hint-text { font-size: 0.78rem; color: var(--text2); line-height: 1.6; }
        .demo-hint-text strong { font-weight: 600; color: var(--green); font-family: var(--mono); }
        .auth-switch { text-align: center; margin-top: 1.2rem; font-size: 0.83rem; color: var(--text3); }
        .auth-switch a { color: var(--green); text-decoration: none; font-weight: 600; cursor: pointer; }
        .features-list { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 0.75rem; position: relative; }
        .feature-pill { display: flex; align-items: center; gap: 0.6rem; font-size: 0.82rem; color: rgba(255,255,255,0.75); }
        .feature-pill-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.4); flex-shrink: 0; }
        @media (max-width: 768px) { .auth-left { display: none; } }
      `}</style>

            {/* LEFT PANEL */}
            <div className="auth-left">
                <div className="auth-dots" />
                <div className="auth-left-logo" onClick={() => navigate('/')}>NEXUS</div>
                <h2>Your clearance,<br />simplified.</h2>
                <p>From document upload to digital certificate — the entire graduation clearance process in one seamless portal. No queues. No lost papers. No stress.</p>
                <div className="auth-testimonial">
                    <p>"I cleared all 6 departments in under 48 hours. What used to take 2 weeks now takes 2 days."</p>
                    <div className="auth-testimonial-author">— Hritani S., CS Batch 2025</div>
                </div>
                <div className="features-list">
                    <div className="feature-pill"><span className="feature-pill-dot" />Multi-stage digital approval chain</div>
                    <div className="feature-pill"><span className="feature-pill-dot" />Live clearance heatmap</div>
                    <div className="feature-pill"><span className="feature-pill-dot" />QR-verified digital certificate</div>
                    <div className="feature-pill"><span className="feature-pill-dot" />One-click digital locker export</div>
                </div>
            </div>

            {/* RIGHT FORM */}
            <div className="auth-right">
                <div className="auth-box">
                    <button className="back-btn" onClick={() => navigate('/')}>← Back to Home</button>
                    <h3>Welcome back</h3>
                    <p className="auth-sub">Sign in to your Nexus account to continue.</p>

                    <div className="role-tabs">
                        <div className={`role-tab ${role === 'student' ? 'selected' : ''}`} onClick={() => setRole('student')}>
                            <span className="role-tab-icon">🎓</span>
                            <span className="role-tab-label">Student</span>
                        </div>
                        <div className={`role-tab ${role !== 'student' ? 'selected' : ''}`} onClick={() => setRole('admin')}>
                            <span className="role-tab-icon">🏛️</span>
                            <span className="role-tab-label">Admin / Staff</span>
                        </div>
                    </div>
                    {role !== 'student' && (
                        <div className="form-group">
                            <label className="form-label">Select Your Role</label>
                            <select
                                className="form-input"
                                value={adminRole}
                                onChange={e => setAdminRole(e.target.value)}
                                style={{ cursor: 'pointer' }}
                            >
                                {ADMIN_ROLES.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* DEMO HINT BOX */}
                    <div className="demo-hint">
                        <div className="demo-hint-title">⚡ Demo Credentials</div>
                        <div className="demo-hint-text">
                            {role === 'student' ? (
                                <>Student: <strong>student@college.edu</strong> / <strong>demo123</strong></>
                            ) : (
                                <>Any email + password <strong>demo123</strong> works for all admin roles</>  
                            )}
                        </div>
                    </div>

                    {error && <div className="error-msg">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">Email address</label>
                        <input
                            className="form-input"
                            type="email"
                            placeholder={role === 'student' ? 'student@college.edu' : 'admin@college.edu'}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                        <a style={{ fontSize: '0.8rem', color: 'var(--green)', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</a>
                    </div>

                    <button className="btn-auth" onClick={handleLogin} disabled={isLoading}>
                        {isLoading ? 'Signing in…' : role === 'student' ? 'Sign in as Student →' : `Sign in as ${ADMIN_ROLES.find(r => r.value === adminRole)?.label.split(' ').slice(1).join(' ')} →`}
                    </button>

                    <div className="auth-switch">
                        Don't have an account? <a onClick={handleDemoRegister}>Quick Register with above credentials</a>
                    </div>
                </div>
            </div>
        </div>
    )
}