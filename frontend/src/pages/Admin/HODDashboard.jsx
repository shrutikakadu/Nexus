import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import StatsCard from '../../components/StatsCard'
import ClearanceTable from '../../components/ClearanceTable'
import ClearanceHeatmap from '../../components/ClearanceHeatmap'
import NotificationPanel from '../../components/NotificationPanel'
import DocumentViewer from '../../components/DocumentViewer'
import { getSubmissionsForAdmin, adminApprove, adminReject, onStoreUpdate } from '../../utils/clearanceStore'
import '../../styles/admin.css'

const ALL_STUDENTS = [
    { id: 's1', initials: 'TP', avatarClass: 'green-bg', name: 'Tanaya Patel', roll: '2021CS001', project: 'Submitted', internship: 'Completed', dept: 'CS', statusColor: 'amber', statusLabel: 'Pending HOD', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'approved', Hostel: 'approved', HOD: 'pending', Principal: 'locked' } },
    { id: 's2', initials: 'HS', avatarClass: 'blue-bg', name: 'Hritani Sharma', roll: '2021CS042', project: 'Submitted', internship: 'Completed', dept: 'CS', statusColor: 'amber', statusLabel: 'Pending HOD', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'approved', Hostel: 'approved', HOD: 'pending', Principal: 'locked' } },
    { id: 's3', initials: 'RK', avatarClass: 'amber-bg', name: 'Rohit Kumar', roll: '2021CS017', project: 'Not Submitted', internship: 'Completed', dept: 'CS', statusColor: 'red', statusLabel: 'Project Pending', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'approved', Hostel: 'approved', HOD: 'pending', Principal: 'locked' } },
    { id: 's4', initials: 'MS', avatarClass: 'purple-bg', name: 'Megha Singh', roll: '2021CS044', project: 'Submitted', internship: 'Not Completed', dept: 'CS', statusColor: 'red', statusLabel: 'Internship Pending', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'approved', Hostel: 'approved', HOD: 'pending', Principal: 'locked' } },
    { id: 's5', initials: 'VR', avatarClass: 'green-bg', name: 'Varun Reddy', roll: '2021CS072', project: 'Submitted', internship: 'Completed', dept: 'CS', statusColor: 'amber', statusLabel: 'Pending HOD', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'approved', Hostel: 'approved', HOD: 'pending', Principal: 'locked' } },
]

const COLUMNS = [
    { key: 'student', label: 'Student' },
    { key: 'project', label: 'Project', render: (r) => <span className={`badge ${r.project === 'Submitted' ? 'green' : 'red'}`}>{r.project}</span> },
    { key: 'internship', label: 'Internship', render: (r) => <span className={`badge ${r.internship === 'Completed' ? 'green' : 'red'}`}>{r.internship}</span> },
    { key: 'status', label: 'Status' },
]

export default function HODDashboard() {
    const [activeItem, setActiveItem] = useState('dashboard')
    const [approvedIds, setApprovedIds] = useState([])
    const [rejectedIds, setRejectedIds] = useState([])
    const [selected, setSelected] = useState(ALL_STUDENTS[0])
    const [toast, setToast] = useState({ msg: '', show: false })
    const [pendingCount, setPendingCount] = useState(ALL_STUDENTS.length)
    const [comment, setComment] = useState('')
    const [storeSubmissions, setStoreSubmissions] = useState([])
    const [viewingDocs, setViewingDocs] = useState(null)

    useEffect(() => {
        function loadSubmissions() { setStoreSubmissions(getSubmissionsForAdmin('HOD')) }
        loadSubmissions()
        return onStoreUpdate(loadSubmissions)
    }, [])

    function showToast(msg) { setToast({ msg, show: true }); setTimeout(() => setToast(t => ({ ...t, show: false })), 2800) }

    function handleApprove(s) {
        if (approvedIds.includes(s.id)) return
        if (s.project !== 'Submitted' || s.internship !== 'Completed') { showToast(`⚠️ Cannot approve — ${s.name} has incomplete academic requirements`); return }
        setApprovedIds(p => [...p, s.id]); setPendingCount(p => Math.max(0, p - 1))
        if (s.studentId) adminApprove(s.studentId, 'HOD', comment || 'HOD approval granted. Forwarded to Principal.')
        showToast(`✓ HOD approval granted for ${s.name} — forwarded to Principal`)
    }
    function handleReject(s) {
        setRejectedIds(p => [...p, s.id])
        if (s.studentId) adminReject(s.studentId, 'HOD', comment || 'HOD clearance rejected.')
        showToast(`✗ Rejected with comment for ${s.name}`)
    }

    const storeStudents = storeSubmissions
        .filter(s => s.relevantDocs.length > 0 || s.statusForRole === 'pending')
        .map(s => ({
            id: `store_${s.studentId}`, studentId: s.studentId, initials: s.initials, avatarClass: s.avatarClass || 'blue-bg',
            name: s.studentName, roll: s.studentId, project: 'Submitted', internship: 'Completed', dept: 'CS',
            statusColor: s.statusForRole === 'approved' ? 'green' : 'amber',
            statusLabel: s.statusForRole === 'approved' ? 'HOD Approved' : 'Pending HOD',
            heatmap: s.clearanceStatus, documents: s.relevantDocs, fromStore: true,
        }))
    const allStudents = [...ALL_STUDENTS, ...storeStudents.filter(ss => !ALL_STUDENTS.some(s => s.roll === ss.roll))]

    const tableData = allStudents.map(s => ({
        ...s,
        status: approvedIds.includes(s.id) ? 'approved' : rejectedIds.includes(s.id) ? 'rejected' : 'pending',
        statusColor: approvedIds.includes(s.id) ? 'green' : rejectedIds.includes(s.id) ? 'red' : s.statusColor,
        statusLabel: approvedIds.includes(s.id) ? 'HOD Approved' : rejectedIds.includes(s.id) ? 'Rejected' : s.statusLabel,
    }))

    return (
        <div className="admin-layout">
            <AdminSidebar role="hod" activeItem={activeItem} onNavigate={setActiveItem} badges={{ pending: pendingCount, notifs: 4 }} />
            <main className="admin-content">
                <div className="admin-header">
                    <div className="admin-header-left"><h1>HOD Dashboard</h1><p>Academic approval — Dept. of Computer Science</p></div>
                    <div className="admin-header-actions"><button className="btn btn-outline" onClick={() => showToast('Batch report exported')}>↓ Batch Report</button></div>
                </div>
                {activeItem === 'students' && (
                    <div className="card"><div className="card-label">Student Records</div><p style={{color: 'var(--text3)'}}>Student directory module coming soon.</p></div>
                )}
                {activeItem === 'notifications' && (
                    <div style={{ maxWidth: 600 }}><NotificationPanel onSend={msg => showToast(`Notification sent: "${msg}"`)} /></div>
                )}
                {activeItem === 'reports' && (
                    <div className="card"><div className="card-label">Reports & Analytics</div><p style={{color: 'var(--text3)'}}>Export options and analytics module coming soon.</p></div>
                )}
                {activeItem === 'heatmap' && (
                    <ClearanceHeatmap students={ALL_STUDENTS} />
                )}

                {(activeItem === 'dashboard' || activeItem === 'clearances') && (
                    <>
                        {activeItem === 'dashboard' && (
                            <div className="stats-grid">
                                <StatsCard label="Dept. Students Pending" value={pendingCount} subtitle="Awaiting HOD approval" color="amber" />
                                <StatsCard label="Projects Submitted" value="118/124" subtitle="This batch" color="blue" />
                                <StatsCard label="Internships Completed" value="120/124" subtitle="Verified" color="green" />
                                <StatsCard label="HOD Approved" value={approvedIds.length} subtitle="Forwarded to Principal" color="green" />
                            </div>
                        )}
                        <div className="content-grid">
                            <div className="content-left">
                                <ClearanceTable columns={COLUMNS} data={tableData} approvedIds={approvedIds} onApprove={handleApprove} onReject={handleReject} onRowClick={setSelected}
                                    renderActions={(row) => (
                                        <div className="action-group">
                                            <button className="btn btn-sm btn-outline" onClick={e => { e.stopPropagation(); row.studentId ? setViewingDocs({ studentId: row.studentId, studentName: row.name }) : showToast(`Viewing project for ${row.name}`) }}>
                                                {row.fromStore ? '📄 View Docs' : '📁 View Project'}
                                            </button>
                                            <button className="btn btn-sm btn-approve" onClick={e => { e.stopPropagation(); handleApprove(row) }}>✓ Approve</button>
                                            <button className="btn btn-sm btn-reject" onClick={e => { e.stopPropagation(); handleReject(row) }}>✗ Reject</button>
                                        </div>
                                    )}
                                />
                                <div className="detail-card">
                                    <div className="detail-header">
                                        <div className={`student-avatar ${selected.avatarClass}`} style={{ width: 44, height: 44 }}>{selected.initials}</div>
                                        <div><div className="detail-name">{selected.name}</div><div className="detail-sub">{selected.roll} — B.Tech {selected.dept} — Batch 2025</div></div>
                                        <div className={`detail-status ${selected.project === 'Submitted' && selected.internship === 'Completed' ? 'approved' : 'pending'}`}>
                                            {selected.project === 'Submitted' && selected.internship === 'Completed' ? 'Eligible' : 'Incomplete'}
                                        </div>
                                    </div>
                                    <div className="detail-section-label">Academic Details</div>
                                    <div className="detail-info-grid">
                                        <div className="detail-info-item"><div className="detail-info-label">Project Submission</div><div className="detail-info-value" style={{ color: selected.project === 'Submitted' ? 'var(--green)' : 'var(--red)' }}>{selected.project}</div></div>
                                        <div className="detail-info-item"><div className="detail-info-label">Internship</div><div className="detail-info-value" style={{ color: selected.internship === 'Completed' ? 'var(--green)' : 'var(--red)' }}>{selected.internship}</div></div>
                                        <div className="detail-info-item"><div className="detail-info-label">CGPA</div><div className="detail-info-value">8.7 / 10.0</div></div>
                                        <div className="detail-info-item"><div className="detail-info-label">Backlogs</div><div className="detail-info-value" style={{ color: 'var(--green)' }}>None</div></div>
                                    </div>
                                    <div style={{ marginTop: '1rem' }}>
                                        <div className="detail-section-label" style={{ marginTop: 0 }}>Rejection Comment (if rejecting)</div>
                                        <textarea
                                            placeholder="Add reason for rejection..."
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            style={{ width: '100%', padding: '0.6rem 0.9rem', borderRadius: 8, border: '1.5px solid var(--border)', fontFamily: 'var(--sans)', fontSize: '0.82rem', color: 'var(--text)', resize: 'vertical', minHeight: 60, boxSizing: 'border-box', outline: 'none' }}
                                        />
                                    </div>
                                    <div className="detail-actions">
                                        <button className="btn btn-solid" onClick={() => handleApprove(selected)}>✓ Approve Graduation →</button>
                                        <button className="btn btn-reject" onClick={() => handleReject(selected)}>✗ Reject with Comment</button>
                                    </div>
                                </div>
                            </div>
                            <div className="content-right">
                                <ClearanceHeatmap selectedStudent={selected} />
                            </div>
                        </div>
                    </>
                )}
            </main>
            <div className={`admin-toast ${toast.show ? 'visible' : 'hidden'}`}>{toast.msg}</div>
            {viewingDocs && <DocumentViewer role="HOD" studentId={viewingDocs.studentId} studentName={viewingDocs.studentName} onClose={() => setViewingDocs(null)} />}
        </div>
    )
}
