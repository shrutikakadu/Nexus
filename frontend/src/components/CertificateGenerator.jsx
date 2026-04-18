import { useState } from 'react'

function generateCertificateHTML(student, type) {
    const now = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    const qr = `https://nexus.college.edu/verify/${student.roll}`

    const titles = {
        degree: 'DEGREE CERTIFICATE',
        provisional: 'PROVISIONAL CERTIFICATE',
        transcript: 'ACADEMIC TRANSCRIPT',
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${titles[type]} — ${student.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;600&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; background: #fff; color: #0f2718; }
    .cert { max-width: 800px; margin: 40px auto; border: 3px solid #1a7a4a; padding: 50px; position: relative; }
    .cert::before { content: ''; position: absolute; inset: 8px; border: 1px solid #d4ead9; pointer-events: none; }
    .cert-logo { font-family: 'DM Mono', monospace; font-size: 0.9rem; letter-spacing: 0.3em; color: #1a7a4a; text-align: center; text-transform: uppercase; margin-bottom: 0.5rem; }
    .cert-college { font-family: 'DM Serif Display', serif; font-size: 2rem; color: #0f2718; text-align: center; margin-bottom: 0.25rem; }
    .cert-sub { font-size: 0.85rem; color: #3d6b4f; text-align: center; margin-bottom: 2rem; }
    .cert-divider { border: none; border-top: 2px solid #d4ead9; margin: 1.5rem 0; }
    .cert-title { font-family: 'DM Serif Display', serif; font-size: 1.6rem; color: #1a7a4a; text-align: center; letter-spacing: 0.05em; margin-bottom: 1.5rem; }
    .cert-body { font-size: 1rem; line-height: 2; text-align: center; margin-bottom: 2rem; color: #3d6b4f; }
    .cert-name { font-family: 'DM Serif Display', serif; font-size: 2rem; color: #0f2718; display: block; margin: 0.25rem 0; }
    .cert-details { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: #eaf7f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; }
    .cert-detail-item { text-align: left; }
    .cert-detail-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.12em; color: #7aaa8a; }
    .cert-detail-value { font-weight: 600; color: #0f2718; margin-top: 0.2rem; }
    .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 2rem; }
    .cert-sig { text-align: center; }
    .cert-sig-line { width: 150px; border-top: 1.5px solid #1a7a4a; margin-bottom: 0.5rem; }
    .cert-sig-name { font-size: 0.8rem; font-weight: 600; color: #0f2718; }
    .cert-sig-role { font-size: 0.68rem; color: #7aaa8a; }
    .cert-qr { font-size: 0.65rem; color: #7aaa8a; text-align: right; }
    .cert-qr-code { width: 60px; height: 60px; background: #eaf7f0; border: 1px solid #d4ead9; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin-left: auto; margin-bottom: 0.25rem; }
    .cert-date { font-size: 0.8rem; color: #7aaa8a; text-align: center; margin-bottom: 1rem; }
    .cert-stamp { position: absolute; bottom: 60px; right: 60px; width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(26,122,74,0.3); display: flex; align-items: center; justify-content: center; font-size: 0.55rem; text-align: center; color: rgba(26,122,74,0.5); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; transform: rotate(-15deg); }
  </style>
</head>
<body>
  <div class="cert">
    <div class="cert-stamp">VERIFIED<br/>NEXUS<br/>PORTAL</div>
    <div class="cert-logo">NEXUS · GRADUATION PORTAL</div>
    <div class="cert-college">State Institute of Technology</div>
    <div class="cert-sub">Accredited by NAAC · Affiliated to State University</div>
    <hr class="cert-divider" />
    <div class="cert-title">${titles[type]}</div>
    <div class="cert-body">
      This is to certify that
      <span class="cert-name">${student.name}</span>
      has successfully completed all requirements for the degree of<br/>
      <strong>Bachelor of Technology in ${student.dept || 'Computer Science & Engineering'}</strong>
    </div>
    <div class="cert-details">
      <div class="cert-detail-item">
        <div class="cert-detail-label">Roll Number</div>
        <div class="cert-detail-value">${student.roll}</div>
      </div>
      <div class="cert-detail-item">
        <div class="cert-detail-label">Batch</div>
        <div class="cert-detail-value">${student.batch || '2021–2025'}</div>
      </div>
      <div class="cert-detail-item">
        <div class="cert-detail-label">Department</div>
        <div class="cert-detail-value">${student.dept || 'Computer Science'}</div>
      </div>
      <div class="cert-detail-item">
        <div class="cert-detail-label">CGPA</div>
        <div class="cert-detail-value">${student.cgpa || '8.7'} / 10.0</div>
      </div>
    </div>
    <div class="cert-date">Date of Issue: ${now}</div>
    <div class="cert-footer">
      <div class="cert-sig">
        <div class="cert-sig-line"></div>
        <div class="cert-sig-name">Prof. A. Kumar</div>
        <div class="cert-sig-role">Head of Department</div>
      </div>
      <div class="cert-sig">
        <div class="cert-sig-line"></div>
        <div class="cert-sig-name">Dr. S. Mehta</div>
        <div class="cert-sig-role">Principal</div>
      </div>
      <div class="cert-qr">
        <div class="cert-qr-code">▦</div>
        <div>Scan to verify</div>
        <div>${qr}</div>
      </div>
    </div>
  </div>
</body>
</html>`
}

export default function CertificateGenerator({ student }) {
    const [generating, setGenerating] = useState(null)

    function handleGenerate(type) {
        setGenerating(type)
        setTimeout(() => {
            const html = generateCertificateHTML(student, type)
            const blob = new Blob([html], { type: 'text/html' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${type}_certificate_${student.roll}.html`
            a.click()
            URL.revokeObjectURL(url)
            setGenerating(null)
        }, 1200)
    }

    const certs = [
        { type: 'degree', label: '🎓 Degree Certificate', desc: 'Official B.Tech degree certificate with QR' },
        { type: 'provisional', label: '📄 Provisional Certificate', desc: 'Provisional certificate for immediate use' },
        { type: 'transcript', label: '📊 Academic Transcript', desc: 'Full academic record with grades' },
    ]

    return (
        <div className="card">
            <div className="card-label">📜 Certificate Generation — {student?.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {certs.map(c => (
                    <div key={c.type} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.9rem 1rem',
                        background: 'var(--bg2)', borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)'
                    }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{c.label}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '2px' }}>{c.desc}</div>
                        </div>
                        <button
                            className="btn btn-solid btn-sm"
                            onClick={() => handleGenerate(c.type)}
                            disabled={generating === c.type}
                            style={{ minWidth: '90px' }}
                        >
                            {generating === c.type ? '⏳ Generating…' : '↓ Generate'}
                        </button>
                    </div>
                ))}
            </div>
            <div style={{
                marginTop: '1rem', padding: '0.75rem 1rem',
                background: 'var(--green-xlt)', borderRadius: 'var(--radius)',
                border: '1px solid var(--border2)', fontSize: '0.75rem', color: 'var(--text2)'
            }}>
                ✅ All clearances verified — student is eligible for graduation
            </div>
        </div>
    )
}
