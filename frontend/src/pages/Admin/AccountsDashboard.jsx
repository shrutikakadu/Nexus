import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import StatsCard from '../../components/StatsCard'
import ClearanceTable from '../../components/ClearanceTable'
import ClearanceHeatmap from '../../components/ClearanceHeatmap'
import NotificationPanel from '../../components/NotificationPanel'
import DocumentViewer from '../../components/DocumentViewer'
import RejectModal from '../../components/RejectModal'
import { getSubmissionsForAdmin, adminApprove, adminReject, onStoreUpdate } from '../../utils/clearanceStore'
import { fetchRegisteredStudents, updateClearanceAPI } from '../../utils/adminApi'
import '../../styles/admin.css'

const STUDENTS = [
    { id: 's1', initials: 'TP', avatarClass: 'green-bg', name: 'Tanaya Patel', roll: '2021CS001', tuition: 'Paid', libraryFine: '₹0', hostelFees: 'Paid', statusColor: 'amber', statusLabel: 'Pending', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'pending', Hostel: 'approved', HOD: 'pending', Principal: 'locked' } },
    { id: 's2', initials: 'HS', avatarClass: 'blue-bg', name: 'Hritani Sharma', roll: '2021CS042', tuition: 'Paid', libraryFine: '₹340', hostelFees: 'Paid', statusColor: 'red', statusLabel: 'Fine Due', heatmap: { Library: 'pending', Lab: 'approved', Accounts: 'pending', Hostel: 'approved', HOD: 'locked', Principal: 'locked' } },
    { id: 's3', initials: 'RK', avatarClass: 'amber-bg', name: 'Rohit Kumar', roll: '2021CS017', tuition: 'Pending', libraryFine: '₹0', hostelFees: 'Paid', statusColor: 'red', statusLabel: 'Fees Due', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'pending', Hostel: 'locked', HOD: 'locked', Principal: 'locked' } },
    { id: 's4', initials: 'NP', avatarClass: 'purple-bg', name: 'Neha Patel', roll: '2021CS031', tuition: 'Paid', libraryFine: '₹0', hostelFees: 'Paid', statusColor: 'amber', statusLabel: 'Pending', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'pending', Hostel: 'approved', HOD: 'locked', Principal: 'locked' } },
]

const COLUMNS = [
    { key: 'student', label: 'Student' },
    { key: 'tuition', label: 'Tuition Fees', render: (r) => <span className={`badge ${r.tuition === 'Paid' ? 'green' : 'red'}`}>{r.tuition}</span> },
    { key: 'libraryFine', label: 'Library Fine', render: (r) => <span style={{ color: r.libraryFine !== '₹0' ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>{r.libraryFine}</span> },
    { key: 'hostelFees', label: 'Hostel Fees', render: (r) => <span className={`badge ${r.hostelFees === 'Paid' ? 'green' : 'red'}`}>{r.hostelFees}</span> },
    { key: 'status', label: 'Status' },
]

export default function AccountsDashboard() {
    const [activeItem, setActiveItem] = useState('dashboard')
    const [approvedIds, setApprovedIds] = useState([])
    const [rejectedIds, setRejectedIds] = useState([])
    const [selected, setSelected] = useState(STUDENTS[0])
    const [toast, setToast] = useState({ msg: '', show: false })
    const [pendingCount, setPendingCount] = useState(STUDENTS.length)
    const [storeSubmissions, setStoreSubmissions] = useState([])
    const [viewingDocs, setViewingDocs] = useState(null)
    const [apiStudents, setApiStudents] = useState([])
    const [rejectTarget, setRejectTarget] = useState(null)

    useEffect(() => {
        fetchRegisteredStudents('Accounts').then(s => { setApiStudents(s); setPendingCount(s.filter(x => x.status === 'pending').length + STUDENTS.length) })
    }, [])

    useEffect(() => {
        function loadSubmissions() { setStoreSubmissions(getSubmissionsForAdmin('Accounts')) }
        loadSubmissions()
        return onStoreUpdate(loadSubmissions)
    }, [])

    function showToast(msg) { setToast({ msg, show: true }); setTimeout(() => setToast(t => ({ ...t, show: false })), 2800) }

    function handleApprove(s) {
        if (approvedIds.includes(s.id)) return
        if (s.tuition !== 'Paid' || s.libraryFine !== '₹0') { showToast(`⚠️ Cannot approve — ${s.name} has pending dues`); return }
        if (s.fromStore && (!s.documents || s.documents.length === 0)) { showToast(`⚠️ Cannot approve — ${s.name} has not uploaded fee clearance documents`); return }
        setApprovedIds(p => [...p, s.id]); setPendingCount(p => Math.max(0, p - 1))
        if (s.studentId) adminApprove(s.studentId, 'Accounts', 'Accounts clearance approved. All fees paid.')
        updateClearanceAPI(s.studentId || s.roll, 'Accounts', 'approved', 'Accounts clearance approved')
        showToast(`✓ Accounts clearance approved for ${s.name}`)
    }
    function handleReject(s) {
        setRejectTarget(s)
    }

    function confirmReject(reason) {
        if (!rejectTarget) return
        setRejectedIds(p => [...p, rejectTarget.id])
        if (rejectTarget.studentId) adminReject(rejectTarget.studentId, 'Accounts', reason)
        updateClearanceAPI(rejectTarget.studentId || rejectTarget.roll, 'Accounts', 'rejected', reason)
        showToast(`✗ Accounts clearance rejected for ${rejectTarget.name}`)
        setRejectTarget(null)
    }

    const storeStudents = storeSubmissions
        .filter(s => s.relevantDocs.length > 0 || s.statusForRole === 'pending')
        .map(s => ({
            id: `store_${s.studentId}`, studentId: s.studentId, initials: s.initials, avatarClass: s.avatarClass || 'blue-bg',
            name: s.studentName, roll: s.studentId, tuition: 'Paid', libraryFine: '₹0', hostelFees: 'Paid',
            statusColor: s.statusForRole === 'approved' ? 'green' : 'amber',
            statusLabel: s.statusForRole === 'approved' ? 'Cleared' : 'Pending',
            heatmap: s.clearanceStatus, documents: s.relevantDocs, fromStore: true,
        }))
    const mergedApi = apiStudents.filter(a => !storeStudents.some(s => s.roll === a.roll))
    const allStudents = [...STUDENTS, ...storeStudents.filter(ss => !STUDENTS.some(s => s.roll === ss.roll)), ...mergedApi.filter(a => !STUDENTS.some(s => s.roll === a.roll))]

    const tableData = allStudents.map(s => ({
        ...s,
        status: approvedIds.includes(s.id) ? 'approved' : rejectedIds.includes(s.id) ? 'rejected' : 'pending',
        statusColor: approvedIds.includes(s.id) ? 'green' : rejectedIds.includes(s.id) ? 'red' : s.statusColor,
        statusLabel: approvedIds.includes(s.id) ? 'Cleared' : rejectedIds.includes(s.id) ? 'Rejected' : s.statusLabel,
    }))

    return (
        <div className="admin-layout">
            <AdminSidebar role="accounts" activeItem={activeItem} onNavigate={setActiveItem} badges={{ pending: pendingCount, notifs: 3 }} />
            <main className="admin-content">
                <div className="admin-header">
                    <div className="admin-header-left"><h1>Accounts Dashboard</h1><p>Verify fee payments and financial dues clearance</p></div>
                    <div className="admin-header-actions">
                        <button className="btn btn-outline" onClick={() => showToast('Dues CSV uploaded')}>↑ Upload Dues CSV</button>
                        <button className="btn btn-outline" onClick={() => showToast('Report exported')}>↓ Export</button>
                    </div>
                </div>
                {activeItem === 'students' && (
                    <div className="card"><div className="card-label">Student Records</div><p style={{color: 'var(--text3)'}}>Student directory module coming soon.</p></div>
                )}
                {activeItem === 'notifications' && (
                    <div style={{ maxWidth: 600 }}><NotificationPanel role="Accounts" onSend={msg => showToast(`Notification sent: "${msg}"`)} /></div>
                )}
                {activeItem === 'reports' && (
                    <div className="card"><div className="card-label">Reports & Analytics</div><p style={{color: 'var(--text3)'}}>Export options and analytics module coming soon.</p></div>
                )}

                {(activeItem === 'dashboard' || activeItem === 'clearances') && (
                    <>
                        {activeItem === 'dashboard' && (
                            <div className="stats-grid">
                                <StatsCard label="Pending Fee Dues" value={pendingCount} subtitle="Students with dues" color="red" />
                                <StatsCard label="Total Fines Collected" value="₹8,340" subtitle="This batch" color="green" />
                                <StatsCard label="Confirmations Today" value="12" subtitle="Payments verified" color="blue" />
                                <StatsCard label="Overdue Payments" value="7" subtitle="Action required" color="amber" />
                            </div>
                        )}
                        <div className="content-left">
                                <ClearanceTable columns={COLUMNS} data={tableData} approvedIds={approvedIds} onApprove={handleApprove} onReject={handleReject} onRowClick={setSelected}
                                    renderActions={(row) => (
                                        <div className="action-group">
                                            <button className="btn btn-sm btn-outline" onClick={e => { e.stopPropagation(); row.studentId ? setViewingDocs({ studentId: row.studentId, studentName: row.name }) : showToast(`Verifying payment for ${row.name}`) }}>
                                                {row.fromStore ? '📄 View Docs' : 'Verify'}
                                            </button>
                                            <button className="btn btn-sm btn-approve" onClick={e => { e.stopPropagation(); handleApprove(row) }}>✓ Clear</button>
                                            <button className="btn btn-sm btn-reject" onClick={e => { e.stopPropagation(); handleReject(row) }}>✗ Reject</button>
                                        </div>
                                    )}
                                />
                                <div className="detail-card">
                                    <div className="detail-header">
                                        <div className={`student-avatar ${selected.avatarClass}`} style={{ width: 44, height: 44 }}>{selected.initials}</div>
                                        <div><div className="detail-name">{selected.name}</div><div className="detail-sub">{selected.roll} — B.Tech CS — Batch 2025</div></div>
                                        <div className={`detail-status ${selected.tuition === 'Paid' && selected.libraryFine === '₹0' ? 'approved' : 'rejected'}`}>
                                            {selected.tuition === 'Paid' && selected.libraryFine === '₹0' ? 'All Paid' : 'Dues Pending'}
                                        </div>
                                    </div>
                                    <div className="detail-section-label">Payment Details</div>
                                    <div className="detail-info-grid">
                                        <div className="detail-info-item"><div className="detail-info-label">Tuition Fees</div><div className="detail-info-value" style={{ color: selected.tuition === 'Paid' ? 'var(--green)' : 'var(--red)' }}>{selected.tuition}</div></div>
                                        <div className="detail-info-item"><div className="detail-info-label">Library Fine</div><div className="detail-info-value" style={{ color: selected.libraryFine !== '₹0' ? 'var(--red)' : 'var(--green)' }}>{selected.libraryFine}</div></div>
                                        <div className="detail-info-item"><div className="detail-info-label">Hostel Fees</div><div className="detail-info-value" style={{ color: selected.hostelFees === 'Paid' ? 'var(--green)' : 'var(--red)' }}>{selected.hostelFees}</div></div>
                                        <div className="detail-info-item"><div className="detail-info-label">Last Payment</div><div className="detail-info-value">Apr 10, 2025</div></div>
                                    </div>
                                    <div className="detail-actions">
                                        <button className="btn btn-solid" onClick={() => handleApprove(selected)}>✓ Approve Accounts Clearance →</button>
                                        <button className="btn btn-reject" onClick={() => handleReject(selected)}>✗ Reject</button>
                                    </div>
                                </div>
                        </div>
                    </>
                )}
            </main>
            <div className={`admin-toast ${toast.show ? 'visible' : 'hidden'}`}>{toast.msg}</div>
            {viewingDocs && <DocumentViewer role="Accounts" studentId={viewingDocs.studentId} studentName={viewingDocs.studentName} onClose={() => setViewingDocs(null)} />}
            <RejectModal isOpen={!!rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={confirmReject} title="Reject Accounts Clearance" />
        </div>
    )
}
