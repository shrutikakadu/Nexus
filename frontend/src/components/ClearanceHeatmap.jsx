const DEPT_ICONS = {
    Library: '📚',
    Lab: '🔬',
    Accounts: '💰',
    Hostel: '🏠',
    HOD: '🎓',
    Principal: '🏛️',
}

export default function ClearanceHeatmap({ students = [], selectedStudent = null }) {
    const depts = ['Library', 'Lab', 'Accounts', 'Hostel', 'HOD', 'Principal']

    // If selectedStudent view, show compact 3x2 grid
    if (selectedStudent) {
        const heat = selectedStudent.heatmap || {}
        return (
            <div className="heatmap-card">
                <div className="heatmap-card-label">
                    Live Heatmap · <span style={{ color: 'var(--green)' }}>{selectedStudent.name}</span>
                </div>
                <div className="heatmap-grid">
                    {depts.map(d => {
                        const st = heat[d] || 'locked'
                        return (
                            <div key={d} className={`heatmap-cell ${st}`}>
                                <div className="heatmap-dept">{DEPT_ICONS[d]} {d}</div>
                                <div className="heatmap-status">
                                    {st === 'approved' ? 'Cleared ✓'
                                        : st === 'pending' ? 'Pending…'
                                        : st === 'rejected' ? 'Rejected ✗'
                                        : 'Waiting'}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // Full table view (HOD / Principal)
    return (
        <div className="table-card" style={{ marginTop: 0 }}>
            <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid var(--border)' }}>
                <div className="card-label" style={{ marginBottom: 0 }}>🗺️ Full Clearance Heatmap — All Students</div>
            </div>
            <table className="heatmap-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        {depts.map(d => <th key={d}>{DEPT_ICONS[d]} {d}</th>)}
                        <th>Overall</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(s => {
                        const heat = s.heatmap || {}
                        const allApproved = depts.every(d => heat[d] === 'approved')
                        const anyRejected = depts.some(d => heat[d] === 'rejected')
                        return (
                            <tr key={s.id}>
                                <td>
                                    <div className="student-cell">
                                        <div className={`student-avatar ${s.avatarClass || 'green-bg'}`}>{s.initials}</div>
                                        <div>
                                            <div className="student-name">{s.name}</div>
                                            <div className="student-roll">{s.roll}</div>
                                        </div>
                                    </div>
                                </td>
                                {depts.map(d => {
                                    const st = heat[d] || 'locked'
                                    const dotColor = st === 'approved' ? 'green' : st === 'rejected' ? 'red' : 'amber'
                                    return (
                                        <td key={d} style={{ textAlign: 'center' }}>
                                            <span className={`heatmap-dot ${dotColor}`} title={st} />
                                        </td>
                                    )
                                })}
                                <td>
                                    <span className={`badge ${allApproved ? 'green' : anyRejected ? 'red' : 'amber'}`}>
                                        {allApproved ? '✓ Cleared' : anyRejected ? '✗ Rejected' : '⏳ Pending'}
                                    </span>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
