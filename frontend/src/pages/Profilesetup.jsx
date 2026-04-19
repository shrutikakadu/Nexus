import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'academic', label: 'Academic Info', icon: '🎓' },
    { id: 'contact', label: 'Contact & Stay', icon: '📍' },
    { id: 'review', label: 'Review & Save', icon: '✅' },
]

const DEPTS = ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Electrical Engineering', 'Biotechnology']
const BATCHES = ['2025', '2026', '2027', '2028']
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8']

const G = '#1a7a4a'; const GM = '#22a05e'; const GL = '#d6f0e2'; const GX = '#eaf7f0'
const T = '#0f2718'; const T2 = '#3d6b4f'; const T3 = '#7aaa8a'
const B = '#d4ead9'; const B2 = '#c0dfc8'; const BG = '#f0f7f3'; const S = '#fff'
const R = '#c0392b'; const RL = '#fdecea'



import React from 'react';
const ProfileStyles = React.memo(() => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus { border-color: #22a05e !important; box-shadow: 0 0 0 3px rgba(34,160,94,0.12); }
    `}</style>
));

export default function ProfileSetup({ editMode = false }) {
    const navigate = useNavigate()
    const [step, setStep] = useState(0)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const email = localStorage.getItem('nexus_email') || ''

    const [form, setForm] = useState({
        roll: '', name: '', dob: '', gender: '',
        dept: '', batch: '', semester: '', cgpa: '', advisor: '',
        phone: '', hostel: '', college: 'Nexus Institute of Technology',
        email,
    })

    // Load existing profile if in edit mode
    useEffect(() => {
        const roll = localStorage.getItem('nexus_roll')
        if (editMode && roll) {
            fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/auth/profile/${roll}`)
                .then(r => r.json())
                .then(data => { if (data.roll) setForm(prev => ({ ...prev, ...data })) })
                .catch(() => { })
        }
    }, [editMode])

    function set(field, val) {
        setForm(prev => ({ ...prev, [field]: val }))
    }

    function canNext() {
        if (step === 0) return form.name && form.dob && form.gender
        if (step === 1) return form.roll && form.dept && form.batch && form.semester && form.cgpa
        if (step === 2) return form.phone && form.college
        return true
    }

    async function handleSave() {
        setSaving(true)
        setError('')
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/auth/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (res.ok) {
                localStorage.setItem('nexus_roll', form.roll)
                localStorage.setItem('nexus_profile', JSON.stringify(data.profile))
                navigate('/student')
            } else {
                setError(data.detail || 'Failed to save profile.')
            }
        } catch {
            // Offline fallback — save to localStorage
            const profile = { ...form, clearance_id: `NX-${form.batch}-${form.roll.slice(-3)}`, profile_complete: true }
            localStorage.setItem('nexus_roll', form.roll)
            localStorage.setItem('nexus_profile', JSON.stringify(profile))
            navigate('/student')
        } finally {
            setSaving(false)
        }
    }

    const inputStyle = {
        width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
        border: `1.5px solid ${B}`, fontFamily: 'inherit', fontSize: '0.9rem',
        color: T, outline: 'none', boxSizing: 'border-box', background: S,
    }

    const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: T2, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }

    return (
        <div style={{ minHeight: '100vh', background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: T }}>
            <ProfileStyles />

            {/* TOP BAR */}
            <div style={{ background: S, borderBottom: `1px solid ${B}`, padding: '0 2rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.9rem', letterSpacing: '0.18em', color: G, textTransform: 'uppercase' }}>NEXUS</div>
                <div style={{ fontSize: '0.82rem', color: T3 }}>{editMode ? 'Edit Profile' : 'Complete your profile to continue'}</div>
                {editMode && <button onClick={() => navigate('/student')} style={{ background: 'none', border: `1px solid ${B}`, borderRadius: 8, padding: '0.4rem 1rem', fontSize: '0.8rem', color: T3, cursor: 'pointer', fontFamily: 'inherit' }}>← Back to Dashboard</button>}
            </div>

            <div style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 2rem' }}>
                {/* HEADER */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '2rem', marginBottom: 8 }}>
                        {editMode ? 'Edit Your Profile' : 'Set Up Your Profile'}
                    </div>
                    <div style={{ color: T3, fontSize: '0.9rem' }}>
                        {editMode ? 'Update your details below.' : 'Fill in your details once. We\'ll remember everything.'}
                    </div>
                </div>

                {/* STEP INDICATORS */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
                    {STEPS.map((s, i) => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: i < step ? GM : i === step ? G : B, color: i <= step ? S : T3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i < step ? '0.9rem' : '0.85rem', fontWeight: 700, transition: 'all 0.3s' }}>
                                    {i < step ? '✓' : s.icon}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: i === step ? G : T3, fontWeight: i === step ? 700 : 400, whiteSpace: 'nowrap' }}>{s.label}</div>
                            </div>
                            {i < STEPS.length - 1 && <div style={{ width: 40, height: 2, background: i < step ? GM : B, marginBottom: 16, transition: 'all 0.3s' }} />}
                        </div>
                    ))}
                </div>

                {/* FORM CARD */}
                <div style={{ background: S, border: `1px solid ${B}`, borderRadius: 20, padding: '2rem', marginBottom: '1.5rem' }}>

                    {/* STEP 0 — Personal */}
                    {step === 0 && (
                        <>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem', color: T }}>👤 Personal Information</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                                <div style={{ marginBottom: '1.1rem' }}>
                                    <label style={labelStyle}>Full Name<span style={{ color: R, marginLeft: 3 }}>*</span></label>
                                    <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Hritani Sharma" />
                                </div>
                                <div style={{ marginBottom: '1.1rem' }}>
                                    <label style={labelStyle}>Roll Number<span style={{ color: R, marginLeft: 3 }}>*</span></label>
                                    <input style={inputStyle} value={form.roll} onChange={e => set('roll', e.target.value)} placeholder="e.g. CS2025041" />
                                </div>
                                <div style={{ marginBottom: '1.1rem' }}>
                                    <label style={labelStyle}>Date of Birth<span style={{ color: R, marginLeft: 3 }}>*</span></label>
                                    <input style={inputStyle} value={form.dob} onChange={e => set('dob', e.target.value)} type="date" />
                                </div>
                                <div style={{ marginBottom: '1.1rem' }}>
                                    <label style={labelStyle}>Gender<span style={{ color: R, marginLeft: 3 }}>*</span></label>
                                    <select style={{...inputStyle, cursor: 'pointer'}} value={form.gender} onChange={e => set('gender', e.target.value)}>
                                        <option value="">Select gender</option>
                                        {['Female', 'Male', 'Other', 'Prefer not to say'].map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.1rem' }}>
                                <label style={labelStyle}>College Name<span style={{ color: R, marginLeft: 3 }}>*</span></label>
                                <input style={inputStyle} value={form.college} onChange={e => set('college', e.target.value)} placeholder="Your college name" />
                            </div>
                        </>
                    )}

                    {/* STEP 1 — Academic */}
                    {step === 1 && (
                        <>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem', color: T }}>🎓 Academic Information</div>
                            <div style={{ marginBottom: '1.1rem' }}>
                                <label style={labelStyle}>Department<span style={{ color: R, marginLeft: 3 }}>*</span></label>
                                <select style={{...inputStyle, cursor: 'pointer'}} value={form.dept} onChange={e => set('dept', e.target.value)}>
                                    <option value="">Select department</option>
                                    {DEPTS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 1rem' }}>
                                <div style={{ marginBottom: '1.1rem' }}>
                                    <label style={labelStyle}>Batch (Graduation Year)<span style={{ color: R, marginLeft: 3 }}>*</span></label>
                                    <select style={{...inputStyle, cursor: 'pointer'}} value={form.batch} onChange={e => set('batch', e.target.value)}>
                                        <option value="">Select batch</option>
                                        {BATCHES.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1.1rem' }}>
                                    <label style={labelStyle}>Current Semester<span style={{ color: R, marginLeft: 3 }}>*</span></label>
                                    <select style={{...inputStyle, cursor: 'pointer'}} value={form.semester} onChange={e => set('semester', e.target.value)}>
                                        <option value="">Semester</option>
                                        {SEMESTERS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1.1rem' }}>
                                    <label style={labelStyle}>CGPA<span style={{ color: R, marginLeft: 3 }}>*</span></label>
                                    <input style={inputStyle} value={form.cgpa} onChange={e => set('cgpa', e.target.value)} placeholder="e.g. 8.7" type="number" step="0.1" min="0" max="10" />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.1rem' }}>
                                <label style={labelStyle}>Academic Advisor / Faculty Mentor</label>
                                <input style={inputStyle} value={form.advisor} onChange={e => set('advisor', e.target.value)} placeholder="e.g. Dr. Priya Nair" />
                            </div>
                        </>
                    )}

                    {/* STEP 2 — Contact */}
                    {step === 2 && (
                        <>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem', color: T }}>📍 Contact & Accommodation</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                                <div style={{ marginBottom: '1.1rem' }}>
                                    <label style={labelStyle}>Email Address</label>
                                    <input style={inputStyle} value={form.email} onChange={e => set('email', e.target.value)} type="email" placeholder="your@email.com" />
                                </div>
                                <div style={{ marginBottom: '1.1rem' }}>
                                    <label style={labelStyle}>Phone Number<span style={{ color: R, marginLeft: 3 }}>*</span></label>
                                    <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.1rem' }}>
                                <label style={labelStyle}>Hostel / Accommodation</label>
                                <input style={inputStyle} value={form.hostel} onChange={e => set('hostel', e.target.value)} placeholder="e.g. Block C, Room 204 (or Day Scholar)" />
                            </div>
                            <div style={{ background: GX, border: `1px solid ${B2}`, borderRadius: 10, padding: '0.85rem 1rem', fontSize: '0.82rem', color: T2 }}>
                                💡 This information is used only for clearance communication and won't be shared publicly.
                            </div>
                        </>
                    )}

                    {/* STEP 3 — Review */}
                    {step === 3 && (
                        <>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.5rem', color: T }}>✅ Review Your Profile</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                {[
                                    ['Name', form.name], ['Roll No.', form.roll], ['DOB', form.dob],
                                    ['Gender', form.gender], ['Department', form.dept], ['Batch', form.batch],
                                    ['Semester', form.semester], ['CGPA', form.cgpa], ['Advisor', form.advisor || '—'],
                                    ['Email', form.email], ['Phone', form.phone], ['Hostel', form.hostel || '—'],
                                    ['College', form.college],
                                ].map(([k, v]) => (
                                    <div key={k} style={{ background: BG, borderRadius: 10, padding: '0.75rem 1rem' }}>
                                        <div style={{ fontSize: '0.65rem', color: T3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{k}</div>
                                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: T }}>{v || '—'}</div>
                                    </div>
                                ))}
                            </div>
                            {error && <div style={{ background: RL, color: R, padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.83rem', marginBottom: '1rem' }}>{error}</div>}
                            <div style={{ background: GX, border: `1px solid ${B2}`, borderRadius: 10, padding: '0.85rem 1rem', fontSize: '0.82rem', color: T2, marginBottom: '0.5rem' }}>
                                ✨ Your Clearance ID will be: <strong style={{ color: G, fontFamily: "'DM Mono',monospace" }}>NX-{form.batch}-{form.roll.slice(-3) || '???'}</strong>
                            </div>
                        </>
                    )}
                </div>

                {/* NAVIGATION BUTTONS */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
                    {step > 0
                        ? <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: '0.85rem', background: S, border: `1.5px solid ${B}`, borderRadius: 10, color: T2, fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>← Back</button>
                        : <div style={{ flex: 1 }} />
                    }
                    {step < STEPS.length - 1 ? (
                        <button
                            onClick={() => canNext() && setStep(s => s + 1)}
                            disabled={!canNext()}
                            style={{ flex: 2, padding: '0.85rem', background: canNext() ? G : B, color: canNext() ? S : T3, border: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 600, cursor: canNext() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                            Continue →
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{ flex: 2, padding: '0.85rem', background: G, color: S, border: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                            {saving ? '⏳ Saving...' : editMode ? '✓ Save Changes' : '🚀 Launch My Dashboard'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}