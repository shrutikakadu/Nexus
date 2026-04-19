import { useState } from 'react'

// Role-specific default notifications
const ROLE_NOTIFS = {
    Library: [
        { id: 1, type: 'warn', icon: '⚠️', text: 'Pending: 3 students have unreturned library books', time: '10 min ago' },
        { id: 2, type: 'info', icon: '📌', text: 'New student registered — awaiting library clearance', time: '1 hr ago' },
        { id: 3, type: 'success', icon: '✅', text: 'Library inventory sync completed', time: '3 hrs ago' },
    ],
    Lab: [
        { id: 1, type: 'warn', icon: '⚠️', text: 'Pending: Lab manual submissions due this week', time: '15 min ago' },
        { id: 2, type: 'info', icon: '📌', text: 'Equipment return deadline approaching for 4 students', time: '2 hrs ago' },
        { id: 3, type: 'success', icon: '✅', text: 'Lab safety audit completed', time: '5 hrs ago' },
    ],
    Accounts: [
        { id: 1, type: 'warn', icon: '⚠️', text: 'Pending: 5 students have outstanding tuition fees', time: '20 min ago' },
        { id: 2, type: 'info', icon: '📌', text: 'Scholarship disbursement scheduled for next week', time: '1 hr ago' },
        { id: 3, type: 'error', icon: '❌', text: 'Payment gateway maintenance window: 2AM-4AM tomorrow', time: '3 hrs ago' },
    ],
    Hostel: [
        { id: 1, type: 'warn', icon: '⚠️', text: 'Pending: Room inspection for Block-B scheduled tomorrow', time: '30 min ago' },
        { id: 2, type: 'info', icon: '📌', text: 'Mess dues deadline: End of this month', time: '2 hrs ago' },
        { id: 3, type: 'success', icon: '✅', text: 'Day scholars cleared automatically', time: '4 hrs ago' },
    ],
    HOD: [
        { id: 1, type: 'warn', icon: '⚠️', text: 'Pending: 2 students have incomplete project submissions', time: '1 hr ago' },
        { id: 2, type: 'info', icon: '📌', text: 'Internship completion reports pending review', time: '3 hrs ago' },
        { id: 3, type: 'success', icon: '✅', text: 'Department clearance workflow updated', time: '5 hrs ago' },
    ],
    Principal: [
        { id: 1, type: 'info', icon: '📌', text: 'Final graduation clearance batch ready for review', time: '30 min ago' },
        { id: 2, type: 'success', icon: '✅', text: '12 students fully cleared across all departments', time: '2 hrs ago' },
        { id: 3, type: 'warn', icon: '⚠️', text: 'HOD approval still pending for 3 students', time: '4 hrs ago' },
    ],
}

export default function NotificationPanel({ onSend, role = 'Library' }) {
    const defaultNotifs = ROLE_NOTIFS[role] || ROLE_NOTIFS.Library
    const [notifs, setNotifs] = useState(defaultNotifs)
    const [message, setMessage] = useState('')
    const [sent, setSent] = useState(false)

    function handleSend() {
        if (!message.trim()) return;
        const newNotif = {
            id: Date.now(),
            type: 'info',
            icon: '📢',
            text: `Broadcast: "${message}"`,
            time: 'Just now',
        }
        setNotifs(prev => [newNotif, ...prev])
        setSent(true)
        onSend?.(message)
        setTimeout(() => setSent(false), 2000)
        setMessage('')
    }

    return (
        <div className="notif-card">
            <div className="card-label">🔔 {role} Notifications</div>
            {notifs.slice(0, 4).map(n => (
                <div key={n.id} className="notif-item">
                    <div className={`notif-icon ${n.type}`}>{n.icon}</div>
                    <div>
                        <div className="notif-text">{n.text}</div>
                        <div className="notif-time">{n.time}</div>
                    </div>
                </div>
            ))}
            <div className="notif-send-bar">
                <input
                    type="text"
                    className="notif-select"
                    placeholder="Type a message to broadcast..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && message.trim()) {
                            handleSend();
                        }
                    }}
                />
                <button className="btn btn-solid btn-sm" onClick={handleSend} disabled={!message.trim()}>
                    {sent ? '✓ Sent!' : 'Send'}
                </button>
            </div>
        </div>
    )
}
