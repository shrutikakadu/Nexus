import { useState } from 'react'

export default function ClearanceTable({
    columns = [],
    data = [],
    onApprove,
    onReject,
    onRowClick,
    approvedIds = [],
    renderActions,
}) {
    const [activeTab, setActiveTab] = useState('pending')
    const [search, setSearch] = useState('')

    const filtered = data.filter(row => {
        const matchesSearch = !search ||
            (row.name?.toLowerCase().includes(search.toLowerCase())) ||
            (row.roll?.toLowerCase().includes(search.toLowerCase()))

        if (activeTab === 'pending') return matchesSearch && !approvedIds.includes(row.id) && row.status !== 'rejected'
        if (activeTab === 'approved') return matchesSearch && approvedIds.includes(row.id)
        if (activeTab === 'rejected') return matchesSearch && row.status === 'rejected'
        return matchesSearch
    })

    return (
        <div className="table-card">
            <div className="table-toolbar">
                <div className="table-tabs">
                    {['pending', 'approved', 'rejected'].map(tab => (
                        <button
                            key={tab}
                            className={`table-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="table-search">
                    <span>🔍</span>
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto', width: '100%' }}>
                <table className="cl-table">
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col.key}>{col.label}</th>
                            ))}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} style={{
                                    textAlign: 'center',
                                    padding: '2rem',
                                    color: 'var(--text3)',
                                    fontFamily: 'var(--mono)',
                                    fontSize: '0.8rem'
                                }}>
                                    No records found
                                </td>
                            </tr>
                        )}
                        {filtered.map(row => (
                            <tr
                                key={row.id}
                                className={approvedIds.includes(row.id) ? 'approved' : ''}
                                onClick={() => onRowClick?.(row)}
                            >
                                {columns.map(col => (
                                    <td key={col.key}>
                                        {col.key === 'student' ? (
                                            <div className="student-cell">
                                                <div className={`student-avatar ${row.avatarClass || 'green-bg'}`}>
                                                    {row.initials}
                                                </div>
                                                <div>
                                                    <div className="student-name">{row.name}</div>
                                                    <div className="student-roll">{row.roll}</div>
                                                </div>
                                            </div>
                                        ) : col.key === 'status' ? (
                                            <span className={`badge ${row.statusColor || 'amber'}`}>
                                                {row.statusLabel || 'Pending'}
                                            </span>
                                        ) : col.render ? (
                                            col.render(row)
                                        ) : (
                                            row[col.key]
                                        )}
                                    </td>
                                ))}
                                <td>
                                    {renderActions ? renderActions(row) : (
                                        <div className="action-group">
                                            <button
                                                className="btn btn-sm btn-approve"
                                                onClick={e => { e.stopPropagation(); onApprove?.(row) }}
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                className="btn btn-sm btn-reject"
                                                onClick={e => { e.stopPropagation(); onReject?.(row) }}
                                            >
                                                ✗ Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
