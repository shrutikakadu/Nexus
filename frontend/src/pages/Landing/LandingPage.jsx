import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
    const navigate = useNavigate()

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f7fdf9', color: '#0f2718', overflowX: 'hidden' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        :root {
          --bg: #f7fdf9; --bg2: #edf7f1; --bg3: #e2f0e8;
          --surface: #ffffff; --border: #d4ead9; --border2: #c0dfc8;
          --green: #1a7a4a; --green-mid: #22a05e; --green-lt: #d6f0e2; --green-xlt: #eaf7f0;
          --text: #0f2718; --text2: #3d6b4f; --text3: #7aaa8a;
          --amber: #c97a10; --amber-lt: #fef3e2;
          --red: #c0392b; --red-lt: #fdecea;
          --serif: 'DM Serif Display', serif;
          --sans: 'Plus Jakarta Sans', sans-serif;
          --mono: 'DM Mono', monospace;
          --radius: 12px; --radius-lg: 18px;
          --shadow: 0 2px 16px rgba(26,122,74,0.07);
          --shadow-lg: 0 8px 40px rgba(26,122,74,0.12);
        }

        .topnav {
          position: sticky; top: 0; z-index: 200;
          background: rgba(247,253,249,0.92); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.85rem 3rem;
        }
        .logo { font-family: var(--mono); font-size: 1rem; font-weight: 500; color: var(--green); letter-spacing: 0.18em; text-transform: uppercase; }
        .nav-links { display: flex; gap: 1.8rem; list-style: none; }
        .nav-links a { color: var(--text2); text-decoration: none; font-size: 0.88rem; font-weight: 500; transition: color 0.2s; cursor: pointer; }
        .nav-links a:hover { color: var(--green); }
        .nav-actions { display: flex; gap: 0.75rem; align-items: center; }
        .btn { border: none; border-radius: 8px; padding: 0.6rem 1.3rem; font-family: var(--sans); font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: all 0.18s; }
        .btn-outline { background: transparent; border: 1.5px solid var(--border2); color: var(--text2); }
        .btn-outline:hover { border-color: var(--green); color: var(--green); }
        .btn-solid { background: var(--green); color: #fff; }
        .btn-solid:hover { background: var(--green-mid); transform: translateY(-1px); }

        .hero {
          position: relative; overflow: hidden;
          padding: 7rem 3rem 5rem;
          display: flex; flex-direction: column; align-items: center; text-align: center;
        }
        .hero-pattern {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.55;
          background-image: radial-gradient(circle at 20% 30%, rgba(34,160,94,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(26,122,74,0.06) 0%, transparent 45%);
        }
        .hero-dots {
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(26,122,74,0.12) 1px, transparent 1px);
          background-size: 36px 36px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%);
        }
        .hero-chip {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--green); background: var(--green-lt); border: 1px solid var(--border2);
          border-radius: 100px; padding: 0.35rem 1rem; margin-bottom: 2rem;
          animation: fadeUp 0.6s ease both;
        }
        .chip-dot { width: 6px; height: 6px; background: var(--green-mid); border-radius: 50%; animation: blink 1.6s ease-in-out infinite; }
        .hero h1 {
          font-family: var(--serif); font-size: clamp(2.8rem, 6vw, 5rem);
          line-height: 1.1; max-width: 760px; margin-bottom: 1.4rem;
          animation: fadeUp 0.6s 0.08s ease both;
        }
        .hero h1 em { font-style: italic; color: var(--green-mid); }
        .hero-sub {
          max-width: 520px; color: var(--text2); font-size: 1.05rem; font-weight: 400;
          line-height: 1.8; margin-bottom: 2.5rem;
          animation: fadeUp 0.6s 0.16s ease both;
        }
        .hero-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; animation: fadeUp 0.6s 0.24s ease both; }
        .btn-hero { padding: 0.85rem 2rem; font-size: 1rem; border-radius: 10px; }

        .status-preview {
          margin-top: 3.5rem; width: 100%; max-width: 640px;
          background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
          padding: 1.5rem 2rem; box-shadow: var(--shadow-lg);
          animation: fadeUp 0.6s 0.32s ease both;
        }
        .sp-label { font-family: var(--mono); font-size: 0.68rem; letter-spacing: 0.14em; color: var(--text3); text-transform: uppercase; margin-bottom: 1.2rem; }
        .sp-stages { display: flex; align-items: flex-start; }
        .sp-stage { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; position: relative; }
        .sp-stage:not(:last-child)::after { content: ''; position: absolute; top: 14px; left: 50%; width: 100%; height: 2px; background: var(--border); z-index: 0; }
        .sp-stage.done::after { background: var(--green-mid); }
        .sp-stage.active::after { background: linear-gradient(90deg, var(--green-mid) 50%, var(--border) 100%); }
        .sp-dot { width: 28px; height: 28px; border-radius: 50%; z-index: 1; position: relative; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; }
        .sp-stage.done .sp-dot { background: var(--green-mid); color: #fff; border: 2px solid var(--green-mid); }
        .sp-stage.active .sp-dot { background: var(--surface); border: 2px solid var(--green-mid); color: var(--green); box-shadow: 0 0 0 4px var(--green-lt); animation: ripple 1.8s ease infinite; }
        .sp-stage.pending .sp-dot { background: var(--bg2); border: 2px solid var(--border); color: var(--text3); }
        .sp-name { font-size: 0.68rem; color: var(--text3); text-align: center; }
        .sp-stage.done .sp-name, .sp-stage.active .sp-name { color: var(--text2); font-weight: 500; }

        .stats-strip {
          background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          padding: 2.5rem 3rem; display: flex; justify-content: center;
        }
        .stat-item { flex: 1; max-width: 200px; text-align: center; padding: 0 2rem; border-right: 1px solid var(--border); }
        .stat-item:last-child { border-right: none; }
        .stat-num { font-family: var(--serif); font-size: 2.4rem; color: var(--green); line-height: 1; }
        .stat-lbl { font-size: 0.8rem; color: var(--text3); margin-top: 0.3rem; }

        .section { padding: 6rem 3rem; max-width: 1100px; margin: 0 auto; }
        .section-tag { font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.2em; color: var(--green); text-transform: uppercase; margin-bottom: 0.8rem; }
        .section-h { font-family: var(--serif); font-size: clamp(2rem, 4vw, 3rem); line-height: 1.15; margin-bottom: 1rem; }
        .section-sub { color: var(--text2); font-size: 1rem; max-width: 480px; line-height: 1.8; }

        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
        .tl-row { display: flex; gap: 1rem; padding: 1.1rem 0; border-bottom: 1px solid var(--border); align-items: flex-start; }
        .tl-row:last-child { border-bottom: none; }
        .tl-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
        .tl-icon.bad { background: var(--red-lt); }
        .tl-icon.good { background: var(--green-lt); }
        .tl-info strong { display: block; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.15rem; }
        .tl-info span { font-size: 0.8rem; color: var(--text3); }

        .features-bg { background: var(--bg2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 6rem 3rem; }
        .features-inner { max-width: 1100px; margin: 0 auto; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-top: 3.5rem; }
        .f-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 1.75rem;
          transition: all 0.22s; position: relative; overflow: hidden;
        }
        .f-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--green-mid), rgba(26,122,74,0.2)); opacity: 0; transition: opacity 0.2s; }
        .f-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-3px); border-color: var(--border2); }
        .f-card:hover::before { opacity: 1; }
        .f-card.span2 { grid-column: span 2; }
        .f-icon { width: 42px; height: 42px; background: var(--green-xlt); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; margin-bottom: 1.1rem; }
        .f-card h3 { font-size: 0.97rem; font-weight: 600; margin-bottom: 0.45rem; }
        .f-card p { font-size: 0.83rem; color: var(--text2); line-height: 1.75; }
        .f-badge { display: inline-block; margin-top: 0.8rem; font-family: var(--mono); font-size: 0.62rem; letter-spacing: 0.1em; background: var(--amber-lt); color: var(--amber); border-radius: 4px; padding: 0.2rem 0.55rem; text-transform: uppercase; }
        .heatmap { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; margin-top: 1rem; }
        .hm { height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.68rem; font-weight: 600; }
        .hm.g { background: var(--green-lt); color: var(--green); }
        .hm.y { background: var(--amber-lt); color: var(--amber); }
        .hm.n { background: var(--bg2); color: var(--text3); }

        .roles-section { padding: 6rem 3rem; max-width: 1100px; margin: 0 auto; }
        .roles-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; margin-top: 3.5rem; }
        .role-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 2rem 1.5rem; text-align: center; transition: all 0.2s; }
        .role-card:hover { box-shadow: var(--shadow); border-color: var(--border2); }
        .role-avatar { width: 52px; height: 52px; border-radius: 50%; background: var(--green-xlt); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin: 0 auto 1rem; }
        .role-tag { font-family: var(--mono); font-size: 0.65rem; letter-spacing: 0.14em; color: var(--green); text-transform: uppercase; display: block; margin-bottom: 0.5rem; }
        .role-card h3 { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.4rem; }
        .role-card p { font-size: 0.8rem; color: var(--text2); line-height: 1.7; }

        .cta-section { background: var(--green); padding: 6rem 3rem; text-align: center; }
        .cta-section h2 { font-family: var(--serif); font-size: clamp(2rem, 4vw, 3.2rem); color: #fff; margin-bottom: 1rem; max-width: 600px; margin-left: auto; margin-right: auto; }
        .cta-section p { color: rgba(255,255,255,0.75); font-size: 1rem; margin-bottom: 2.5rem; max-width: 440px; margin-left: auto; margin-right: auto; }
        .btn-white { background: #fff; color: var(--green); font-weight: 600; padding: 0.9rem 2.2rem; border-radius: 10px; border: none; font-family: var(--sans); font-size: 1rem; cursor: pointer; transition: all 0.2s; margin: 0 0.5rem; }
        .btn-white:hover { background: var(--bg2); transform: translateY(-2px); }
        .btn-white-out { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.4); font-weight: 500; padding: 0.9rem 2.2rem; border-radius: 10px; font-family: var(--sans); font-size: 1rem; cursor: pointer; transition: all 0.2s; margin: 0 0.5rem; }
        .btn-white-out:hover { border-color: rgba(255,255,255,0.8); }

        footer { background: var(--surface); border-top: 1px solid var(--border); padding: 1.8rem 3rem; display: flex; align-items: center; justify-content: space-between; }
        .footer-copy { font-size: 0.8rem; color: var(--text3); }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes ripple { 0%,100%{box-shadow:0 0 0 5px var(--green-lt)} 50%{box-shadow:0 0 0 8px rgba(34,160,94,0.15)} }
      `}</style>

            {/* NAV */}
            <nav className="topnav">
                <div className="logo">NEXUS</div>
                <ul className="nav-links">
                    <li><a onClick={() => document.getElementById('features-anchor')?.scrollIntoView({ behavior: 'smooth' })}>Features</a></li>
                    <li><a onClick={() => document.getElementById('roles-anchor')?.scrollIntoView({ behavior: 'smooth' })}>Roles</a></li>
                </ul>
                <div className="nav-actions">
                    <button className="btn btn-outline" onClick={() => navigate('/login')}>Log In</button>
                    <button className="btn btn-solid" onClick={() => navigate('/login')}>Get Started</button>
                </div>
            </nav>

            {/* HERO */}
            <section className="hero">
                <div className="hero-pattern" />
                <div className="hero-dots" />
                <div className="hero-chip"><span className="chip-dot" /> Automated Clearance Protocol · Batch 2025</div>
                <h1>Graduate without the<br /><em>paperwork nightmare.</em></h1>
                <p className="hero-sub">Nexus replaces physical signature queues with a seamless digital clearance chain — so you can focus on your future, not your forms.</p>
                <div className="hero-btns">
                    <button className="btn btn-solid btn-hero" onClick={() => navigate('/login')}>Start Clearance →</button>
                    <button className="btn btn-outline btn-hero" onClick={() => document.getElementById('features-anchor')?.scrollIntoView({ behavior: 'smooth' })}>See How It Works</button>
                </div>
                <div className="status-preview">
                    <div className="sp-label">Live clearance — Hritani Sharma · Roll: CS2025041</div>
                    <div className="sp-stages">
                        <div className="sp-stage done"><div className="sp-dot">✓</div><div className="sp-name">Submitted</div></div>
                        <div className="sp-stage done"><div className="sp-dot">✓</div><div className="sp-name">Lab In-charge</div></div>
                        <div className="sp-stage active"><div className="sp-dot">3</div><div className="sp-name">HOD</div></div>
                        <div className="sp-stage pending"><div className="sp-dot">–</div><div className="sp-name">Principal</div></div>
                        <div className="sp-stage pending"><div className="sp-dot">–</div><div className="sp-name">Certificate</div></div>
                    </div>
                </div>
            </section>

            {/* STATS */}
            <div className="stats-strip">
                <div className="stat-item"><div className="stat-num">2,400+</div><div className="stat-lbl">Students cleared</div></div>
                <div className="stat-item"><div className="stat-num">48 hrs</div><div className="stat-lbl">Avg. clearance time</div></div>
                <div className="stat-item"><div className="stat-num">12</div><div className="stat-lbl">Departments connected</div></div>
                <div className="stat-item"><div className="stat-num">100%</div><div className="stat-lbl">Digital, no paper</div></div>
            </div>

            {/* PROBLEM */}
            <div className="section">
                <div className="two-col">
                    <div>
                        <div className="section-tag">The Problem</div>
                        <h2 className="section-h">The graduation clearance maze, solved.</h2>
                        <p className="section-sub">Every year, students waste weeks chasing physical signatures, losing forms, and getting zero visibility into what's blocking them.</p>
                    </div>
                    <div>
                        <div className="tl-row"><div className="tl-icon bad">📄</div><div className="tl-info"><strong>Lost "No Dues" form at library</strong><span>No tracking, no receipt — start over from scratch</span></div></div>
                        <div className="tl-row"><div className="tl-icon bad">⏳</div><div className="tl-info"><strong>HOD unavailable for 3 days</strong><span>No reminders, no escalation — clearance stalls</span></div></div>
                        <div className="tl-row"><div className="tl-icon bad">💸</div><div className="tl-info"><strong>Library fine discovered on day 5</strong><span>Entire pipeline blocked with no prior warning</span></div></div>
                        <div className="tl-row"><div className="tl-icon good">✅</div><div className="tl-info"><strong>With Nexus — cleared in 2 days</strong><span>Digital chain, instant alerts, certificate downloaded</span></div></div>
                    </div>
                </div>
            </div>

            {/* FEATURES */}
            <div className="features-bg" id="features-anchor">
                <div className="features-inner">
                    <div style={{ textAlign: 'center' }}>
                        <div className="section-tag">Core Features</div>
                        <h2 className="section-h" style={{ maxWidth: 500, margin: '0 auto' }}>Every step of clearance, automated.</h2>
                    </div>
                    <div className="features-grid">
                        <div className="f-card"><div className="f-icon">🔗</div><h3>Multi-Stage Approval Chain</h3><p>Digital chain of custody replaces physical signatures. Sequential notifications flow: Lab In-charge → HOD → Principal, each with a dedicated action dashboard.</p></div>
                        <div className="f-card"><div className="f-icon">📂</div><h3>Smart Document Vault</h3><p>Upload ID cards, library receipts, lab manuals with automatic format and size validation. Admins see documents side-by-side with approval controls.</p></div>
                        <div className="f-card"><div className="f-icon">📜</div><h3>Digital Certificate Generator</h3><p>Upon final approval, a tamper-proof "No Dues Certificate" and consolidated transcript are generated as non-editable PDFs — ready for instant download.</p></div>
                        <div className="f-card span2">
                            <div className="f-icon">🗺️</div><h3>Live Status Heatmap</h3>
                            <p>Real-time color-coded map showing exactly which departments have cleared (green), are pending (yellow), or flagged (red). Zero follow-up calls needed.</p>
                            <div className="heatmap">
                                <div className="hm g">Library</div><div className="hm g">Lab</div>
                                <div className="hm y">HOD</div><div className="hm n">Principal</div><div className="hm n">Accounts</div>
                            </div>
                        </div>
                        <div className="f-card"><div className="f-icon">💳</div><h3>Payment Sandbox</h3><p>Detected dues trigger an in-app payment flow. On success, a digital receipt is generated and the student auto-advances to the next stage.</p></div>
                        <div className="f-card"><div className="f-icon">📊</div><h3>Dues Reconciliation</h3><p>Departments upload a CSV of pending dues. Nexus auto-flags affected students and blocks clearance until resolved by admin.</p></div>
                        <div className="f-card"><div className="f-icon">📧</div><h3>Automated Email Nudges</h3><p>A daily background script detects stale approvals. Any request idle for 48 hrs triggers a professional automated reminder to the responsible authority.</p><div className="f-badge">⭐ Brownie Point</div></div>
                        <div className="f-card"><div className="f-icon">📦</div><h3>Digital Locker Export</h3><p>One-click ZIP download bundles all documents, receipts, and certificates into a permanent archive for the student's career records.</p><div className="f-badge">⭐ Brownie Point</div></div>
                        <div className="f-card"><div className="f-icon">🔲</div><h3>QR-Coded Certificates</h3><p>Every certificate contains a unique QR code linking to a public URL that verifies authenticity — student name, batch, and official issue confirmed instantly.</p><div className="f-badge">⭐ Brownie Point</div></div>
                    </div>
                </div>
            </div>

            {/* ROLES */}
            <div className="roles-section" id="roles-anchor">
                <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                    <div className="section-tag">Who Uses Nexus</div>
                    <h2 className="section-h">Built for every stakeholder.</h2>
                </div>
                <div className="roles-grid">
                    <div className="role-card"><div className="role-avatar">🎓</div><span className="role-tag">Student</span><h3>Final-Year Students</h3><p>Submit documents, track clearance live, pay dues, and download the certificate — from one portal.</p></div>
                    <div className="role-card"><div className="role-avatar">🔬</div><span className="role-tag">Approver</span><h3>Lab In-charge & HOD</h3><p>Action dashboards with approve/flag controls and document previews. No paper, no delays.</p></div>
                    <div className="role-card"><div className="role-avatar">🏛️</div><span className="role-tag">Authority</span><h3>Principal</h3><p>Final approval gate. Issues the digital certificate with a single authenticated action.</p></div>
                    <div className="role-card"><div className="role-avatar">⚙️</div><span className="role-tag">Admin</span><h3>Super Admin</h3><p>Full oversight: manage users, upload dues CSVs, monitor pipeline health, configure the system.</p></div>
                </div>
            </div>

            {/* CTA */}
            <div className="cta-section">
                <h2>Ready to clear your dues, the smart way?</h2>
                <p>Join thousands of students who graduated faster with Nexus — no queues, no lost forms, no stress.</p>
                <button className="btn-white" onClick={() => navigate('/login')}>Start My Clearance</button>
                <button className="btn-white-out" onClick={() => navigate('/login')}>Admin Login</button>
            </div>

            <footer>
                <div className="logo">NEXUS</div>
                <div className="footer-copy">© 2025 Nexus Clearance Protocol · All rights reserved</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>Built for graduating students everywhere</div>
            </footer>
        </div>
    )
}