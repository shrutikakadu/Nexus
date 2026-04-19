import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const STYLES = `
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

.adm-wrap { font-family: var(--sans); background: var(--bg); color: var(--text); min-height: 100vh; padding: 1.5rem; }

.adm-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.75rem; }
.adm-logo { font-family: var(--mono); font-size: 0.9rem; font-weight: 500; color: var(--green); letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; }
.adm-info { display: flex; align-items: center; gap: 0.75rem; }
.adm-chip { font-family: var(--mono); font-size: 0.65rem; letter-spacing: 0.12em; color: var(--green); background: var(--green-lt); border: 1px solid var(--border2); border-radius: 100px; padding: 0.3rem 0.9rem; text-transform: uppercase; }
.adm-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--green); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; font-family: var(--mono); }

.adm-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.75rem; }
.adm-metric { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.25rem 1.4rem; box-shadow: var(--shadow); }
.adm-metric-tag { font-family: var(--mono); font-size: 0.62rem; letter-spacing: 0.14em; color: var(--text3); text-transform: uppercase; margin-bottom: 0.6rem; }
.adm-metric-val { font-family: var(--serif); font-size: 2.1rem; line-height: 1; color: var(--text); margin-bottom: 0.25rem; }
.adm-metric-val.green { color: var(--green); }
.adm-metric-val.amber { color: var(--amber); }
.adm-metric-val.red { color: var(--red); }
.adm-metric-sub { font-size: 0.75rem; color: var(--text3); }

.adm-main { display: grid; grid-template-columns: 1fr 290px; gap: 1.25rem; }
.adm-left { display: flex; flex-direction: column; gap: 1.25rem; }
.adm-right { display: flex; flex-direction: column; gap: 1.25rem; }

.adm-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.4rem 1.6rem; box-shadow: var(--shadow); }
.adm-card.accent { border-left: 3px solid var(--green); }
.adm-card-label { font-family: var(--mono); font-size: 0.62rem; letter-spacing: 0.16em; color: var(--text3); text-transform: uppercase; margin-bottom: 1.1rem; }

.adm-tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 1.1rem; }
.adm-tab { font-size: 0.8rem; font-weight: 500; padding: 0.55rem 1rem; cursor: pointer; color: var(--text3); border: none; border-bottom: 2px solid transparent; margin-bottom: -1px; background: none; font-family: var(--sans); transition: color 0.15s; }
.adm-tab.active { color: var(--green); border-bottom-color: var(--green); }
.adm-tab:hover { color: var(--text2); }

.adm-app-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 0.6rem; border-bottom: 1px solid var(--border); cursor: pointer; border-radius: 8px; transition: background 0.15s; }
.adm-app-row:last-child { border-bottom: none; }
.adm-app-row:hover { background: var(--green-xlt); }
.adm-app-row.faded { opacity: 0.35; pointer-events: none; }

.adm-av { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; font-family: var(--mono); flex-shrink: 0; }
.adm-av-g { background: var(--green-lt); color: var(--green); }
.adm-av-a { background: var(--amber-lt); color: var(--amber); }
.adm-av-b { background: #e8f1fe; color: #1a5faa; }
.adm-av-p { background: #f0ebfe; color: #5b3db5; }

.adm-app-info { flex: 1; min-width: 0; }
.adm-app-name { font-size: 0.85rem; font-weight: 600; color: var(--text); }
.adm-app-name span { font-size: 0.72rem; color: var(--text3); font-weight: 400; }
.adm-app-meta { font-size: 0.73rem; color: var(--text3); margin-top: 1px; }
.adm-app-meta.warn { color: var(--red); }

.adm-stages { display: flex; gap: 3px; flex-shrink: 0; }
.adm-st { width: 20px; height: 20px; border-radius: 50%; font-size: 0.6rem; font-weight: 600; display: flex; align-items: center; justify-content: center; font-family: var(--mono); }
.adm-st.done { background: var(--green-mid); color: #fff; }
.adm-st.act { background: var(--amber-lt); color: var(--amber); border: 1.5px solid var(--amber); }
.adm-st.pend { background: var(--bg2); color: var(--text3); border: 1px solid var(--border); }

.adm-act-btns { display: flex; gap: 6px; flex-shrink: 0; }
.adm-btn-sm { font-size: 0.72rem; padding: 0.35rem 0.85rem; border-radius: 8px; border: 1.5px solid; font-family: var(--sans); font-weight: 600; cursor: pointer; transition: all 0.15s; }
.adm-btn-app { border-color: var(--green); color: var(--green); background: transparent; }
.adm-btn-app:hover { background: var(--green-xlt); }
.adm-btn-flg { border-color: var(--red); color: var(--red); background: transparent; }
.adm-btn-flg:hover { background: var(--red-lt); }

.adm-detail-head { display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1.1rem; }
.adm-detail-status { margin-left: auto; font-family: var(--mono); font-size: 0.62rem; letter-spacing: 0.1em; background: var(--amber-lt); color: var(--amber); padding: 0.3rem 0.8rem; border-radius: 100px; text-transform: uppercase; }
.adm-detail-name { font-family: var(--serif); font-size: 1.2rem; color: var(--text); }
.adm-detail-sub { font-size: 0.75rem; color: var(--text3); margin-top: 2px; }

.adm-doc-row { display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.9rem; background: var(--bg2); border-radius: var(--radius); margin-bottom: 0.5rem; border: 1px solid var(--border); }
.adm-doc-name { font-size: 0.8rem; font-weight: 600; color: var(--text); }
.adm-doc-meta { font-size: 0.7rem; color: var(--text3); margin-top: 1px; }
.adm-btn-view { font-size: 0.7rem; padding: 0.28rem 0.75rem; border-radius: 6px; border: 1.5px solid var(--border2); color: var(--green); background: transparent; font-family: var(--sans); font-weight: 600; cursor: pointer; }
.adm-btn-view:hover { background: var(--green-xlt); border-color: var(--green); }

.adm-action-row { display: flex; gap: 0.6rem; margin-top: 1rem; }
.adm-btn-md { font-size: 0.8rem; padding: 0.6rem 1.2rem; border-radius: 10px; border: 1.5px solid; font-family: var(--sans); font-weight: 600; cursor: pointer; transition: all 0.18s; }
.adm-btn-solid { background: var(--green); color: #fff; border-color: var(--green); }
.adm-btn-solid:hover { background: var(--green-mid); }
.adm-btn-outline-red { background: transparent; color: var(--red); border-color: var(--red); }
.adm-btn-outline-red:hover { background: var(--red-lt); }

.adm-heatmap { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.adm-hm { border-radius: var(--radius); padding: 0.7rem 0.8rem; }
.adm-hm.g { background: var(--green-lt); border: 1px solid var(--border2); }
.adm-hm.y { background: var(--amber-lt); border: 1px solid #f0d090; }
.adm-hm.r { background: var(--red-lt); border: 1px solid #f0b0aa; }
.adm-hm.n { background: var(--bg2); border: 1px solid var(--border); }
.adm-hm-dept { font-size: 0.72rem; font-weight: 600; }
.adm-hm.g .adm-hm-dept { color: var(--green); }
.adm-hm.y .adm-hm-dept { color: var(--amber); }
.adm-hm.r .adm-hm-dept { color: var(--red); }
.adm-hm.n .adm-hm-dept { color: var(--text3); }
.adm-hm-stat { font-size: 0.65rem; font-family: var(--mono); margin-top: 2px; }
.adm-hm.g .adm-hm-stat { color: var(--green-mid); }
.adm-hm.y .adm-hm-stat { color: var(--amber); }
.adm-hm.r .adm-hm-stat { color: var(--red); }
.adm-hm.n .adm-hm-stat { color: var(--text3); }

.adm-dues-row { display: flex; align-items: center; justify-content: space-between; padding: 0.7rem 0; border-bottom: 1px solid var(--border); }
.adm-dues-row:last-child { border-bottom: none; }
.adm-dues-name { font-size: 0.82rem; font-weight: 600; color: var(--text); }
.adm-dues-amt { font-size: 0.7rem; color: var(--text3); margin-top: 1px; }

.adm-badge { font-size: 0.62rem; padding: 0.2rem 0.6rem; border-radius: 6px; font-family: var(--mono); letter-spacing: 0.08em; font-weight: 500; text-transform: uppercase; }
.adm-badge.red { background: var(--red-lt); color: var(--red); }
.adm-badge.green { background: var(--green-lt); color: var(--green); }
.adm-badge.amber { background: var(--amber-lt); color: var(--amber); }

.adm-csv-btn { width: 100%; margin-top: 0.9rem; padding: 0.65rem; border-radius: var(--radius); border: 1.5px dashed var(--border2); color: var(--text3); background: transparent; font-family: var(--mono); font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; }
.adm-csv-btn:hover { border-color: var(--green); color: var(--green); background: var(--green-xlt); }

.adm-nudge-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.7rem 0; border-bottom: 1px solid var(--border); }
.adm-nudge-row:last-child { border-bottom: none; }
.adm-nudge-name { font-size: 0.82rem; font-weight: 600; color: var(--text); flex: 1; }
.adm-nudge-days { font-size: 0.7rem; color: var(--red); font-family: var(--mono); }
.adm-btn-nudge { font-size: 0.68rem; padding: 0.28rem 0.75rem; border-radius: 6px; border: 1.5px solid var(--amber); color: var(--amber); background: transparent; font-family: var(--sans); font-weight: 600; cursor: pointer; }
.adm-btn-nudge:hover { background: var(--amber-lt); }

.adm-toast { position: fixed; bottom: 1.2rem; right: 1.2rem; background: var(--green); color: #fff; font-size: 0.8rem; font-family: var(--sans); font-weight: 500; padding: 0.7rem 1.2rem; border-radius: var(--radius); pointer-events: none; z-index: 999; transition: all 0.25s; }
.adm-toast.hidden { opacity: 0; transform: translateY(8px); }
.adm-toast.visible { opacity: 1; transform: translateY(0); }
`

const DUMMY_STUDENTS = [
  { id: 'hs', server_id: null, initials: 'HS', avClass: 'adm-av-g', name: 'Hritani Sharma', roll: '2021CS042', meta: 'Submitted 2 days ago', stages: ['done','act','pend'] },
  { id: 'rk', server_id: null, initials: 'RK', avClass: 'adm-av-b', name: 'Rohit Kumar',    roll: '2021CS017', meta: 'Submitted 1 day ago',  stages: ['done','act','pend'] },
]

const DOCS = [
  { name: 'student_id_card.pdf',  meta: 'PDF · 340 KB · Uploaded Apr 16' },
  { name: 'library_receipt.jpeg', meta: 'JPEG · 180 KB · Uploaded Apr 16' },
  { name: 'lab_manual.pdf',       meta: 'PDF · 1.2 MB · Uploaded Apr 16' },
]

const HEATMAP = [
  { dept: 'Library',      status: 'g', label: 'Cleared ✓' },
  { dept: 'Lab In-charge',status: 'g', label: 'Cleared ✓' },
  { dept: 'HOD',          status: 'y', label: 'Pending…'  },
  { dept: 'Accounts',     status: 'g', label: 'Cleared ✓' },
  { dept: 'Principal',    status: 'n', label: 'Waiting'   },
  { dept: 'Hostel',       status: 'g', label: 'Cleared ✓' },
]

const DUES = [
  { name: 'Neha Patel',  amt: 'Library · ₹340', status: 'red',   label: 'Unpaid' },
  { name: 'Karan Joshi', amt: 'Hostel · ₹800',  status: 'red',   label: 'Unpaid' },
  { name: 'Tanya Roy',   amt: 'Library · ₹120', status: 'green', label: 'Paid'   },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('pending')
  const [approved, setApproved] = useState([])
  const [studentsList, setStudentsList] = useState(DUMMY_STUDENTS)
  const [selected, setSelected] = useState(DUMMY_STUDENTS[0])
  const [toast, setToast] = useState({ msg: '', show: false })
  const [pendingCount, setPendingCount] = useState(18)
  const [clearedCount, setClearedCount] = useState(89)

  const adminType = "library_admin" // Hardcoded for hackathon demo

  function showToast(msg) {
    setToast({ msg, show: true })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2800)
  }

  useEffect(() => {
    // Fetch live pending requests from backend on load
    async function fetchPending() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/v1/admin/pending-clearances/${adminType}`)
        if (res.ok) {
           const liveData = await res.json()
           // Append live database objects to UI list
           const formatted = liveData.map(item => ({
              id: `db-${item.id}`,
              server_id: item.id,
              initials: 'DB',
              avClass: 'adm-av-p',
              name: `Student ID: ${item.student_id}`,
              roll: 'LIVE DB',
              meta: 'Fetched just now',
              stages: ['act','pend','pend']
           }))
           setStudentsList([...formatted, ...DUMMY_STUDENTS])
           setPendingCount(liveData.length + DUMMY_STUDENTS.length)
        }
      } catch (err) {
        console.error("Failed to connect to backend", err)
      }
    }
    fetchPending()
  }, [])

  async function handleApprove(student) {
    if (approved.includes(student.id)) return

    // If it's a real database item, update status in backend!
    if (student.server_id) {
       try {
           await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/v1/admin/update-clearance/${student.server_id}?admin_type=${adminType}&status=approved`, {
               method: 'PUT'
           })
       } catch (err) {
           console.error("Failed to approve online", err)
       }
    }

    setApproved(prev => [...prev, student.id])
    setPendingCount(p => Math.max(0, p - 1))
    setClearedCount(c => c + 1)
    showToast(`${student.name} approved — forwarded to next stage`)
  }

  function handleFlag(student) {
    showToast(`${student.name} flagged — add a comment to notify`)
  }

  return (
    <div className="adm-wrap">
      <style>{STYLES}</style>

      {/* TOPBAR */}
      <div className="adm-topbar">
        <div className="adm-logo" onClick={() => navigate('/')}>NEXUS</div>
        <div className="adm-info">
          <span className="adm-chip">HOD · Dept. of CS</span>
          <div className="adm-avatar">AD</div>
        </div>
      </div>

      {/* METRICS */}
      <div className="adm-metrics">
        <div className="adm-metric">
          <div className="adm-metric-tag">Total Applications</div>
          <div className="adm-metric-val green">124</div>
          <div className="adm-metric-sub">Batch 2024–25</div>
        </div>
        <div className="adm-metric">
          <div className="adm-metric-tag">Pending Review</div>
          <div className="adm-metric-val amber">{pendingCount}</div>
          <div className="adm-metric-sub">Awaiting your action</div>
        </div>
        <div className="adm-metric">
          <div className="adm-metric-tag">Fully Cleared</div>
          <div className="adm-metric-val green">{clearedCount}</div>
          <div className="adm-metric-sub">Certificates issued</div>
        </div>
        <div className="adm-metric">
          <div className="adm-metric-tag">Flagged / Dues</div>
          <div className="adm-metric-val red">17</div>
          <div className="adm-metric-sub">Action required</div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="adm-main">

        {/* LEFT */}
        <div className="adm-left">

          {/* APPLICATION LIST */}
          <div className="adm-card">
            <div className="adm-tabs">
              {['pending','flagged','cleared'].map(tab => (
                <button key={tab} className={`adm-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}{tab === 'pending' ? ' Approval' : tab === 'flagged' ? '' : ''}
                </button>
              ))}
            </div>
            {activeTab === 'pending' && (
              <div>
                {studentsList.map(s => (
                  <div key={s.id} className={`adm-app-row ${approved.includes(s.id) ? 'faded' : ''}`} onClick={() => setSelected(s)}>
                    <div className={`adm-av ${s.avClass}`}>{s.initials}</div>
                    <div className="adm-app-info">
                      <div className="adm-app-name">{s.name} <span>— {s.roll}</span></div>
                      <div className="adm-app-meta">{s.meta}</div>
                    </div>
                    <div className="adm-stages">
                      {['L','H','P'].map((lbl, i) => (
                        <div key={lbl} className={`adm-st ${s.stages[i]}`} title={['Lab','HOD','Principal'][i]}>{lbl}</div>
                      ))}
                    </div>
                    <div className="adm-act-btns">
                      <button className="adm-btn-sm adm-btn-app" onClick={e => { e.stopPropagation(); handleApprove(s) }}>Approve</button>
                      <button className="adm-btn-sm adm-btn-flg" onClick={e => { e.stopPropagation(); handleFlag(s) }}>Flag</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'flagged' && (
              <div>
                {[
                  { initials:'NP', avClass:'adm-av-a', name:'Neha Patel',  roll:'2021CS031', issue:'Library dues pending — ₹340', badge:'Dues Unpaid' },
                  { initials:'SK', avClass:'adm-av-g', name:'Sahil Khan',  roll:'2021CS066', issue:'Lab manual not uploaded',      badge:'Doc Missing' },
                ].map(s => (
                  <div key={s.roll} className="adm-app-row">
                    <div className={`adm-av ${s.avClass}`}>{s.initials}</div>
                    <div className="adm-app-info">
                      <div className="adm-app-name">{s.name} <span>— {s.roll}</span></div>
                      <div className="adm-app-meta warn">{s.issue}</div>
                    </div>
                    <span className="adm-badge red">{s.badge}</span>
                    <button className="adm-btn-sm adm-btn-flg" onClick={() => showToast(`Reminder sent to ${s.name}`)}>Resolve</button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'cleared' && (
              <div>
                {[
                  { initials:'MS', name:'Megha Singh',  roll:'2021CS044', date:'Apr 14, 2025' },
                  { initials:'VR', name:'Varun Reddy',  roll:'2021CS072', date:'Apr 12, 2025' },
                ].map(s => (
                  <div key={s.roll} className="adm-app-row">
                    <div className="adm-av adm-av-g">{s.initials}</div>
                    <div className="adm-app-info">
                      <div className="adm-app-name">{s.name} <span>— {s.roll}</span></div>
                      <div className="adm-app-meta">Certificate issued {s.date}</div>
                    </div>
                    <div className="adm-stages">
                      {['L','H','P'].map(l => <div key={l} className="adm-st done">{l}</div>)}
                    </div>
                    <span className="adm-badge green">Cleared</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DETAIL PANEL */}
          <div className="adm-card accent">
            <div className="adm-detail-head">
              <div className={`adm-av ${selected.avClass}`} style={{ width: 42, height: 42, fontSize: '0.75rem' }}>{selected.initials}</div>
              <div>
                <div className="adm-detail-name">{selected.name}</div>
                <div className="adm-detail-sub">{selected.roll} — B.Tech CS — Batch 2025</div>
              </div>
              <div className="adm-detail-status">Awaiting HOD</div>
            </div>
            <div className="adm-card-label">Uploaded Documents</div>
            {DOCS.map(doc => (
              <div key={doc.name} className="adm-doc-row">
                <div>
                  <div className="adm-doc-name">{doc.name}</div>
                  <div className="adm-doc-meta">{doc.meta}</div>
                </div>
                <button className="adm-btn-view" onClick={() => showToast(`Opening ${doc.name}`)}>View</button>
              </div>
            ))}
            <div className="adm-action-row">
              <button className="adm-btn-md adm-btn-solid" onClick={() => handleApprove(selected)}>
                Approve &amp; Forward to Principal →
              </button>
              <button className="adm-btn-md adm-btn-outline-red" onClick={() => showToast('Application flagged — add a comment')}>
                Flag with Comment
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="adm-right">

          {/* HEATMAP */}
          <div className="adm-card">
            <div className="adm-card-label">
              Live Heatmap · <span style={{ color: 'var(--green)' }}>{selected.name}</span>
            </div>
            <div className="adm-heatmap">
              {HEATMAP.map(h => (
                <div key={h.dept} className={`adm-hm ${h.status}`}>
                  <div className="adm-hm-dept">{h.dept}</div>
                  <div className="adm-hm-stat">{h.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DUES */}
          <div className="adm-card">
            <div className="adm-card-label">Dues Reconciliation</div>
            {DUES.map(d => (
              <div key={d.name} className="adm-dues-row">
                <div>
                  <div className="adm-dues-name">{d.name}</div>
                  <div className="adm-dues-amt">{d.amt}</div>
                </div>
                <span className={`adm-badge ${d.status}`}>{d.label}</span>
              </div>
            ))}
            <button className="adm-csv-btn" onClick={() => showToast('CSV upload triggered — import dues list')}>
              + Upload Dues CSV
            </button>
          </div>

          {/* NUDGES */}
          <div className="adm-card">
            <div className="adm-card-label">Email Nudges — Stale</div>
            {[
              { name: "Principal's Office", days: '3 days idle' },
              { name: 'Accounts Dept.',     days: '2 days idle' },
            ].map(n => (
              <div key={n.name} className="adm-nudge-row">
                <div className="adm-nudge-name">{n.name}</div>
                <div className="adm-nudge-days">{n.days}</div>
                <button className="adm-btn-nudge" onClick={() => showToast(`Reminder sent to ${n.name}`)}>Nudge</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOAST */}
      <div className={`adm-toast ${toast.show ? 'visible' : 'hidden'}`}>{toast.msg}</div>
    </div>
  )
}