import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import StatsCard from '../../components/StatsCard'
import ClearanceTable from '../../components/ClearanceTable'
import NotificationPanel from '../../components/NotificationPanel'
import DocumentViewer from '../../components/DocumentViewer'
import { getSubmissionsForAdmin, adminApprove, adminReject, onStoreUpdate } from '../../utils/clearanceStore'
import '../../styles/admin.css'

const ALL_STUDENTS = [
    { id: 's1', initials: 'TP', avatarClass: 'green-bg', name: 'Tanaya Patel', roll: '2021CS001', project: 'Submitted', internship: 'Completed', statusColor: 'amber', statusLabel: 'Pending HOD', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'approved', Hostel: 'approved', HOD: 'pending', Principal: 'locked' } },
    { id: 's2', initials: 'HS', avatarClass: 'blue-bg', name: 'Hritani Sharma', roll: '2021CS042', project: 'Submitted', internship: 'Completed', statusColor: 'amber', statusLabel: 'Pending HOD', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'approved', Hostel: 'approved', HOD: 'pending', Principal: 'locked' } },
    { id: 's3', initials: 'RK', avatarClass: 'amber-bg', name: 'Rohit Kumar', roll: '2021CS017', project: 'Pending', internship: 'In Progress', statusColor: 'red', statusLabel: 'Academic Pending', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'approved', Hostel: 'approved', HOD: 'pending', Principal: 'locked' } },
]

const COLUMNS = [
    { key: 'student', label: 'Student' },
    { key: 'project', label: 'Project', render: (r) => <span className={`badge ${r.project === 'Submitted' ? 'green' : 'amber'}`}>{r.project}</span> },
    { key: 'internship', label: 'Internship', render: (r) => <span className={`badge ${r.internship === 'Completed' ? 'green' : 'amber'}`}>{r.internship}</span> },
    { key: 'status', label: 'Status' },
]

export default function HODDashboard() {
    const [activeItem, setActiveItem] = useState('dashboard')
    const [approvedIds, setApprovedIds] = useState([])
    const [rejectedIds, setRejectedIds] = useState([])
    const [selected, setSelected] = useState(ALL_STUDENTS[0])
    const [toast, setToast] = useState({ msg: '', show: false })
    const [pendingCount, setPendingCount] = useState(ALL_STUDENTS.length)
    const [viewingDocs, setViewingDocs] = useState(null)
    const [flagModal, setFlagModal] = useState(null)
    const [storeSubmissions, setStoreSubmissions] = useState([])

    useEffect(() => {
        function loadSubmissions() { setStoreSubmissions(getSubmissionsForAdmin('HOD')) }
        loadSubmissions()
        return onStoreUpdate(loadSubmissions)
    }, [])

    function showToast(msg) { setToast({ msg, show: true }); setTimeout(() => setToast(t => ({ ...t, show: false })), 2800) }

    function handleApprove(s) {
        if (approvedIds.includes(s.id)) return
        setApprovedIds(p => [...p, s.id]); setPendingCount(p => Math.max(0, p - 1))
        if (s.studentId) adminApprove(s.studentId, 'HOD', 'HOD academic clearance granted.')
        showToast(`✓ HOD approval granted for ${s.name} — forwarded to Principal`)
    }
    function handleReject(s) {
        setFlagModal({ student: s, reason: '' })
    }

    function confirmReject() {
        if (!flagModal?.reason) { showToast('Please enter a reason'); return }
        const s = flagModal.student
        setRejectedIds(p => [...p, s.id])
        if (s.studentId) adminReject(s.studentId, 'HOD', flagModal.reason)
        showToast(`✗ Rejected with comment for ${s.name}`)
        setFlagModal(null)
    }

    const storeStudents = storeSubmissions
        .filter(s => s.relevantDocs.length > 0 || s.statusForRole === 'pending')
        .map(s => ({
            id: `store_${s.studentId}`, studentId: s.studentId, initials: s.initials, avatarClass: s.avatarClass || 'blue-bg',
            name: s.studentName, roll: s.studentId, project: 'Submitted', internship: 'Completed',
            statusColor: s.statusForRole === 'approved' ? 'green' : 'amber',
            statusLabel: s.statusForRole === 'approved' ? 'HOD Cleared' : 'Pending HOD',
            heatmap: s.clearanceStatus, documents: s.relevantDocs, fromStore: true,
        }))
    const allStudents = [...ALL_STUDENTS, ...storeStudents.filter(ss => !ALL_STUDENTS.some(s => s.roll === ss.roll))]

    const tableData = allStudents.map(s => ({
        ...s,
        status: approvedIds.includes(s.id) ? 'approved' : rejectedIds.includes(s.id) ? 'rejected' : 'pending',
        statusColor: approvedIds.includes(s.id) ? 'green' : rejectedIds.includes(s.id) ? 'red' : s.statusColor,
        statusLabel: approvedIds.includes(s.id) ? 'HOD Cleared' : rejectedIds.includes(s.id) ? 'Rejected' : s.statusLabel,
    }))

    return (
        <div className="admin-layout">
            <AdminSidebar role="hod" activeItem={activeItem} onNavigate={setActiveItem} badges={{ pending: pendingCount, notifs: 3 }} />
            <main className="admin-content">
                <div className="admin-header">
                    <div className="admin-header-left"><h1>HOD Dashboard</h1><p>Department of Computer Science — Academic clearance &amp; project review</p></div>
                    <div className="admin-header-actions"><button className="btn btn-outline" onClick={() => showToast('Report exported')}>↓ Export</button></div>
                </div>

                {(activeItem === 'dashboard' || activeItem === 'clearances') && (
                    <>
                        {activeItem === 'dashboard' && (
                            <div className="stats-grid">
                                <StatsCard label="Pending Clearances" value={pendingCount} subtitle="Awaiting your review" color="amber" />
                                <StatsCard label="Projects Verified" value="42/50" subtitle="This batch" color="green" />
                                <StatsCard label="Internships Completed" value="38" subtitle="Industry verified" color="blue" />
                            </div>
                        )}
                        <div className="content-grid">
                            <div className="content-left">
                                <ClearanceTable columns={COLUMNS} data={tableData} approvedIds={approvedIds} onApprove={handleApprove} onReject={handleReject} onRowClick={setSelected}
                                    renderActions={(row) => (
                                        <div className="action-group">
                                            <button className="btn btn-sm btn-outline" onClick={e => { e.stopPropagation(); row.studentId ? setViewingDocs({ studentId: row.studentId, studentName: row.name }) : showToast(`Viewing project for ${row.name}`) }}>{row.fromStore ? '📄 Docs' : 'Review'}</button>
                                            <button className="btn btn-sm btn-approve" onClick={e => { e.stopPropagation(); handleApprove(row) }}>✓ Approve</button>
                                            <button className="btn btn-sm btn-reject" onClick={e => { e.stopPropagation(); handleReject(row) }}>✗ Reject</button>
                                        </div>
                                    )}
                                />
                                {selected && (
                                    <div className="detail-card">
                                        <div className="detail-header">
                                            <div className={`student-avatar ${selected.avatarClass}`} style={{ width: 44, height: 44 }}>{selected.initials}</div>
                                            <div><div className="detail-name">{selected.name}</div><div className="detail-sub">{selected.roll} — B.Tech CS — Batch 2025</div></div>
                                            <div className={`detail-status ${selected.status === 'approved' ? 'approved' : 'pending'}`}>{selected.statusLabel}</div>
                                        </div>
                                        <div className="detail-section-label">Academic Details</div>
                                        <div className="detail-info-grid">
                                            <div className="detail-info-item"><div className="detail-info-label">Project</div><div className="detail-info-value">{selected.project}</div></div>
                                            <div className="detail-info-item"><div className="detail-info-label">Internship</div><div className="detail-info-value">{selected.internship}</div></div>
                                        </div>
                                        <div className="detail-actions">
                                            <button className="btn btn-solid" onClick={() => handleApprove(selected)}>✓ Approve Graduation →</button>
                                            <button className="btn btn-reject" onClick={() => handleReject(selected)}>✗ Reject</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
            <div className={`admin-toast ${toast.show ? 'visible' : 'hidden'}`}>{toast.msg}</div>
            
            {flagModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#fff', padding: '2rem', borderRadius: '18px', width: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ margin: '0 0 1rem' }}>Flag Application</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text3)', marginBottom: '1rem' }}>Explain why you are flagging <strong>{flagModal.student.name}</strong>:</p>
                        <textarea style={{ width: '100%', height: '100px', borderRadius: '10px', border: '1px solid var(--border)', padding: '0.75rem', fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', marginBottom: '1.25rem' }} placeholder="Reason..." value={flagModal.reason} onChange={e => setFlagModal({...flagModal, reason: e.target.value})} />
                        <div style={{ display: 'flex', gap: '0.75rem' }}><button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setFlagModal(null)}>Cancel</button><button className="btn btn-solid" style={{ flex: 1, background: 'var(--red)', border: 'none' }} onClick={confirmReject}>Submit Flag</button></div>
                    </div>
                </div>
            )}

            {viewingDocs && <DocumentViewer role="HOD" studentId={viewingDocs.studentId} studentName={viewingDocs.studentName} onClose={() => setViewingDocs(null)} />}
        </div>
    )
}
