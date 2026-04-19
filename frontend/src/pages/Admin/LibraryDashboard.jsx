import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/AdminSidebar'
import StatsCard from '../../components/StatsCard'
import ClearanceTable from '../../components/ClearanceTable'
import ClearanceHeatmap from '../../components/ClearanceHeatmap'
import NotificationPanel from '../../components/NotificationPanel'
import DocumentViewer from '../../components/DocumentViewer'
import RejectModal from '../../components/RejectModal'
import { getSubmissionsForAdmin, adminApprove, adminReject, onStoreUpdate } from '../../utils/clearanceStore'
import { fetchRegisteredStudents } from '../../utils/adminApi'
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
    const [toast, setToast] = useState({ msg: '', show: false })
    const [pendingCount, setPendingCount] = useState(STUDENTS.length)
    const [selectedStudent, setSelectedStudent] = useState(STUDENTS[0])
    const [storeSubmissions, setStoreSubmissions] = useState([])
    const [viewingDocs, setViewingDocs] = useState(null)
    const [apiStudents, setApiStudents] = useState([])
    const [rejectTarget, setRejectTarget] = useState(null)
    const fileInputRef = useRef(null)

    // Load registered students from backend API
    const loadApiStudents = () => {
        fetchRegisteredStudents('Library').then(s => { 
            setApiStudents(s)
            setPendingCount(s.filter(x => x.status === 'pending').length + STUDENTS.length) 
        })
    }

    useEffect(() => {
        loadApiStudents()
    }, [])

    function handleCsvUpload(e) {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            const text = ev.target.result
            const lines = text.split('\n').filter(l => l.trim())
            let count = 0
            for (let i = 1; i < lines.length; i++) { // skip header
                const cols = lines[i].split(',')
                if (cols.length >= 2) {
                    const roll = cols[0].trim()
                    const fine = parseInt(cols[1].trim()) || 0
                    if (fine >= 0) {
                        try {
                            const saved = localStorage.getItem(`nexus_dues_${roll}`)
                            let dues = []
                            if (saved) {
                                dues = JSON.parse(saved)
                            } else {
                                dues = [
                                    { id: 1, dept: 'Accounts', item: 'Tuition Fee (Sem 8)', amount: 4500, paid: false },
                                    { id: 2, dept: 'Library', item: 'Late Return Fine', amount: 150, paid: false },
                                    { id: 3, dept: 'Hostel', item: 'Hostel Mess Dues', amount: 650, paid: false },
                                    { id: 4, dept: 'Accounts', item: 'Exam Fee', amount: 1200, paid: false },
                                    { id: 5, dept: 'Lab', item: 'Lab Equipment Deposit Refund', amount: 500, paid: false },
                                ]
                            }
                            dues[1].amount = fine
                            dues[1].paid = fine === 0 // automatically paid if fine is 0
                            localStorage.setItem(`nexus_dues_${roll}`, JSON.stringify(dues))
                            count++
                        } catch(err) {}
                    }
                }
            }
            showToast(`✅ CSV Processed: Flagged/updated ${count} student records.`)
            loadApiStudents()
        }
        reader.readAsText(file)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

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
        // Check if student has uploaded required docs (for store/API students)
        if (student.fromStore && (!student.documents || student.documents.length === 0)) {
            showToast(`⚠️ Cannot approve — ${student.name} has not uploaded required library documents`); return
        }
        setApprovedIds(prev => [...prev, student.id])
        setPendingCount(p => Math.max(0, p - 1))
        // Sync to shared store
        if (student.studentId) {
            adminApprove(student.studentId, 'Library', 'Library clearance approved. All books returned.')
        }
        // Also update backend
        fetch(`http://127.0.0.1:8000/api/auth/clearance/update?roll=${student.studentId || student.roll}&dept=Library&new_status=approved&comment=Library+clearance+approved&admin_email=${localStorage.getItem('nexus_email') || ''}`, { method: 'POST' }).catch(() => {})
        showToast(`✓ Library clearance approved for ${student.name}`)
    }

    function handleReject(student) {
        setRejectTarget(student)
    }

    function confirmReject(reason) {
        if (!rejectTarget) return
        setRejectedIds(prev => [...prev, rejectTarget.id])
        if (rejectTarget.studentId) {
            adminReject(rejectTarget.studentId, 'Library', reason)
        }
        fetch(`http://127.0.0.1:8000/api/auth/clearance/update?roll=${rejectTarget.studentId || rejectTarget.roll}&dept=Library&new_status=rejected&comment=${encodeURIComponent(reason)}&admin_email=${localStorage.getItem('nexus_email') || ''}`, { method: 'POST' }).catch(() => {})
        showToast(`✗ Library clearance rejected for ${rejectTarget.name}`)
        setRejectTarget(null)
    }

    // Merge hardcoded students with store submissions + API students
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

    const mergedApi = apiStudents.filter(a => !storeStudents.some(s => s.roll === a.roll))
    const allStudents = [...STUDENTS, ...storeStudents.filter(ss => !STUDENTS.some(s => s.roll === ss.roll)), ...mergedApi.filter(a => !STUDENTS.some(s => s.roll === a.roll))]

    const tableData = allStudents.map(s => {
        let currentFine = s.fine;
        let currentLibFine = s.libraryFine;
        try {
            const saved = localStorage.getItem(`nexus_dues_${s.roll}`)
            if (saved) {
                const dues = JSON.parse(saved)
                if (dues[1]) {
                    currentFine = dues[1].paid ? 0 : dues[1].amount
                    currentLibFine = dues[1].paid ? '₹0' : `₹${dues[1].amount}`
                }
            }
        } catch {}

        return {
            ...s,
            fine: currentFine,
            libraryFine: currentLibFine,
            status: approvedIds.includes(s.id) ? 'approved' : rejectedIds.includes(s.id) ? 'rejected' : s.status,
            statusColor: approvedIds.includes(s.id) ? 'green' : rejectedIds.includes(s.id) ? 'red' : s.statusColor,
            statusLabel: approvedIds.includes(s.id) ? 'Cleared' : rejectedIds.includes(s.id) ? 'Rejected' : s.statusLabel,
        }
    })

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
                    <div style={{ maxWidth: 600 }}><NotificationPanel role="Library" onSend={msg => showToast(`Notification sent: "${msg}"`)} /></div>
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

                        {/* Internal Dues Reconciliation Engine */}
                        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <label className="btn btn-solid" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <span>📄 Upload CSV Fines</span>
                                <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvUpload} />
                            </label>
                        </div>

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
            <RejectModal isOpen={!!rejectTarget} onClose={() => setRejectTarget(null)} onConfirm={confirmReject} title="Reject Library Clearance" />
        </div>
    )
}
