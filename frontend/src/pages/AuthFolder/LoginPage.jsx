import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
    const navigate = useNavigate()
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div>
                <h2>Login</h2>
                <button onClick={() => navigate('/student')}>Go to Dashboard</button>
            </div>
        </div>
    )
}