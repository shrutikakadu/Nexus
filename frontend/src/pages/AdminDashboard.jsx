import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSubmissionsForAdmin, adminApprove, adminReject, onStoreUpdate, getAdminNotifications, adminMarkNotificationsRead, processDuesCSV } from '../utils/clearanceStore'
import DocumentViewer from '../components/DocumentViewer'

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



const HEATMAP = [
  { dept: 'Library',      status: 'g', label: 'Cleared ✓' },
  { dept: 'Lab',          status: 'g', label: 'Cleared ✓' },
  { dept: 'HOD',          status: 'y', label: 'Pending…'  },
  { dept: 'Accounts',     status: 'g', label: 'Cleared ✓' },
  { dept: 'Principal',    status: 'n', label: 'Waiting'   },
  { dept: 'Hostel',       status: 'g', label: 'Cleared ✓' },
]

const DUES = []

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('pending')
  const [approved, setApproved] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState({ msg: '', show: false })
  const [pendingCount, setPendingCount] = useState(0)
  const [clearedCount, setClearedCount] = useState(0)
  const [viewingDocs, setViewingDocs] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [flagModal, setFlagModal] = useState(null) // { student, reason: '' }
  const [csvLoading, setCsvLoading] = useState(false)

  const rawRole = localStorage.getItem('nexus_role') || 'library'
  const roleMap = { library: 'Library', lab: 'Lab', accounts: 'Accounts', hostel: 'Hostel', hod: 'HOD', principal: 'Principal' }
  const adminRole = roleMap[rawRole] || 'Library'
  const labelMap = { library: 'Library Admin', lab: 'Lab In-Charge', accounts: 'Accounts Dept', hostel: 'Hostel Warden', hod: 'HOD', principal: 'Principal' }
  const displayRole = labelMap[rawRole] || 'Admin'

  function showToast(msg) {
    setToast({ msg, show: true })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2800)
  }

  useEffect(() => {
    function load() {
      const subs = getSubmissionsForAdmin(adminRole)
      const formatted = subs.map(item => ({
        id: item.id,
        server_id: item.studentId,
        initials: item.initials,
        avClass: 'adm-av-p',
        name: item.studentName,
        roll: item.studentId,
        meta: item.documents.length > 0 ? `Uploaded ${item.documents.length} docs` : 'No docs yet',
        stages: ['done', 'act', 'pend'],
        clearanceStatus: item.clearanceStatus,
        documents: item.documents,
        dues: item.dues || []
      }))
      setStudentsList(formatted)

      const pending = formatted.filter(s => s.clearanceStatus[adminRole] === 'pending')
      const cleared = formatted.filter(s => s.clearanceStatus[adminRole] === 'approved')
      const flagged = formatted.filter(s => s.clearanceStatus[adminRole] === 'rejected')
      
      setPendingCount(pending.length)
      setClearedCount(cleared.length)

      let currentList = []
      if (activeTab === 'pending') currentList = pending
      if (activeTab === 'flagged') currentList = flagged
      if (activeTab === 'cleared') currentList = cleared

      if (selected) {
        const stillInTab = currentList.find(s => s.id === selected.id)
        if (stillInTab) setSelected(stillInTab)
        else setSelected(currentList.length > 0 ? currentList[0] : null)
      } else {
        setSelected(currentList.length > 0 ? currentList[0] : null)
      }

      const notifs = getAdminNotifications(adminRole)
      setNotifications(notifs)
      setUnreadNotifs(notifs.filter(n => !n.read).length)
    }
    load()
    return onStoreUpdate(load)
  }, [adminRole, activeTab, selected])

  async function handleApprove(student) {
    if (approved.includes(student.id)) return

    if (student.server_id) {
       const res = adminApprove(student.server_id, adminRole)
       if (res.success) {
         setApproved(prev => [...prev, student.id])
         showToast(`${student.name} approved — forwarded to next stage`)
         setSelected(null)
       } else {
         showToast(res.message, 'error')
       }
    }
  }

  function handleFlag(student) {
    setFlagModal({ student, reason: '' })
  }

  function confirmFlag() {
    if (!flagModal?.reason) { showToast('Please enter a reason', 'error'); return }
    const { student, reason } = flagModal
    if (student.server_id) {
       adminReject(student.server_id, adminRole, reason)
    }
    showToast(`${student.name} flagged with comment.`)
    setFlagModal(null)
    setSelected(null)
  }

  function handleCsvUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvLoading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      const count = processDuesCSV(text, adminRole)
      showToast(`Successfully processed ${count} dues from CSV for ${adminRole}`)
      setCsvLoading(false)
    }
    reader.readAsText(file)
  }

  return (
    <div className="adm-wrap">
      <style>{STYLES}</style>

      {/* TOPBAR */}
      <div className="adm-topbar">
        <div className="adm-logo" onClick={() => navigate('/')}>NEXUS</div>
        <div className="adm-info">
          {unreadNotifs > 0 && (
            <div 
              style={{ background: 'var(--amber)', color: '#fff', borderRadius: 100, fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', cursor: 'pointer' }}
              onClick={() => { adminMarkNotificationsRead(adminRole); showToast('Notifications marked as read') }}
            >
              {unreadNotifs} New Alerts
            </div>
          )}
          <span className="adm-chip">{displayRole}</span>
          <div className="adm-avatar">{adminRole.slice(0,2).toUpperCase()}</div>
        </div>
      </div>

      {/* METRICS */}
      <div className="adm-metrics">
        <div className="adm-metric">
          <div className="adm-metric-tag">Total Applications</div>
          <div className="adm-metric-val green">{studentsList.length}</div>
          <div className="adm-metric-sub">Batch 2025–26</div>
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
          <div className="adm-metric-val red">{studentsList.filter(s => s.clearanceStatus?.[adminRole] === 'rejected').length}</div>
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
                {studentsList.filter(s => s.clearanceStatus?.[adminRole] === 'pending').length === 0 && <div className="adm-doc-meta" style={{padding: '1rem'}}>No pending applications</div>}
                {studentsList.filter(s => s.clearanceStatus?.[adminRole] === 'pending').map(s => (
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
                {studentsList.filter(s => s.clearanceStatus?.[adminRole] === 'rejected').length === 0 && <div className="adm-doc-meta" style={{padding: '1rem'}}>No flagged applications</div>}
                {studentsList.filter(s => s.clearanceStatus?.[adminRole] === 'rejected').map(s => (
                  <div key={s.id} className="adm-app-row" onClick={() => setSelected(s)}>
                    <div className={`adm-av ${s.avClass}`}>{s.initials}</div>
                    <div className="adm-app-info">
                      <div className="adm-app-name">{s.name} <span>— {s.roll}</span></div>
                      <div className="adm-app-meta warn">Action required</div>
                    </div>
                    <span className="adm-badge red">Flagged</span>
                    <button className="adm-btn-sm adm-btn-app" onClick={e => { e.stopPropagation(); handleApprove(s) }}>Resolve & Approve</button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'cleared' && (
              <div>
                {studentsList.filter(s => s.clearanceStatus?.[adminRole] === 'approved').length === 0 && <div className="adm-doc-meta" style={{padding: '1rem'}}>No cleared applications</div>}
                {studentsList.filter(s => s.clearanceStatus?.[adminRole] === 'approved').map(s => (
                  <div key={s.id} className="adm-app-row" onClick={() => setSelected(s)}>
                    <div className={`adm-av ${s.avClass}`}>{s.initials}</div>
                    <div className="adm-app-info">
                      <div className="adm-app-name">{s.name} <span>— {s.roll}</span></div>
                      <div className="adm-app-meta">Cleared</div>
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
              {selected && (
                <>
                  <div className={`adm-av ${selected.avClass}`} style={{ width: 42, height: 42, fontSize: '0.75rem' }}>{selected.initials}</div>
                  <div>
                    <div className="adm-detail-name">{selected.name}</div>
                    <div className="adm-detail-sub">{selected.roll}</div>
                  </div>
                  <div className="adm-detail-status">{selected.clearanceStatus?.[adminRole] || 'Pending'}</div>
                </>
              )}
            </div>
            <div className="adm-card-label">Uploaded Documents</div>
            {selected && selected.documents && selected.documents.length > 0 ? selected.documents.map(doc => (
              <div key={doc.docId} className="adm-doc-row">
                <div>
                  <div className="adm-doc-name">{doc.name}</div>
                  <div className="adm-doc-meta">{doc.type} · {doc.size}</div>
                </div>
                <button className="adm-btn-view" onClick={() => setViewingDocs({ studentId: selected.server_id, studentName: selected.name })}>View</button>
              </div>
            )) : <div className="adm-doc-meta" style={{marginBottom: '1rem'}}>No documents uploaded yet</div>}
            {selected && (
              <div className="adm-action-row">
                <button className="adm-btn-md adm-btn-solid" onClick={() => handleApprove(selected)}>
                  Approve &amp; Forward to Principal →
                </button>
                <button className="adm-btn-md adm-btn-outline-red" onClick={() => handleFlag(selected)}>
                  Flag with Comment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="adm-right">

          {/* HEATMAP */}
          {adminRole !== 'HOD' && adminRole !== 'Principal' && (
            <div className="adm-card">
              <div className="adm-card-label">
                Live Heatmap {selected && <>· <span style={{ color: 'var(--green)' }}>{selected.name}</span></>}
              </div>
              <div className="adm-heatmap">
                {HEATMAP.map(h => {
                  const s = selected?.clearanceStatus?.[h.dept] || 'pending'
                  const statusStr = s === 'approved' ? 'g' : s === 'rejected' ? 'r' : 'n'
                  const labelStr = s === 'approved' ? 'Cleared ✓' : s === 'rejected' ? 'Rejected ✗' : 'Waiting'
                  return (
                    <div key={h.dept} className={`adm-hm ${statusStr}`}>
                      <div className="adm-hm-dept">{h.dept}</div>
                      <div className="adm-hm-stat">{labelStr}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* DUES */}
          <div className="adm-card">
            <div className="adm-card-label">Dues Reconciliation — {selected?.name || 'Student'}</div>
            {selected && selected.dues && selected.dues.length > 0 ? selected.dues.map(d => (
              <div key={d.id} className="adm-dues-row">
                <div>
                  <div className="adm-dues-name">{d.item}</div>
                  <div className="adm-dues-amt">{d.dept} · ₹{d.amount}</div>
                </div>
                <span className={`adm-badge ${d.paid ? 'green' : 'red'}`}>{d.paid ? 'Paid ✓' : 'Unpaid ✗'}</span>
              </div>
            )) : <div className="adm-doc-meta" style={{padding: '0.5rem 0'}}>No dues found</div>}
            <input 
              id="csv-upload" 
              type="file" 
              accept=".csv" 
              style={{ display: 'none' }} 
              onChange={handleCsvUpload} 
            />
            {adminRole !== 'Principal' && (
              <button 
                className="adm-csv-btn" 
                onClick={() => document.getElementById('csv-upload').click()}
                disabled={csvLoading}
              >
                {csvLoading ? '⌛ Processing...' : '+ Upload Dues CSV'}
              </button>
            )}
          </div>

          {/* NUDGES */}
          <div className="adm-card">
            <div className="adm-card-label">Role-Based Notifications</div>
            {notifications.length > 0 ? notifications.slice(0, 5).map(n => (
              <div key={n.id} className="adm-nudge-row" style={{ opacity: n.read ? 0.6 : 1 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: n.read ? 'var(--border2)' : 'var(--amber)', flexShrink: 0 }} />
                <div className="adm-nudge-name" style={{ fontSize: '0.75rem', fontWeight: n.read ? 400 : 600 }}>{n.msg}</div>
                <div className="adm-nudge-days" style={{ fontSize: '0.6rem' }}>{n.time}</div>
              </div>
            )) : <div className="adm-doc-meta" style={{padding: '0.5rem 0'}}>No recent alerts</div>}
          </div>
        </div>
      </div>

      {/* TOAST & MODALS */}
      <div className={`adm-toast ${toast.show ? 'visible' : 'hidden'}`}>{toast.msg}</div>
      
      {/* FLAG REASON MODAL */}
      {flagModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '18px', width: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 1rem', fontFamily: 'var(--serif)' }}>Flag Application</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text3)', marginBottom: '1rem' }}>
              Explain why you are flagging <strong>{flagModal.student.name}</strong>'s clearance:
            </p>
            <textarea 
              style={{ width: '100%', height: '100px', borderRadius: '10px', border: '1px solid var(--border)', padding: '0.75rem', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', marginBottom: '1.25rem' }}
              placeholder="e.g. Missing library book: 'Advanced Calculus', Page 42 torn..."
              value={flagModal.reason}
              onChange={e => setFlagModal({...flagModal, reason: e.target.value})}
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="adm-btn-md" style={{ flex: 1, borderColor: 'var(--border)', color: 'var(--text2)' }} onClick={() => setFlagModal(null)}>Cancel</button>
              <button className="adm-btn-md adm-btn-solid" style={{ flex: 1, background: 'var(--red)', borderColor: 'var(--red)' }} onClick={confirmFlag}>Submit Flag</button>
            </div>
          </div>
        </div>
      )}

      {viewingDocs && <DocumentViewer role={adminRole} studentId={viewingDocs.studentId} studentName={viewingDocs.studentName} onClose={() => setViewingDocs(null)} />}
    </div>
  )
}