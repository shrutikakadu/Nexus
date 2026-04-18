import { useState } from 'react'

// Templates removed to use custom messages instead

const SAMPLE_NOTIFS = [
    { id: 1, type: 'warn', icon: '⚠️', text: 'Tanaya P. has pending library books (3 books, ₹120 fine)', time: '10 min ago' },
    { id: 2, type: 'success', icon: '✅', text: 'Rohit Kumar approved for graduation clearance', time: '1 hr ago' },
    { id: 3, type: 'info', icon: '📌', text: 'Hritani Sharma submitted lab manual', time: '2 hrs ago' },
    { id: 4, type: 'error', icon: '❌', text: 'Neha Patel documents rejected — duplicate detected', time: 'Yesterday' },
]

export default function NotificationPanel({ onSend }) {
    const [notifs, setNotifs] = useState(SAMPLE_NOTIFS)
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
            <div className="card-label">🔔 Notifications</div>
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
