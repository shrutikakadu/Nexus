import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import StatsCard from '../../components/StatsCard'
import ClearanceTable from '../../components/ClearanceTable'
import ClearanceHeatmap from '../../components/ClearanceHeatmap'
import NotificationPanel from '../../components/NotificationPanel'
import DocumentViewer from '../../components/DocumentViewer'
import { getSubmissionsForAdmin, adminApprove, adminReject, onStoreUpdate } from '../../utils/clearanceStore'
import '../../styles/admin.css'

const STUDENTS = [
    { id: 's1', initials: 'TP', avatarClass: 'green-bg', name: 'Tanaya Patel', roll: '2021CS001', labManual: 'Submitted', equipment: 'Returned', statusColor: 'amber', statusLabel: 'Pending', heatmap: { Library: 'approved', Lab: 'pending', Accounts: 'approved', Hostel: 'approved', HOD: 'pending', Principal: 'locked' } },
    { id: 's2', initials: 'HS', avatarClass: 'blue-bg', name: 'Hritani Sharma', roll: '2021CS042', labManual: 'Not Submitted', equipment: 'Pending', statusColor: 'red', statusLabel: 'Incomplete', heatmap: { Library: 'approved', Lab: 'pending', Accounts: 'pending', Hostel: 'approved', HOD: 'locked', Principal: 'locked' } },
    { id: 's3', initials: 'RK', avatarClass: 'amber-bg', name: 'Rohit Kumar', roll: '2021CS017', labManual: 'Submitted', equipment: 'Pending', statusColor: 'amber', statusLabel: 'Pending', heatmap: { Library: 'approved', Lab: 'pending', Accounts: 'approved', Hostel: 'locked', HOD: 'locked', Principal: 'locked' } },
    { id: 's4', initials: 'SK', avatarClass: 'purple-bg', name: 'Sahil Khan', roll: '2021CS066', labManual: 'Submitted', equipment: 'Returned', statusColor: 'amber', statusLabel: 'Pending', heatmap: { Library: 'approved', Lab: 'pending', Accounts: 'approved', Hostel: 'approved', HOD: 'locked', Principal: 'locked' } },
]

const COLUMNS = [
    { key: 'student', label: 'Student' },
    { key: 'labManual', label: 'Lab Manual', render: (r) => <span className={`badge ${r.labManual === 'Submitted' ? 'green' : 'red'}`}>{r.labManual}</span> },
    { key: 'equipment', label: 'Equipment', render: (r) => <span className={`badge ${r.equipment === 'Returned' ? 'green' : 'amber'}`}>{r.equipment}</span> },
    { key: 'status', label: 'Status' },
]

export default function LabDashboard() {
    const [activeItem, setActiveItem] = useState('dashboard')
    const [approvedIds, setApprovedIds] = useState([])
    const [rejectedIds, setRejectedIds] = useState([])
    const [selected, setSelected] = useState(STUDENTS[0])
    const [toast, setToast] = useState({ msg: '', show: false })
    const [pendingCount, setPendingCount] = useState(STUDENTS.length)
    const [storeSubmissions, setStoreSubmissions] = useState([])
    const [viewingDocs, setViewingDocs] = useState(null)

    useEffect(() => {
        function loadSubmissions() { setStoreSubmissions(getSubmissionsForAdmin('Lab')) }
        loadSubmissions()
        return onStoreUpdate(loadSubmissions)
    }, [])

    function showToast(msg) { setToast({ msg, show: true }); setTimeout(() => setToast(t => ({ ...t, show: false })), 2800) }

    function handleApprove(s) {
        if (approvedIds.includes(s.id)) return
        if (s.labManual !== 'Submitted' || s.equipment !== 'Returned') { showToast(`⚠️ Cannot approve — ${s.name} has pending lab submissions`); return }
        setApprovedIds(p => [...p, s.id]); setPendingCount(p => Math.max(0, p - 1))
        if (s.studentId) adminApprove(s.studentId, 'Lab', 'Lab clearance approved. All equipment returned.')
        showToast(`✓ Lab clearance approved for ${s.name}`)
    }
    function handleReject(s) {
        setRejectedIds(p => [...p, s.id])
        if (s.studentId) adminReject(s.studentId, 'Lab', 'Lab clearance rejected.')
        showToast(`✗ Lab clearance rejected for ${s.name}`)
    }

    const storeStudents = storeSubmissions
        .filter(s => s.relevantDocs.length > 0 || s.statusForRole === 'pending')
        .map(s => ({
            id: `store_${s.studentId}`, studentId: s.studentId, initials: s.initials, avatarClass: s.avatarClass || 'blue-bg',
            name: s.studentName, roll: s.studentId, labManual: 'Submitted', equipment: 'Returned',
            statusColor: s.statusForRole === 'approved' ? 'green' : 'amber',
            statusLabel: s.statusForRole === 'approved' ? 'Cleared' : 'Pending',
            heatmap: s.clearanceStatus, documents: s.relevantDocs, fromStore: true,
        }))
    const allStudents = [...STUDENTS, ...storeStudents.filter(ss => !STUDENTS.some(s => s.roll === ss.roll))]

    const tableData = allStudents.map(s => ({
        ...s,
        status: approvedIds.includes(s.id) ? 'approved' : rejectedIds.includes(s.id) ? 'rejected' : 'pending',
        statusColor: approvedIds.includes(s.id) ? 'green' : rejectedIds.includes(s.id) ? 'red' : s.statusColor,
        statusLabel: approvedIds.includes(s.id) ? 'Cleared' : rejectedIds.includes(s.id) ? 'Rejected' : s.statusLabel,
    }))

    return (
        <div className="admin-layout">
            <AdminSidebar role="lab" activeItem={activeItem} onNavigate={setActiveItem} badges={{ pending: pendingCount, notifs: 1 }} />
            <main className="admin-content">
                <div className="admin-header">
                    <div className="admin-header-left"><h1>Lab In-Charge Dashboard</h1><p>Verify lab manual submissions and equipment returns</p></div>
                    <div className="admin-header-actions"><button className="btn btn-outline" onClick={() => showToast('Report exported')}>↓ Export</button></div>
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

                {(activeItem === 'dashboard' || activeItem === 'clearances') && (
                    <>
                        {activeItem === 'dashboard' && (
                            <div className="stats-grid">
                                <StatsCard label="Clearances Pending" value={pendingCount} subtitle="Awaiting your action" color="amber" />
                                <StatsCard label="Equipment Pending" value="3" subtitle="Not yet returned" color="red" />
                                <StatsCard label="Manuals Submitted" value="108/124" subtitle="This batch" color="blue" />
                                <StatsCard label="Cleared This Week" value="21" subtitle="All requirements met" color="green" />
                            </div>
                        )}
                        <div className="content-left">
                                <ClearanceTable columns={COLUMNS} data={tableData} approvedIds={approvedIds} onApprove={handleApprove} onReject={handleReject} onRowClick={setSelected}
                                    renderActions={(row) => (
                                        <div className="action-group">
                                            <button className="btn btn-sm btn-outline" onClick={e => { e.stopPropagation(); row.studentId ? setViewingDocs({ studentId: row.studentId, studentName: row.name }) : showToast(`Viewing submission for ${row.name}`) }}>
                                                {row.fromStore ? '📄 View Docs' : 'View'}
                                            </button>
                                            <button className="btn btn-sm btn-approve" onClick={e => { e.stopPropagation(); handleApprove(row) }}>✓ Approve</button>
                                            <button className="btn btn-sm btn-reject" onClick={e => { e.stopPropagation(); handleReject(row) }}>✗ Reject</button>
                                        </div>
                                    )}
                                />
                                <div className="detail-card">
                                    <div className="detail-header">
                                        <div className={`student-avatar ${selected.avatarClass}`} style={{ width: 44, height: 44 }}>{selected.initials}</div>
                                        <div><div className="detail-name">{selected.name}</div><div className="detail-sub">{selected.roll} — B.Tech CS — Batch 2025</div></div>
                                        <div className={`detail-status ${selected.labManual === 'Submitted' && selected.equipment === 'Returned' ? 'approved' : 'pending'}`}>
                                            {selected.labManual === 'Submitted' && selected.equipment === 'Returned' ? 'Ready to Clear' : 'Incomplete'}
                                        </div>
                                    </div>
                                    <div className="detail-section-label">Lab Submission Details</div>
                                    <div className="detail-info-grid">
                                        <div className="detail-info-item"><div className="detail-info-label">Lab Manual</div><div className="detail-info-value" style={{ color: selected.labManual === 'Submitted' ? 'var(--green)' : 'var(--red)' }}>{selected.labManual}</div></div>
                                        <div className="detail-info-item"><div className="detail-info-label">Equipment</div><div className="detail-info-value" style={{ color: selected.equipment === 'Returned' ? 'var(--green)' : 'var(--amber)' }}>{selected.equipment}</div></div>
                                        <div className="detail-info-item"><div className="detail-info-label">Lab Assigned</div><div className="detail-info-value">Lab B — Network Lab</div></div>
                                        <div className="detail-info-item"><div className="detail-info-label">Submission Date</div><div className="detail-info-value">Apr 14, 2025</div></div>
                                    </div>
                                    <div className="detail-actions">
                                        <button className="btn btn-solid" onClick={() => handleApprove(selected)}>✓ Approve Lab Clearance →</button>
                                        <button className="btn btn-reject" onClick={() => handleReject(selected)}>✗ Reject</button>
                                    </div>
                                </div>
                        </div>
                    </>
                )}
            </main>
            <div className={`admin-toast ${toast.show ? 'visible' : 'hidden'}`}>{toast.msg}</div>
            {viewingDocs && <DocumentViewer role="Lab" studentId={viewingDocs.studentId} studentName={viewingDocs.studentName} onClose={() => setViewingDocs(null)} />}
        </div>
    )
}
