import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import StatsCard from '../../components/StatsCard'
import ClearanceTable from '../../components/ClearanceTable'
import NotificationPanel from '../../components/NotificationPanel'
import DocumentViewer from '../../components/DocumentViewer'
import { getSubmissionsForAdmin, adminApprove, adminReject, onStoreUpdate } from '../../utils/clearanceStore'
import '../../styles/admin.css'

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
    const [selected, setSelected] = useState(null)
    const [toast, setToast] = useState({ msg: '', show: false })
    const [storeSubmissions, setStoreSubmissions] = useState([])
    const [viewingDocs, setViewingDocs] = useState(null)
    const [flagModal, setFlagModal] = useState(null)

    useEffect(() => {
        function loadSubmissions() { 
            const subs = getSubmissionsForAdmin('Accounts')
            setStoreSubmissions(subs)
            if (!selected && subs.length > 0) setSelected({
                id: `store_${subs[0].studentId}`, studentId: subs[0].studentId, initials: subs[0].initials, avatarClass: subs[0].avatarClass || 'blue-bg',
                name: subs[0].studentName, roll: subs[0].studentId, 
                tuition: (subs[0].dues || []).some(d => d.dept === 'Accounts' && !d.paid) ? 'Pending' : 'Paid', 
                libraryFine: (subs[0].dues || []).some(d => d.dept === 'Library' && !d.paid) ? 'Due' : '₹0', 
                hostelFees: (subs[0].dues || []).some(d => d.dept === 'Hostel' && !d.paid) ? 'Pending' : 'Paid',
                statusColor: subs[0].statusForRole === 'approved' ? 'green' : 'amber',
                statusLabel: subs[0].statusForRole === 'approved' ? 'Cleared' : 'Pending',
                documents: subs[0].documents, fromStore: true,
            })
        }
        loadSubmissions()
        return onStoreUpdate(loadSubmissions)
    }, [])

    function showToast(msg) { setToast({ msg, show: true }); setTimeout(() => setToast(t => ({ ...t, show: false })), 2800) }

    function handleApprove(s) {
        if (approvedIds.includes(s.id)) return
        if (s.studentId) {
            const res = adminApprove(s.studentId, 'Accounts', 'Accounts clearance approved. All fees paid.')
            if (res.success) {
                setApprovedIds(p => [...p, s.id])
                showToast(`✓ Accounts clearance approved for ${s.name}`)
            } else {
                showToast(res.message)
            }
        }
    }
    function handleReject(s) {
        setFlagModal({ student: s, reason: '' })
    }
    function confirmReject() {
        if (!flagModal?.reason) { showToast('Please enter a reason'); return }
        const s = flagModal.student
        setRejectedIds(p => [...p, s.id])
        if (s.studentId) adminReject(s.studentId, 'Accounts', flagModal.reason)
        showToast(`✗ Accounts clearance rejected for ${s.name}`)
        setFlagModal(null)
    }

    const tableData = storeSubmissions
        .filter(s => s.relevantDocs.length > 0 || s.statusForRole === 'pending' || s.statusForRole === 'approved' || s.statusForRole === 'rejected')
        .map(s => ({
            id: `store_${s.studentId}`, studentId: s.studentId, initials: s.initials, avatarClass: s.avatarClass || 'blue-bg',
            name: s.studentName, roll: s.studentId, 
            tuition: (s.dues || []).some(d => d.dept === 'Accounts' && !d.paid) ? 'Pending' : 'Paid', 
            libraryFine: (s.dues || []).some(d => d.dept === 'Library' && !d.paid) ? 'Due' : '₹0', 
            hostelFees: (s.dues || []).some(d => d.dept === 'Hostel' && !d.paid) ? 'Pending' : 'Paid',
            status: approvedIds.includes(`store_${s.studentId}`) ? 'approved' : rejectedIds.includes(`store_${s.studentId}`) ? 'rejected' : s.statusForRole,
            statusColor: approvedIds.includes(`store_${s.studentId}`) ? 'green' : rejectedIds.includes(`store_${s.studentId}`) ? 'red' : (s.statusForRole === 'approved' ? 'green' : 'amber'),
            statusLabel: approvedIds.includes(`store_${s.studentId}`) ? 'Cleared' : rejectedIds.includes(`store_${s.studentId}`) ? 'Rejected' : (s.statusForRole === 'approved' ? 'Cleared' : 'Pending'),
            documents: s.relevantDocs, fromStore: true,
        }))

    return (
        <div className="admin-layout">
            <AdminSidebar role="accounts" activeItem={activeItem} onNavigate={setActiveItem} badges={{ pending: tableData.filter(x=>x.status==='pending').length, notifs: 3 }} />
            <main className="admin-content">
                <div className="admin-header">
                    <div className="admin-header-left"><h1>Accounts Dashboard</h1><p>Verify fee payments and financial dues clearance</p></div>
                    <div className="admin-header-actions">
                        <button className="btn btn-outline" onClick={() => showToast('Report exported')}>↓ Export</button>
                    </div>
                </div>

                {(activeItem === 'dashboard' || activeItem === 'clearances') && (
                    <>
                        {activeItem === 'dashboard' && (
                            <div className="stats-grid">
                                <StatsCard label="Pending Fee Dues" value={tableData.filter(x=>x.status==='pending').length} subtitle="Students with dues" color="red" />
                                <StatsCard label="Total Fines Collected" value="₹8,340" subtitle="This batch" color="green" />
                                <StatsCard label="Confirmations Today" value="12" subtitle="Payments verified" color="blue" />
                                <StatsCard label="Overdue Payments" value="7" subtitle="Action required" color="amber" />
                            </div>
                        )}
                        <div className="content-left">
                                <ClearanceTable columns={COLUMNS} data={tableData} approvedIds={approvedIds} onApprove={handleApprove} onReject={handleReject} onRowClick={setSelected}
                                    renderActions={(row) => (
                                        <div className="action-group">
                                            <button className="btn btn-sm btn-outline" onClick={e => { e.stopPropagation(); setViewingDocs({ studentId: row.studentId, studentName: row.name }) }}>📄 Docs</button>
                                            <button className="btn btn-sm btn-approve" onClick={e => { e.stopPropagation(); handleApprove(row) }}>✓ Clear</button>
                                            <button className="btn btn-sm btn-reject" onClick={e => { e.stopPropagation(); handleReject(row) }}>✗ Reject</button>
                                        </div>
                                    )}
                                />
                                {selected && (
                                    <div className="detail-card">
                                        <div className="detail-header">
                                            <div className={`student-avatar ${selected.avatarClass}`} style={{ width: 44, height: 44 }}>{selected.initials}</div>
                                            <div><div className="detail-name">{selected.name}</div><div className="detail-sub">{selected.roll} — B.Tech CS — Batch 2025</div></div>
                                            <div className={`detail-status ${selected.status === 'approved' ? 'approved' : 'rejected'}`}>{selected.statusLabel}</div>
                                        </div>
                                        <div className="detail-section-label">Payment Details</div>
                                        <div className="detail-info-grid">
                                            <div className="detail-info-item"><div className="detail-info-label">Tuition Fees</div><div className="detail-info-value" style={{ color: selected.tuition === 'Paid' ? 'var(--green)' : 'var(--red)' }}>{selected.tuition}</div></div>
                                            <div className="detail-info-item"><div className="detail-info-label">Library Fine</div><div className="detail-info-value" style={{ color: selected.libraryFine === '₹0' ? 'var(--green)' : 'var(--red)' }}>{selected.libraryFine}</div></div>
                                            <div className="detail-info-item"><div className="detail-info-label">Hostel Fees</div><div className="detail-info-value" style={{ color: selected.hostelFees === 'Paid' ? 'var(--green)' : 'var(--red)' }}>{selected.hostelFees}</div></div>
                                        </div>
                                        <div className="detail-actions">
                                            <button className="btn btn-solid" onClick={() => handleApprove(selected)}>✓ Approve Accounts Clearance →</button>
                                            <button className="btn btn-reject" onClick={() => handleReject(selected)}>✗ Reject</button>
                                        </div>
                                    </div>
                                )}
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
            {viewingDocs && <DocumentViewer role="Accounts" studentId={viewingDocs.studentId} studentName={viewingDocs.studentName} onClose={() => setViewingDocs(null)} />}
        </div>
    )
}
