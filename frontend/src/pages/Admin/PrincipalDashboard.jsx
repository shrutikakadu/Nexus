import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import StatsCard from '../../components/StatsCard'
import ClearanceTable from '../../components/ClearanceTable'
import ClearanceHeatmap from '../../components/ClearanceHeatmap'
import NotificationPanel from '../../components/NotificationPanel'
import CertificateGenerator from '../../components/CertificateGenerator'
import DocumentViewer from '../../components/DocumentViewer'
import RejectModal from '../../components/RejectModal'
import { getSubmissionsForAdmin, adminApprove, adminReject, onStoreUpdate } from '../../utils/clearanceStore'
import { fetchRegisteredStudents, updateClearanceAPI } from '../../utils/adminApi'
import '../../styles/admin.css'

const ALL_STUDENTS = [
    { id: 's1', initials: 'TP', avatarClass: 'green-bg', name: 'Tanaya Patel', roll: '2021CS001', dept: 'Computer Science', hodApproval: 'Yes', batch: '2021–2025', cgpa: '9.1', statusColor: 'amber', statusLabel: 'Pending Principal', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'approved', Hostel: 'approved', HOD: 'approved', Principal: 'pending' } },
    { id: 's2', initials: 'HS', avatarClass: 'blue-bg', name: 'Hritani Sharma', roll: '2021CS042', dept: 'Computer Science', hodApproval: 'Yes', batch: '2021–2025', cgpa: '8.4', statusColor: 'amber', statusLabel: 'Pending Principal', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'approved', Hostel: 'approved', HOD: 'approved', Principal: 'pending' } },
    { id: 's3', initials: 'RK', avatarClass: 'amber-bg', name: 'Rohit Kumar', roll: '2021CS017', dept: 'Computer Science', hodApproval: 'No', batch: '2021–2025', cgpa: '7.8', statusColor: 'red', statusLabel: 'HOD Pending', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'approved', Hostel: 'approved', HOD: 'pending', Principal: 'locked' } },
    { id: 's4', initials: 'MS', avatarClass: 'purple-bg', name: 'Megha Singh', roll: '2021CS044', dept: 'Computer Science', hodApproval: 'Yes', batch: '2021–2025', cgpa: '8.9', statusColor: 'amber', statusLabel: 'Pending Principal', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'approved', Hostel: 'approved', HOD: 'approved', Principal: 'pending' } },
    { id: 's5', initials: 'VR', avatarClass: 'green-bg', name: 'Varun Reddy', roll: '2021CS072', dept: 'Computer Science', hodApproval: 'Yes', batch: '2021–2025', cgpa: '8.2', statusColor: 'amber', statusLabel: 'Pending Principal', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'approved', Hostel: 'approved', HOD: 'approved', Principal: 'pending' } },
]

const COLUMNS = [
    { key: 'student', label: 'Student' },
    { key: 'dept', label: 'Department' },
    { key: 'hodApproval', label: 'HOD Approval', render: (r) => <span className={`badge ${r.hodApproval === 'Yes' ? 'green' : 'red'}`}>{r.hodApproval === 'Yes' ? '✓ Approved' : '⏳ Pending'}</span> },
    { key: 'cgpa', label: 'CGPA', render: (r) => <span style={{ fontWeight: 600, color: 'var(--green)' }}>{r.cgpa}</span> },
    { key: 'status', label: 'Status' },
]

export default function PrincipalDashboard() {
    const [activeItem, setActiveItem] = useState('dashboard')
    const [approvedIds, setApprovedIds] = useState([])
    const [rejectedIds, setRejectedIds] = useState([])
    const [selected, setSelected] = useState(ALL_STUDENTS[0])
    const [toast, setToast] = useState({ msg: '', show: false })
    const [pendingCount, setPendingCount] = useState(4)
    const [certStudent, setCertStudent] = useState(null)
    const [storeSubmissions, setStoreSubmissions] = useState([])
    const [viewingDocs, setViewingDocs] = useState(null)
    const [apiStudents, setApiStudents] = useState([])
    const [rejectTarget, setRejectTarget] = useState(null)

    useEffect(() => {
        fetchRegisteredStudents('Principal').then(s => { setApiStudents(s); setPendingCount(s.filter(x => x.status === 'pending').length + ALL_STUDENTS.filter(x => x.hodApproval === 'Yes').length) })
    }, [])

    useEffect(() => {
        function loadSubmissions() { setStoreSubmissions(getSubmissionsForAdmin('Principal')) }
        loadSubmissions()
        return onStoreUpdate(loadSubmissions)
    }, [])

    function showToast(msg) { setToast({ msg, show: true }); setTimeout(() => setToast(t => ({ ...t, show: false })), 2800) }

    function handleApprove(s) {
        if (approvedIds.includes(s.id)) return
        if (s.hodApproval !== 'Yes') { showToast(`⚠️ Cannot approve — ${s.name} missing HOD approval`); return }
        setApprovedIds(p => [...p, s.id]); setPendingCount(p => Math.max(0, p - 1))
        if (s.studentId) adminApprove(s.studentId, 'Principal', 'Final graduation approved by Principal.')
        updateClearanceAPI(s.studentId || s.roll, 'Principal', 'approved', 'Final graduation approved by Principal')
        showToast(`🎓 Final graduation approved for ${s.name}!`)
    }
    function handleReject(s) {
        setRejectTarget(s)
    }

    function confirmReject(reason) {
        if (!rejectTarget) return
        setRejectedIds(p => [...p, rejectTarget.id])
        if (rejectTarget.studentId) adminReject(rejectTarget.studentId, 'Principal', reason)
        updateClearanceAPI(rejectTarget.studentId || rejectTarget.roll, 'Principal', 'rejected', reason)
        showToast(`✗ Graduation rejected for ${rejectTarget.name}`)
        setRejectTarget(null)
    }

    const storeStudents = storeSubmissions
        .filter(s => s.relevantDocs.length > 0 || s.statusForRole === 'pending')
        .map(s => ({
            id: `store_${s.studentId}`, studentId: s.studentId, initials: s.initials, avatarClass: s.avatarClass || 'blue-bg',
            name: s.studentName, roll: s.studentId, dept: 'Computer Science', hodApproval: 'Yes',
            batch: '2021–2025', cgpa: '8.5',
            statusColor: s.statusForRole === 'approved' ? 'green' : 'amber',
            statusLabel: s.statusForRole === 'approved' ? '🎓 Graduated' : 'Pending Principal',
            heatmap: s.clearanceStatus, documents: s.relevantDocs, fromStore: true,
        }))
    const mergedApi = apiStudents.filter(a => !storeStudents.some(s => s.roll === a.roll))
    const allStudents = [...ALL_STUDENTS, ...storeStudents.filter(ss => !ALL_STUDENTS.some(s => s.roll === ss.roll)), ...mergedApi.filter(a => !ALL_STUDENTS.some(s => s.roll === a.roll))]

    const tableData = allStudents.map(s => ({
        ...s,
        status: approvedIds.includes(s.id) ? 'approved' : rejectedIds.includes(s.id) ? 'rejected' : 'pending',
        statusColor: approvedIds.includes(s.id) ? 'green' : rejectedIds.includes(s.id) ? 'red' : s.statusColor,
        statusLabel: approvedIds.includes(s.id) ? '🎓 Graduated' : rejectedIds.includes(s.id) ? 'Rejected' : s.statusLabel,
    }))

    const isCertificates = activeItem === 'certificates'

    return (
        <div className="admin-layout">
            <AdminSidebar role="principal" activeItem={activeItem} onNavigate={setActiveItem} badges={{ pending: pendingCount, notifs: 5 }} />
            <main className="admin-content">
                <div className="admin-header">
                    <div className="admin-header-left"><h1>Principal Dashboard</h1><p>Final authority — graduation approval &amp; certificate generation</p></div>
                    <div className="admin-header-actions">
                        <button className="btn btn-outline" onClick={() => showToast('Batch summary exported')}>↓ Batch Report</button>
                    </div>
                </div>

                {activeItem === 'students' && (
                    <div className="card"><div className="card-label">Student Records</div><p style={{color: 'var(--text3)'}}>Student directory module coming soon.</p></div>
                )}
                {activeItem === 'notifications' && (
                    <div style={{ maxWidth: 600 }}><NotificationPanel role="Principal" onSend={msg => showToast(`Notification sent: "${msg}"`)} /></div>
                )}
                {activeItem === 'reports' && (
                    <div className="card"><div className="card-label">Reports & Analytics</div><p style={{color: 'var(--text3)'}}>Export options and analytics module coming soon.</p></div>
                )}


                {isCertificates && (
                    <div>
                        <div style={{ marginBottom: '1rem' }}>
                            <div className="card-label">Select student to generate certificate</div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {ALL_STUDENTS.filter(s => approvedIds.includes(s.id)).map(s => (
                                    <button key={s.id} className={`btn ${certStudent?.id === s.id ? 'btn-solid' : 'btn-outline'}`} onClick={() => setCertStudent(s)}>
                                        {s.initials} {s.name}
                                    </button>
                                ))}
                                {ALL_STUDENTS.filter(s => approvedIds.includes(s.id)).length === 0 && (
                                    <div style={{ color: 'var(--text3)', fontSize: '0.85rem', padding: '0.5rem' }}>Approve students first to generate certificates.</div>
                                )}
                            </div>
                        </div>
                        {certStudent && <CertificateGenerator student={certStudent} />}
                    </div>
                )}

                {(activeItem === 'dashboard' || activeItem === 'clearances') && (
                    <>
                        {activeItem === 'dashboard' && (
                            <div className="stats-grid">
                                <StatsCard label="Approvals Pending" value={pendingCount} subtitle="Awaiting final sign-off" color="amber" />
                                <StatsCard label="Certificates Generated" value={approvedIds.length} subtitle="Today" color="green" />
                                <StatsCard label="Total Graduates" value="89" subtitle="This batch so far" color="blue" />
                                <StatsCard label="Rejected Applications" value={rejectedIds.length} subtitle="Require action" color="red" />
                            </div>
                        )}
                        <div className="content-grid">
                            <div className="content-left">
                                <ClearanceTable columns={COLUMNS} data={tableData} approvedIds={approvedIds} onApprove={handleApprove} onReject={handleReject} onRowClick={setSelected}
                                    renderActions={(row) => (
                                        <div className="action-group">
                                            {approvedIds.includes(row.id)
                                                ? <button className="btn btn-sm btn-solid" onClick={e => { e.stopPropagation(); setCertStudent(row); setActiveItem('certificates') }}>📜 Certificate</button>
                                                : <>
                                                    <button className="btn btn-sm btn-approve" onClick={e => { e.stopPropagation(); handleApprove(row) }}>✓ Approve</button>
                                                    <button className="btn btn-sm btn-reject" onClick={e => { e.stopPropagation(); handleReject(row) }}>✗ Reject</button>
                                                </>
                                            }
                                        </div>
                                    )}
                                />
                                <div className="detail-card">
                                    <div className="detail-header">
                                        <div className={`student-avatar ${selected.avatarClass}`} style={{ width: 44, height: 44 }}>{selected.initials}</div>
                                        <div><div className="detail-name">{selected.name}</div><div className="detail-sub">{selected.roll} — {selected.dept} — {selected.batch}</div></div>
                                        <div className={`detail-status ${selected.hodApproval === 'Yes' ? 'approved' : 'pending'}`}>
                                            {selected.hodApproval === 'Yes' ? 'HOD Approved' : 'HOD Pending'}
                                        </div>
                                    </div>
                                    <div className="detail-section-label">Graduation Details</div>
                                    <div className="detail-info-grid">
                                        <div className="detail-info-item"><div className="detail-info-label">Department</div><div className="detail-info-value">{selected.dept}</div></div>
                                        <div className="detail-info-item"><div className="detail-info-label">HOD Approval</div><div className="detail-info-value" style={{ color: selected.hodApproval === 'Yes' ? 'var(--green)' : 'var(--red)' }}>{selected.hodApproval === 'Yes' ? 'Granted ✓' : 'Pending'}</div></div>
                                        <div className="detail-info-item"><div className="detail-info-label">CGPA</div><div className="detail-info-value">{selected.cgpa} / 10.0</div></div>
                                        <div className="detail-info-item"><div className="detail-info-label">Batch</div><div className="detail-info-value">{selected.batch}</div></div>
                                    </div>
                                    <div className="detail-actions">
                                        {approvedIds.includes(selected.id) ? (
                                            <button className="btn btn-solid" onClick={() => { setCertStudent(selected); setActiveItem('certificates') }}>
                                                📜 Generate Certificate
                                            </button>
                                        ) : (
                                            <>
                                                <button className="btn btn-solid" onClick={() => handleApprove(selected)}>🎓 Approve Graduation →</button>
                                                <button className="btn btn-reject" onClick={() => handleReject(selected)}>✗ Reject</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
            <div className={`admin-toast ${toast.show ? 'visible' : 'hidden'}`}>{toast.msg}</div>
            {viewingDocs && <DocumentViewer role="Principal" studentId={viewingDocs.studentId} studentName={viewingDocs.studentName} onClose={() => setViewingDocs(null)} />}
            <RejectModal isOpen={!!rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={confirmReject} title="Reject Principal Clearance" />
        </div>
    )
}
