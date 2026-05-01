import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import StatsCard from '../../components/StatsCard'
import ClearanceTable from '../../components/ClearanceTable'
import NotificationPanel from '../../components/NotificationPanel'
import CertificateGenerator from '../../components/CertificateGenerator'
import DocumentViewer from '../../components/DocumentViewer'
import { getSubmissionsForAdmin, adminApprove, adminReject, onStoreUpdate } from '../../utils/clearanceStore'
import '../../styles/admin.css'

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
    const [selected, setSelected] = useState(null)
    const [toast, setToast] = useState({ msg: '', show: false })
    const [certStudent, setCertStudent] = useState(null)
    const [storeSubmissions, setStoreSubmissions] = useState([])
    const [viewingDocs, setViewingDocs] = useState(null)
    const [flagModal, setFlagModal] = useState(null)

    useEffect(() => {
        function loadSubmissions() { 
            const subs = getSubmissionsForAdmin('Principal')
            setStoreSubmissions(subs)
            if (!selected && subs.length > 0) setSelected({
                id: `store_${subs[0].studentId}`, studentId: subs[0].studentId, initials: subs[0].initials, avatarClass: subs[0].avatarClass || 'blue-bg',
                name: subs[0].studentName, roll: subs[0].studentId, dept: subs[0].dept || 'CS', hodApproval: subs[0].clearanceStatus?.['HOD'] === 'approved' ? 'Yes' : 'No',
                batch: subs[0].batch || '2025', cgpa: '8.5',
                status: subs[0].statusForRole, statusLabel: subs[0].statusForRole === 'approved' ? '🎓 Graduated' : 'Pending Principal',
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
            const res = adminApprove(s.studentId, 'Principal', 'Final graduation approved by Principal.')
            if (res.success) {
                setApprovedIds(p => [...p, s.id])
                showToast(`🎓 Final graduation approved for ${s.name}!`)
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
        if (s.studentId) adminReject(s.studentId, 'Principal', flagModal.reason)
        showToast(`✗ Graduation rejected for ${s.name}`)
        setFlagModal(null)
    }

    const tableData = storeSubmissions
        .filter(s => s.relevantDocs.length > 0 || s.statusForRole === 'pending' || s.statusForRole === 'approved' || s.statusForRole === 'rejected')
        .map(s => ({
            id: `store_${s.studentId}`, studentId: s.studentId, initials: s.initials, avatarClass: s.avatarClass || 'blue-bg',
            name: s.studentName, roll: s.studentId, dept: s.dept || 'CS', 
            hodApproval: s.clearanceStatus?.['HOD'] === 'approved' ? 'Yes' : 'No',
            batch: s.batch || '2025', cgpa: '8.5',
            status: approvedIds.includes(`store_${s.studentId}`) ? 'approved' : rejectedIds.includes(`store_${s.studentId}`) ? 'rejected' : s.statusForRole,
            statusColor: approvedIds.includes(`store_${s.studentId}`) ? 'green' : rejectedIds.includes(`store_${s.studentId}`) ? 'red' : (s.statusForRole === 'approved' ? 'green' : 'amber'),
            statusLabel: approvedIds.includes(`store_${s.studentId}`) ? '🎓 Graduated' : rejectedIds.includes(`store_${s.studentId}`) ? 'Rejected' : (s.statusForRole === 'approved' ? '🎓 Graduated' : 'Pending Principal'),
            documents: s.relevantDocs, fromStore: true,
        }))

    return (
        <div className="admin-layout">
            <AdminSidebar role="principal" activeItem={activeItem} onNavigate={setActiveItem} badges={{ pending: tableData.filter(x=>x.status==='pending').length, notifs: 5 }} />
            <main className="admin-content">
                <div className="admin-header">
                    <div className="admin-header-left"><h1>Principal Dashboard</h1><p>Final authority — graduation approval &amp; certificate generation</p></div>
                    <div className="admin-header-actions"><button className="btn btn-outline" onClick={() => showToast('Report exported')}>↓ Export</button></div>
                </div>

                {activeItem === 'certificates' && (
                    <div>
                        <div style={{ marginBottom: '1rem' }}>
                            <div className="card-label">Select student to generate certificate</div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {tableData.filter(s => s.status === 'approved').map(s => (
                                    <button key={s.id} className={`btn ${certStudent?.id === s.id ? 'btn-solid' : 'btn-outline'}`} onClick={() => setCertStudent(s)}>
                                        {s.initials} {s.name}
                                    </button>
                                ))}
                                {tableData.filter(s => s.status === 'approved').length === 0 && (
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
                                <StatsCard label="Approvals Pending" value={tableData.filter(x=>x.status==='pending').length} subtitle="Final sign-off" color="amber" />
                                <StatsCard label="Certificates Generated" value={tableData.filter(x=>x.status==='approved').length} subtitle="Today" color="green" />
                                <StatsCard label="Total Graduates" value="89" subtitle="This batch" color="blue" />
                            </div>
                        )}
                        <div className="content-left">
                                <ClearanceTable columns={COLUMNS} data={tableData} approvedIds={approvedIds} onApprove={handleApprove} onReject={handleReject} onRowClick={setSelected}
                                    renderActions={(row) => (
                                        <div className="action-group">
                                            {row.status === 'approved'
                                                ? <button className="btn btn-sm btn-solid" onClick={e => { e.stopPropagation(); setCertStudent(row); setActiveItem('certificates') }}>📜 Certificate</button>
                                                : <>
                                                    <button className="btn btn-sm btn-approve" onClick={e => { e.stopPropagation(); handleApprove(row) }}>✓ Approve</button>
                                                    <button className="btn btn-sm btn-reject" onClick={e => { e.stopPropagation(); handleReject(row) }}>✗ Reject</button>
                                                </>
                                            }
                                        </div>
                                    )}
                                />
                                {selected && (
                                    <div className="detail-card">
                                        <div className="detail-header">
                                            <div className={`student-avatar ${selected.avatarClass}`} style={{ width: 44, height: 44 }}>{selected.initials}</div>
                                            <div><div className="detail-name">{selected.name}</div><div className="detail-sub">{selected.roll} — {selected.dept} — {selected.batch}</div></div>
                                            <div className={`detail-status ${selected.status === 'approved' ? 'approved' : 'pending'}`}>{selected.statusLabel}</div>
                                        </div>
                                        <div className="detail-actions">
                                            {selected.status === 'approved' ? (
                                                <button className="btn btn-solid" onClick={() => { setCertStudent(selected); setActiveItem('certificates') }}>📜 Generate Certificate</button>
                                            ) : (
                                                <>
                                                    <button className="btn btn-solid" onClick={() => handleApprove(selected)}>🎓 Approve Graduation →</button>
                                                    <button className="btn btn-reject" onClick={() => handleReject(selected)}>✗ Reject</button>
                                                </>
                                            )}
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
            {viewingDocs && <DocumentViewer role="Principal" studentId={viewingDocs.studentId} studentName={viewingDocs.studentName} onClose={() => setViewingDocs(null)} />}
        </div>
    )
}
