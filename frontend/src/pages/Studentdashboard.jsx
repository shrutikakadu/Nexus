import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function StudentDashboard() {
    const navigate = useNavigate()
    const [uploadedDocs, setUploadedDocs] = useState({})
    const [paid, setPaid] = useState(false)

    const stages = [
        { id: 1, name: 'Submitted', status: 'done' },
        { id: 2, name: 'Lab In-charge', status: 'done' },
        { id: 3, name: 'HOD', status: 'active' },
        { id: 4, name: 'Principal', status: 'pending' },
        { id: 5, name: 'Certificate', status: 'pending' },
    ]

    const departments = [
        { name: 'Library', status: 'cleared' },
        { name: 'Lab', status: 'cleared' },
        { name: 'HOD', status: 'pending' },
        { name: 'Principal', status: 'pending' },
        { name: 'Accounts', status: paid ? 'cleared' : 'flagged' },
    ]

    const docs = ['College ID Card', 'Library Receipt', 'Lab Manual', 'Fee Receipt']

    const handleUpload = (doc) => {
        setUploadedDocs(prev => ({ ...prev, [doc]: true }))
    }

    const handleDownload = () => {
        alert('Certificate downloaded! (Demo)')
    }

    return (
        <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f7fdf9', minHeight: '100vh', color: '#0f2718' }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        :root {
          --green: #1a7a4a; --green-mid: #22a05e; --green-lt: #d6f0e2; --green-xlt: #eaf7f0;
          --text: #0f2718; --text2: #3d6b4f; --text3: #7aaa8a;
          --border: #d4ead9; --border2: #c0dfc8;
          --surface: #fff; --bg: #f7fdf9; --bg2: #edf7f1;
          --amber: #c97a10; --amber-lt: #fef3e2;
          --red: #c0392b; --red-lt: #fdecea;
          --serif: 'DM Serif Display', serif;
          --mono: 'DM Mono', monospace;
        }
        .topbar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0.85rem 2.5rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-family: var(--mono); font-size: 0.9rem; letter-spacing: 0.18em; color: var(--green); text-transform: uppercase; cursor: pointer; }
        .user-pill { display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: var(--text2); }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--green-lt); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; color: var(--green); }
        .logout-btn { background: none; border: 1px solid var(--border2); border-radius: 6px; padding: 0.35rem 0.85rem; font-size: 0.8rem; color: var(--text3); cursor: pointer; font-family: inherit; }
        .logout-btn:hover { color: var(--green); border-color: var(--green); }

        .main { max-width: 1000px; margin: 0 auto; padding: 2.5rem 2rem; }
        .welcome { margin-bottom: 2rem; }
        .welcome h1 { font-family: var(--serif); font-size: 2rem; margin-bottom: 0.25rem; }
        .welcome p { color: var(--text3); font-size: 0.85rem; font-family: var(--mono); letter-spacing: 0.05em; }

        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem; }
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; }
        .card-label { font-family: var(--mono); font-size: 0.68rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--text3); margin-bottom: 1rem; }
        .card h3 { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.75rem; }

        .stages { display: flex; align-items: flex-start; gap: 0; }
        .stage { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.4rem; position: relative; }
        .stage:not(:last-child)::after { content: ''; position: absolute; top: 13px; left: 50%; width: 100%; height: 2px; background: var(--border); z-index: 0; }
        .stage.done::after { background: var(--green-mid); }
        .stage.active::after { background: linear-gradient(90deg, var(--green-mid) 50%, var(--border) 100%); }
        .s-dot { width: 26px; height: 26px; border-radius: 50%; z-index: 1; position: relative; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 600; }
        .stage.done .s-dot { background: var(--green-mid); color: #fff; border: 2px solid var(--green-mid); }
        .stage.active .s-dot { background: var(--surface); border: 2px solid var(--green-mid); color: var(--green); box-shadow: 0 0 0 4px var(--green-lt); }
        .stage.pending .s-dot { background: var(--bg2); border: 2px solid var(--border); color: var(--text3); }
        .s-name { font-size: 0.62rem; color: var(--text3); text-align: center; }
        .stage.done .s-name, .stage.active .s-name { color: var(--text2); font-weight: 500; }

        .heatmap { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; }
        .hm { padding: 0.5rem 0.25rem; border-radius: 8px; text-align: center; font-size: 0.68rem; font-weight: 600; }
        .hm.cleared { background: var(--green-lt); color: var(--green); }
        .hm.pending { background: var(--amber-lt); color: var(--amber); }
        .hm.flagged { background: var(--red-lt); color: var(--red); }

        .doc-list { display: flex; flex-direction: column; gap: 0.6rem; }
        .doc-row { display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; border-radius: 8px; background: var(--bg2); border: 1px solid var(--border); }
        .doc-name { font-size: 0.85rem; color: var(--text); }
        .upload-btn { font-size: 0.75rem; padding: 0.3rem 0.75rem; border-radius: 6px; border: 1px solid var(--border2); background: var(--surface); cursor: pointer; font-family: inherit; color: var(--green); font-weight: 600; }
        .upload-btn.done { background: var(--green-lt); border-color: var(--green-lt); color: var(--green); cursor: default; }

        .dues-box { background: var(--red-lt); border: 1px solid #f5c6c2; border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1rem; }
        .dues-box h4 { font-size: 0.9rem; font-weight: 600; color: var(--red); margin-bottom: 0.25rem; }
        .dues-box p { font-size: 0.82rem; color: #8b3a35; margin-bottom: 0.75rem; }
        .pay-btn { background: var(--red); color: #fff; border: none; border-radius: 8px; padding: 0.55rem 1.25rem; font-family: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
        .pay-btn:hover { opacity: 0.88; }
        .paid-box { background: var(--green-lt); border: 1px solid var(--border2); border-radius: 10px; padding: 1rem 1.25rem; }
        .paid-box p { font-size: 0.85rem; color: var(--green); font-weight: 600; }

        .cert-box { background: linear-gradient(135deg, var(--green-xlt), var(--green-lt)); border: 1px solid var(--border2); border-radius: 12px; padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; }
        .cert-info h4 { font-family: var(--serif); font-size: 1.2rem; margin-bottom: 0.25rem; }
        .cert-info p { font-size: 0.8rem; color: var(--text3); }
        .cert-btn { background: var(--green); color: #fff; border: none; border-radius: 10px; padding: 0.75rem 1.5rem; font-family: inherit; font-size: 0.9rem; font-weight: 600; cursor: pointer; opacity: 0.45; }
        .cert-btn.ready { opacity: 1; }
        .cert-btn.ready:hover { background: var(--green-mid); }
      `}</style>

            {/* TOPBAR */}
            <div className="topbar">
                <div className="logo" onClick={() => navigate('/')}>NEXUS</div>
                <div className="user-pill">
                    <div className="avatar">HS</div>
                    <span>Hritani Sharma · CS2025041</span>
                    <button className="logout-btn" onClick={() => navigate('/login')}>Log out</button>
                </div>
            </div>

            <div className="main">
                <div className="welcome">
                    <h1>My Clearance</h1>
                    <p>Batch 2025 · Computer Science · Clearance ID #NX-2025-041</p>
                </div>

                {/* ROW 1 */}
                <div className="grid2">
                    <div className="card">
                        <div className="card-label">Approval Progress</div>
                        <div className="stages">
                            {stages.map(s => (
                                <div key={s.id} className={`stage ${s.status}`}>
                                    <div className="s-dot">{s.status === 'done' ? '✓' : s.id}</div>
                                    <div className="s-name">{s.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-label">Department Heatmap</div>
                        <div className="heatmap">
                            {departments.map(d => (
                                <div key={d.name} className={`hm ${d.status}`}>{d.name}</div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ROW 2 */}
                <div className="grid2">
                    <div className="card">
                        <div className="card-label">Document Upload</div>
                        <div className="doc-list">
                            {docs.map(doc => (
                                <div key={doc} className="doc-row">
                                    <span className="doc-name">{doc}</span>
                                    <button
                                        className={`upload-btn ${uploadedDocs[doc] ? 'done' : ''}`}
                                        onClick={() => handleUpload(doc)}
                                        disabled={uploadedDocs[doc]}
                                    >
                                        {uploadedDocs[doc] ? '✓ Uploaded' : 'Upload'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-label">Dues & Payment</div>
                        {!paid ? (
                            <div className="dues-box">
                                <h4>Library Fine Detected</h4>
                                <p>₹ 150 outstanding — clearance blocked until resolved.</p>
                                <button className="pay-btn" onClick={() => setPaid(true)}>Pay ₹150 Now</button>
                            </div>
                        ) : (
                            <div className="paid-box">
                                <p>✓ All dues cleared — receipt generated</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* CERTIFICATE */}
                <div className="cert-box">
                    <div className="cert-info">
                        <h4>No Dues Certificate</h4>
                        <p>{paid ? 'Pending HOD & Principal approval' : 'Clear all dues to unlock certificate'}</p>
                    </div>
                    <button className={`cert-btn ${paid ? 'ready' : ''}`} onClick={paid ? handleDownload : null}>
                        Download Certificate
                    </button>
                </div>
            </div>
        </div>
    )
}