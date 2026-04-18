import { useState } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import StatsCard from '../../components/StatsCard'
import ClearanceTable from '../../components/ClearanceTable'
import ClearanceHeatmap from '../../components/ClearanceHeatmap'
import NotificationPanel from '../../components/NotificationPanel'
import '../../styles/admin.css'

const STUDENTS = [
    { id: 's1', initials: 'TP', avatarClass: 'green-bg', name: 'Tanaya Patel', roll: '2021CS001', room: 'B203', messDues: '₹0', damage: 'None', statusColor: 'amber', statusLabel: 'Pending', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'approved', Hostel: 'pending', HOD: 'pending', Principal: 'locked' } },
    { id: 's2', initials: 'HS', avatarClass: 'blue-bg', name: 'Hritani Sharma', roll: '2021CS042', room: 'A104', messDues: '₹800', damage: 'Minor', statusColor: 'red', statusLabel: 'Dues + Damage', heatmap: { Library: 'pending', Lab: 'approved', Accounts: 'approved', Hostel: 'pending', HOD: 'locked', Principal: 'locked' } },
    { id: 's3', initials: 'RK', avatarClass: 'amber-bg', name: 'Rohit Kumar', roll: '2021CS017', room: 'C312', messDues: '₹200', damage: 'None', statusColor: 'amber', statusLabel: 'Mess Dues', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'approved', Hostel: 'pending', HOD: 'locked', Principal: 'locked' } },
    { id: 's4', initials: 'VR', avatarClass: 'purple-bg', name: 'Varun Reddy', roll: '2021CS072', room: 'N/A', messDues: '₹0', damage: 'None', statusColor: 'green', statusLabel: 'Day Scholar', heatmap: { Library: 'approved', Lab: 'approved', Accounts: 'approved', Hostel: 'approved', HOD: 'approved', Principal: 'pending' } },
]

const COLUMNS = [
    { key: 'student', label: 'Student' },
    { key: 'room', label: 'Room No' },
    { key: 'messDues', label: 'Mess Dues', render: (r) => <span style={{ color: r.messDues !== '₹0' ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>{r.messDues}</span> },
    { key: 'damage', label: 'Damage', render: (r) => <span className={`badge ${r.damage === 'None' ? 'green' : 'red'}`}>{r.damage}</span> },
    { key: 'status', label: 'Status' },
]

export default function HostelDashboard() {
    const [activeItem, setActiveItem] = useState('dashboard')
    const [approvedIds, setApprovedIds] = useState([])
    const [rejectedIds, setRejectedIds] = useState([])
    const [selected, setSelected] = useState(STUDENTS[0])
    const [toast, setToast] = useState({ msg: '', show: false })
    const [pendingCount, setPendingCount] = useState(3)

    function showToast(msg) { setToast({ msg, show: true }); setTimeout(() => setToast(t => ({ ...t, show: false })), 2800) }

    function handleApprove(s) {
        if (approvedIds.includes(s.id)) return
        if (s.messDues !== '₹0' || s.damage !== 'None') { showToast(`⚠️ Cannot approve — ${s.name} has hostel dues/damage`); return }
        setApprovedIds(p => [...p, s.id]); setPendingCount(p => Math.max(0, p - 1))
        showToast(`✓ Hostel clearance approved for ${s.name}`)
    }
    function handleReject(s) { setRejectedIds(p => [...p, s.id]); showToast(`✗ Hostel clearance rejected for ${s.name}`) }

    const tableData = STUDENTS.map(s => ({
        ...s,
        status: approvedIds.includes(s.id) ? 'approved' : rejectedIds.includes(s.id) ? 'rejected' : 'pending',
        statusColor: approvedIds.includes(s.id) ? 'green' : rejectedIds.includes(s.id) ? 'red' : s.statusColor,
        statusLabel: approvedIds.includes(s.id) ? 'Cleared' : rejectedIds.includes(s.id) ? 'Rejected' : s.statusLabel,
    }))

    return (
        <div className="admin-layout">
            <AdminSidebar role="hostel" activeItem={activeItem} onNavigate={setActiveItem} badges={{ pending: pendingCount, notifs: 2 }} />
            <main className="admin-content">
                <div className="admin-header">
                    <div className="admin-header-left"><h1>Hostel Dashboard</h1><p>Verify room vacating, mess dues, and damage clearance</p></div>
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
                                <StatsCard label="Yet to Vacate" value={pendingCount} subtitle="Rooms still occupied" color="amber" />
                                <StatsCard label="Damage Reports" value="2" subtitle="Pending inspection" color="red" />
                                <StatsCard label="Mess Dues Pending" value="₹1,000" subtitle="Uncollected" color="red" />
                                <StatsCard label="Rooms Inspected" value="98" subtitle="Cleared for handover" color="green" />
                            </div>
                        )}
                        <div className="content-left">
                                <ClearanceTable columns={COLUMNS} data={tableData} approvedIds={approvedIds} onApprove={handleApprove} onReject={handleReject} onRowClick={setSelected}
                                    renderActions={(row) => (
                                        <div className="action-group">
                                            <button className="btn btn-sm btn-outline" onClick={e => { e.stopPropagation(); showToast(`Room ${row.room} marked as inspected`) }}>🔍 Inspect</button>
                                            {row.damage !== 'None' && <button className="btn btn-sm btn-amber" onClick={e => { e.stopPropagation(); showToast(`Damage fine added for ${row.name}`) }}>+ Fine</button>}
                                            <button className="btn btn-sm btn-approve" onClick={e => { e.stopPropagation(); handleApprove(row) }}>✓ Approve</button>
                                            <button className="btn btn-sm btn-reject" onClick={e => { e.stopPropagation(); handleReject(row) }}>✗ Reject</button>
                                        </div>
                                    )}
                                />
                                <div className="detail-card">
                                    <div className="detail-header">
                                        <div className={`student-avatar ${selected.avatarClass}`} style={{ width: 44, height: 44 }}>{selected.initials}</div>
                                        <div><div className="detail-name">{selected.name}</div><div className="detail-sub">{selected.roll} — Room {selected.room}</div></div>
                                        <div className={`detail-status ${selected.messDues === '₹0' && selected.damage === 'None' ? 'approved' : 'rejected'}`}>
                                            {selected.messDues === '₹0' && selected.damage === 'None' ? 'Ready to Clear' : 'Dues/Damage Pending'}
                                        </div>
                                    </div>
                                    <div className="detail-section-label">Hostel Details</div>
                                    <div className="detail-info-grid">
                                        <div className="detail-info-item"><div className="detail-info-label">Room Number</div><div className="detail-info-value">{selected.room}</div></div>
                                        <div className="detail-info-item"><div className="detail-info-label">Mess Dues</div><div className="detail-info-value" style={{ color: selected.messDues !== '₹0' ? 'var(--red)' : 'var(--green)' }}>{selected.messDues}</div></div>
                                        <div className="detail-info-item"><div className="detail-info-label">Room Damage</div><div className="detail-info-value" style={{ color: selected.damage !== 'None' ? 'var(--red)' : 'var(--green)' }}>{selected.damage}</div></div>
                                        <div className="detail-info-item"><div className="detail-info-label">Vacating Date</div><div className="detail-info-value">Apr 20, 2025</div></div>
                                    </div>
                                    <div className="detail-actions">
                                        <button className="btn btn-solid" onClick={() => handleApprove(selected)}>✓ Approve Hostel Clearance →</button>
                                        <button className="btn btn-reject" onClick={() => handleReject(selected)}>✗ Reject</button>
                                    </div>
                                </div>
                        </div>
                    </>
                )}
            </main>
            <div className={`admin-toast ${toast.show ? 'visible' : 'hidden'}`}>{toast.msg}</div>
        </div>
    )
}
