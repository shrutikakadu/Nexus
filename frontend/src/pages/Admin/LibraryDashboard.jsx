import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/AdminSidebar'
import StatsCard from '../../components/StatsCard'
import ClearanceTable from '../../components/ClearanceTable'
import ClearanceHeatmap from '../../components/ClearanceHeatmap'
import NotificationPanel from '../../components/NotificationPanel'
import DocumentViewer from '../../components/DocumentViewer'
import { getSubmissionsForAdmin, adminApprove, adminReject, adminFlag, onStoreUpdate } from '../../utils/clearanceStore'
import '../../styles/admin.css'

const STUDENTS = [
    {
        id: 's1', initials: 'TP', avatarClass: 'green-bg', name: 'Tanaya Patel', roll: '2021CS001',
        booksIssued: 0, fine: 0, status: 'pending', statusColor: 'amber', statusLabel: 'Pending',
        heatmap: { Library: 'pending', Lab: 'approved', Accounts: 'approved', Hostel: 'approved', HOD: 'pending', Principal: 'locked' }
    },
    {
        id: 's2', initials: 'HS', avatarClass: 'blue-bg', name: 'Hritani Sharma', roll: '2021CS042',
        booksIssued: 2, fine: 340, status: 'pending', statusColor: 'red', statusLabel: 'Fine Due',
        heatmap: { Library: 'pending', Lab: 'approved', Accounts: 'pending', Hostel: 'approved', HOD: 'locked', Principal: 'locked' }
    },
    {
        id: 's3', initials: 'RK', avatarClass: 'amber-bg', name: 'Rohit Kumar', roll: '2021CS017',
        booksIssued: 0, fine: 0, status: 'pending', statusColor: 'amber', statusLabel: 'Pending',
        heatmap: { Library: 'pending', Lab: 'approved', Accounts: 'approved', Hostel: 'locked', HOD: 'locked', Principal: 'locked' }
    },
    {
        id: 's4', initials: 'NP', avatarClass: 'purple-bg', name: 'Neha Patel', roll: '2021CS031',
        booksIssued: 1, fine: 120, status: 'pending', statusColor: 'red', statusLabel: 'Fine Due',
        heatmap: { Library: 'pending', Lab: 'approved', Accounts: 'approved', Hostel: 'approved', HOD: 'locked', Principal: 'locked' }
    },
]

const COLUMNS = [
    { key: 'student', label: 'Student' },
    { key: 'booksIssued', label: 'Books Issued' },
    { key: 'fine', label: 'Fine (₹)', render: (row) => <span style={{ color: row.fine > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>₹{row.fine}</span> },
    { key: 'status', label: 'Status' },
]

export default function LibraryDashboard() {
    const navigate = useNavigate()
    const [activeItem, setActiveItem] = useState('dashboard')
    const [approvedIds, setApprovedIds] = useState([])
    const [rejectedIds, setRejectedIds] = useState([])
    const [selectedStudent, setSelectedStudent] = useState(STUDENTS[0])
    const [toast, setToast] = useState({ msg: '', show: false })
    const [pendingCount, setPendingCount] = useState(STUDENTS.length)
    const [storeSubmissions, setStoreSubmissions] = useState([])
    const [viewingDocs, setViewingDocs] = useState(null) // { studentId, studentName }

    // Load student submissions from shared store
    useEffect(() => {
        function loadSubmissions() {
            const subs = getSubmissionsForAdmin('Library')
            setStoreSubmissions(subs)
        }
        loadSubmissions()
        return onStoreUpdate(loadSubmissions)
    }, [])

    function showToast(msg) {
        setToast({ msg, show: true })
        setTimeout(() => setToast(t => ({ ...t, show: false })), 2800)
    }

    function handleApprove(student) {
        if (approvedIds.includes(student.id)) return
        if (student.fine > 0) { showToast(`⚠️ Cannot approve — ${student.name} has ₹${student.fine} fine pending`); return }
        setApprovedIds(prev => [...prev, student.id])
        setPendingCount(p => Math.max(0, p - 1))
        // Sync to shared store
        if (student.studentId) {
            adminApprove(student.studentId, 'Library', 'Library clearance approved. All books returned.')
        }
        showToast(`✓ Library clearance approved for ${student.name}`)
    }

    function handleReject(student) {
        const reason = window.prompt(`Please enter the reason for rejecting ${student.name}:`);
        if (!reason) { showToast(`⚠️ Reason is required for rejection`); return; }
        setRejectedIds(prev => [...prev, student.id])
        if (student.studentId) {
            adminReject(student.studentId, 'Library', reason)
        }
        showToast(`✗ Library clearance rejected for ${student.name}`)
    }

    function handleFlag(student) {
        const reason = window.prompt(`Please enter the reason for flagging ${student.name}:`);
        if (!reason) { showToast(`⚠️ Reason is required for flagging`); return; }
        if (student.studentId) {
            adminFlag(student.studentId, 'Library', reason)
        }
        showToast(`⚠️ Issue flagged for ${student.name}`)
    }

    // Merge hardcoded students with store submissions
    const storeStudents = storeSubmissions
        .filter(s => s.relevantDocs.length > 0 || s.statusForRole === 'pending')
        .map(s => ({
            id: `store_${s.studentId}`,
            studentId: s.studentId,
            initials: s.initials,
            avatarClass: s.avatarClass || 'blue-bg',
            name: s.studentName,
            roll: s.studentId,
            booksIssued: s.relevantDocs.length,
            fine: 0,
            status: s.statusForRole,
            statusColor: s.statusForRole === 'approved' ? 'green' : s.statusForRole === 'rejected' ? 'red' : 'amber',
            statusLabel: s.statusForRole === 'approved' ? 'Cleared' : s.statusForRole === 'rejected' ? 'Rejected' : 'Pending',
            heatmap: s.clearanceStatus,
            documents: s.relevantDocs,
            fromStore: true,
        }))

    const allStudents = [...STUDENTS, ...storeStudents.filter(ss => !STUDENTS.some(s => s.roll === ss.roll))]

    const tableData = allStudents.map(s => ({
        ...s,
        status: approvedIds.includes(s.id) ? 'approved' : rejectedIds.includes(s.id) ? 'rejected' : s.status,
        statusColor: approvedIds.includes(s.id) ? 'green' : rejectedIds.includes(s.id) ? 'red' : s.statusColor,
        statusLabel: approvedIds.includes(s.id) ? 'Cleared' : rejectedIds.includes(s.id) ? 'Rejected' : s.statusLabel,
    }))

    return (
        <div className="admin-layout">
            <AdminSidebar
                role="library"
                activeItem={activeItem}
                onNavigate={setActiveItem}
                badges={{ pending: pendingCount, notifs: 2 }}
            />
            <main className="admin-content">
                <div className="admin-header">
                    <div className="admin-header-left">
                        <h1>Library Dashboard</h1>
                        <p>Manage book returns, fines, and library clearances</p>
                    </div>
                    <div className="admin-header-actions">
                        <button className="btn btn-outline" onClick={() => showToast('CSV export triggered')}>
                            ↓ Export CSV
                        </button>
                    </div>
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
                        {/* Stats */}
                        {activeItem === 'dashboard' && (
                            <div className="stats-grid">
                                <StatsCard label="Pending Clearances" value={pendingCount} subtitle="Awaiting your action" color="amber" />
                                <StatsCard label="Books Pending Return" value="3" subtitle="Across all students" color="red" />
                                <StatsCard label="Library Fines Pending" value="₹460" subtitle="Uncollected" color="red" />
                                <StatsCard label="Fines Collected" value="₹2,140" subtitle="This batch" color="green" />
                            </div>
                        )}

                        {/* Main Content */}
                        <div className="content-left">
                                <ClearanceTable
                                    columns={COLUMNS}
                                    data={tableData}
                                    approvedIds={approvedIds}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onRowClick={setSelectedStudent}
                                    renderActions={(row) => (
                                        <div className="action-group">
                                            <button className="btn btn-sm btn-outline" onClick={e => { e.stopPropagation(); row.studentId ? setViewingDocs({ studentId: row.studentId, studentName: row.name }) : showToast(`Viewing books for ${row.name}`) }}>
                                                {row.fromStore ? '📄 View Docs' : 'View Books'}
                                            </button>
                                            {row.fine === 0
                                                ? <button className="btn btn-sm btn-approve" onClick={e => { e.stopPropagation(); handleApprove(row) }}>✓ Approve</button>
                                                : <button className="btn btn-sm btn-amber" onClick={e => { e.stopPropagation(); showToast(`Add fine collected for ${row.name}`) }}>+ Collect Fine</button>
                                            }
                                            <button className="btn btn-sm btn-amber" onClick={e => { e.stopPropagation(); handleFlag(row) }}>⚠️ Flag</button>
                                            <button className="btn btn-sm btn-reject" onClick={e => { e.stopPropagation(); handleReject(row) }}>✗ Reject</button>
                                        </div>
                                    )}
                                />

                                {/* Detail Panel */}
                                <div className="detail-card">
                                    <div className="detail-header">
                                        <div className={`student-avatar ${selectedStudent.avatarClass}`} style={{ width: 44, height: 44 }}>
                                            {selectedStudent.initials}
                                        </div>
                                        <div>
                                            <div className="detail-name">{selectedStudent.name}</div>
                                            <div className="detail-sub">{selectedStudent.roll} — B.Tech CS — Batch 2025</div>
                                        </div>
                                        <div className={`detail-status ${selectedStudent.fine > 0 ? 'rejected' : 'pending'}`}>
                                            {selectedStudent.fine > 0 ? 'Fine Pending' : 'Awaiting Clearance'}
                                        </div>
                                    </div>
                                    <div className="detail-section-label">Library Details</div>
                                    <div className="detail-info-grid">
                                        <div className="detail-info-item">
                                            <div className="detail-info-label">Books Issued</div>
                                            <div className="detail-info-value">{selectedStudent.booksIssued} book(s)</div>
                                        </div>
                                        <div className="detail-info-item">
                                            <div className="detail-info-label">Outstanding Fine</div>
                                            <div className="detail-info-value" style={{ color: selectedStudent.fine > 0 ? 'var(--red)' : 'var(--green)' }}>
                                                ₹{selectedStudent.fine}
                                            </div>
                                        </div>
                                        <div className="detail-info-item">
                                            <div className="detail-info-label">Last Visit</div>
                                            <div className="detail-info-value">Apr 12, 2025</div>
                                        </div>
                                        <div className="detail-info-item">
                                            <div className="detail-info-label">Books Returned</div>
                                            <div className="detail-info-value" style={{ color: selectedStudent.booksIssued === 0 ? 'var(--green)' : 'var(--red)' }}>
                                                {selectedStudent.booksIssued === 0 ? 'All Returned ✓' : `${selectedStudent.booksIssued} pending`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="detail-actions">
                                        <button className="btn btn-solid" onClick={() => handleApprove(selectedStudent)}>
                                            ✓ Approve Library Clearance →
                                        </button>
                                        <button className="btn btn-reject" onClick={() => handleReject(selectedStudent)}>
                                            ✗ Reject
                                        </button>
                                    </div>
                                </div>
                        </div>
                    </>
                )}
            </main>
            <div className={`admin-toast ${toast.show ? 'visible' : 'hidden'}`}>{toast.msg}</div>
            {viewingDocs && (
                <DocumentViewer
                    role="Library"
                    studentId={viewingDocs.studentId}
                    studentName={viewingDocs.studentName}
                    onClose={() => setViewingDocs(null)}
                />
            )}
        </div>
    )
}
