export default function StatsCard({ label, value, subtitle, color = 'green' }) {
    return (
        <div className={`stat-card ${color} animate-in`}>
            <div className="stat-label">{label}</div>
            <div className={`stat-value ${color}`}>{value}</div>
            <div className="stat-sub">{subtitle}</div>
        </div>
    )
}
