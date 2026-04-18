import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentUploadDocument, getStudentStatus, onStoreUpdate } from '../../utils/clearanceStore'

const STUDENT = {
  name: 'Hritani Sharma',
  roll: 'CS2025041',
  dept: 'Computer Science',
  email: 'hritani.sharma@college.edu',
  phone: '+91 98765 43210',
  batch: '2025',
  dob: '12 March 2003',
  gender: 'Female',
  cgpa: '8.7',
  semester: '8',
  hostel: 'Block C, Room 204',
  advisor: 'Dr. Priya Nair',
  clearanceId: 'NX-2025-041',
  photo: 'HS',
  college: 'Nexus Institute of Technology',
  principal: 'Dr. R. K. Sharma',
}

// CORRECT SEQUENCE as requested
const INITIAL_PIPELINE = [
  { id: 1, dept: 'Library', icon: '📚', status: 'approved', comment: 'All books returned. No dues.' },
  { id: 2, dept: 'Lab', icon: '🔬', status: 'approved', comment: 'Lab manuals submitted.' },
  { id: 3, dept: 'Accounts', icon: '💰', status: 'pending', comment: '' },
  { id: 4, dept: 'Hostel', icon: '🏠', status: 'pending', comment: '' },
  { id: 5, dept: 'HOD', icon: '👨‍🏫', status: 'pending', comment: '' },
  { id: 6, dept: 'Principal', icon: '🏛️', status: 'pending', comment: '' },
]

const INITIAL_DOCS = [
  { id: 1, name: 'College ID Card', icon: '🪪', status: 'verified', size: '1.2 MB', type: 'JPG', date: '15 Apr', targetDept: 'Library' },
  { id: 2, name: 'Library Receipt', icon: '📚', status: 'verified', size: '0.8 MB', type: 'PDF', date: '15 Apr', targetDept: 'Library' },
  { id: 3, name: 'Lab Manual Return', icon: '🔬', status: 'pending', size: '2.1 MB', type: 'PDF', date: '16 Apr', targetDept: 'Lab' },
  { id: 4, name: 'Fee Clearance', icon: '💳', status: 'missing', size: '', type: '', date: '', targetDept: 'Accounts' },
  { id: 5, name: 'Hostel No-Dues', icon: '🏠', status: 'missing', size: '', type: '', date: '', targetDept: 'Hostel' },
  { id: 6, name: 'Sports No-Dues', icon: '⚽', status: 'missing', size: '', type: '', date: '', targetDept: 'HOD' },
]

const INITIAL_NOTIFS = [
  { id: 1, msg: 'Library clearance approved by Dr. Patil.', time: '2h ago', read: false, type: 'success' },
  { id: 2, msg: 'Lab In-charge approved your submission.', time: '5h ago', read: false, type: 'success' },
  { id: 3, msg: 'Document "Lab Manual Return" is under review.', time: '1d ago', read: true, type: 'info' },
  { id: 4, msg: 'Application NX-2025-041 submitted.', time: '2d ago', read: true, type: 'info' },
]

const DUES = [
  { id: 1, dept: 'Accounts', item: 'Tuition Fee (Sem 8)', amount: 4500, paid: false },
  { id: 2, dept: 'Library', item: 'Late Return Fine', amount: 150, paid: true },
  { id: 3, dept: 'Hostel', item: 'Hostel Dues', amount: 650, paid: false },
]

const CERTIFICATES = [
  { id: 1, name: 'No Dues Certificate', dept: 'All Departments', status: 'pending', desc: 'Issued after all departments approve.', type: 'nodues' },
  { id: 2, name: 'Bonafide Certificate', dept: 'Academic Office', status: 'ready', desc: 'Confirms enrollment status.', type: 'bonafide' },
  { id: 3, name: 'Migration Certificate', dept: 'Principal Office', status: 'pending', desc: 'Required for university transfer.', type: 'migration' },
  { id: 4, name: 'Character Certificate', dept: 'HOD', status: 'pending', desc: 'Issued after HOD approval.', type: 'character' },
  { id: 5, name: 'Course Completion', dept: 'Academic Office', status: 'ready', desc: 'Confirms completion of B.Tech program.', type: 'completion' },
  { id: 6, name: 'Provisional Degree', dept: 'Principal Office', status: 'pending', desc: 'Issued after full clearance.', type: 'degree' },
]

// Personal documents for Digital Locker
const LOCKER_DOCS = [
  { id: 'ld1', name: 'Aadhaar Card', icon: '🪪', category: 'Identity', file: null, preview: null },
  { id: 'ld2', name: '10th Marksheet', icon: '📄', category: 'Academic', file: null, preview: null },
  { id: 'ld3', name: '12th Marksheet', icon: '📄', category: 'Academic', file: null, preview: null },
  { id: 'ld4', name: 'Sem 1-8 Marksheets', icon: '📊', category: 'Academic', file: null, preview: null },
  { id: 'ld5', name: 'Passport Size Photo', icon: '🖼️', category: 'Identity', file: null, preview: null },
  { id: 'ld6', name: 'Caste Certificate', icon: '📋', category: 'Identity', file: null, preview: null },
  { id: 'ld7', name: 'Income Certificate', icon: '📋', category: 'Identity', file: null, preview: null },
  { id: 'ld8', name: 'Bank Passbook', icon: '🏦', category: 'Finance', file: null, preview: null },
]

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'application', label: 'Application', icon: '◈' },
  { id: 'documents', label: 'Documents', icon: '◧' },
  { id: 'heatmap', label: 'Heatmap', icon: '◉' },
  { id: 'dues', label: 'Dues & Payment', icon: '◎' },
  { id: 'notifications', label: 'Notifications', icon: '◐' },
  { id: 'certificates', label: 'Certificates', icon: '◑' },
  { id: 'locker', label: 'Digital Locker', icon: '◫' },
]

// ── Certificate PDF generator ──────────────────────────────────────────────
function generateCertificatePDF(cert, student) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  const certNo = `${student.college.substring(0, 3).toUpperCase()}-${cert.type.toUpperCase()}-${student.roll}-${now.getFullYear()}`

  const templates = {
    bonafide: `
      <p style="margin:0 0 18px">This is to certify that <strong>${student.name}</strong>, 
      son/daughter of ____________, bearing Roll No. <strong>${student.roll}</strong>, 
      is a <em>bonafide</em> student of <strong>${student.dept}</strong> in the 
      <strong>${student.batch}</strong> batch at <strong>${student.college}</strong>.</p>
      <p style="margin:0 0 18px">She/He is currently enrolled in Semester ${student.semester} 
      of the B.Tech programme and has maintained a CGPA of <strong>${student.cgpa}</strong>.</p>
      <p style="margin:0">This certificate is issued for the purpose of ____________ 
      and is valid for a period of six months from the date of issue.</p>`,
    completion: `
      <p style="margin:0 0 18px">This is to certify that <strong>${student.name}</strong>, 
      bearing Roll No. <strong>${student.roll}</strong>, has successfully completed 
      all the requirements for the degree of <strong>Bachelor of Technology</strong> in 
      <strong>${student.dept}</strong> from <strong>${student.college}</strong>.</p>
      <p style="margin:0 0 18px">She/He has completed the programme with a CGPA of 
      <strong>${student.cgpa}</strong> during the academic year <strong>2021–${student.batch}</strong>.</p>
      <p style="margin:0">This certificate is issued in good faith and is subject to 
      ratification by the University.</p>`,
    nodues: `
      <p style="margin:0 0 18px">This is to certify that <strong>${student.name}</strong>, 
      Roll No. <strong>${student.roll}</strong>, Department of <strong>${student.dept}</strong>, 
      Batch <strong>${student.batch}</strong>, has cleared all dues from all departments 
      of <strong>${student.college}</strong>.</p>
      <p style="margin:0">All library books have been returned, laboratory dues cleared, 
      hostel dues settled, and all financial obligations have been fulfilled. 
      There are no outstanding dues against this student.</p>`,
    character: `
      <p style="margin:0 0 18px">This is to certify that <strong>${student.name}</strong>, 
      Roll No. <strong>${student.roll}</strong>, was a student of this institution during 
      the period <strong>2021–${student.batch}</strong>.</p>
      <p style="margin:0 0 18px">During her/his tenure at <strong>${student.college}</strong>, 
      she/he has displayed exemplary conduct and maintained good moral character.</p>
      <p style="margin:0">To the best of our knowledge, no disciplinary action has been 
      taken against her/him. This certificate is issued on the basis of records available.</p>`,
    migration: `
      <p style="margin:0 0 18px">This is to certify that <strong>${student.name}</strong>, 
      bearing Roll No. <strong>${student.roll}</strong>, was enrolled in the B.Tech programme 
      in <strong>${student.dept}</strong> at <strong>${student.college}</strong> from 
      <strong>2021 to ${student.batch}</strong>.</p>
      <p style="margin:0 0 18px">She/He has successfully completed the programme and 
      is eligible for migration to pursue higher studies.</p>
      <p style="margin:0">This Migration Certificate is issued at the request of the 
      student for the purpose of admission to higher educational institutions.</p>`,
    degree: `
      <p style="margin:0 0 18px">This is to provisionally certify that 
      <strong>${student.name}</strong>, Roll No. <strong>${student.roll}</strong>, 
      has fulfilled all the academic requirements for the award of the degree of 
      <strong>Bachelor of Technology</strong> in <strong>${student.dept}</strong>.</p>
      <p style="margin:0 0 18px">This Provisional Degree Certificate is issued pending 
      the formal convocation of <strong>${student.college}</strong>.</p>
      <p style="margin:0">The official degree will be awarded at the convocation ceremony. 
      This certificate is valid until the original degree is awarded.</p>`,
  }

  const body = templates[cert.type] || templates.bonafide

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>${cert.name} - ${student.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'EB Garamond',Georgia,serif; background:#fff; }
  .page { width:794px; min-height:1123px; margin:0 auto; padding:60px 70px; position:relative; border:1px solid #e0d9cc; }
  .outer-border { position:absolute; inset:20px; border:3px double #1a7a4a; pointer-events:none; }
  .inner-border { position:absolute; inset:26px; border:1px solid #c0dfc8; pointer-events:none; }
  .header { text-align:center; margin-bottom:36px; }
  .college-name { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:#1a7a4a; letter-spacing:1px; margin-bottom:4px; }
  .college-addr { font-size:12px; color:#7aaa8a; margin-bottom:16px; }
  .divider { height:2px; background:linear-gradient(90deg,transparent,#1a7a4a,transparent); margin:12px 0; }
  .cert-title { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:#0f2718; margin:20px 0 4px; letter-spacing:2px; }
  .cert-subtitle { font-size:13px; color:#7aaa8a; letter-spacing:4px; text-transform:uppercase; }
  .cert-no { font-size:11px; color:#7aaa8a; margin-top:6px; font-family:monospace; }
  .seal-row { display:flex; align-items:center; justify-content:center; gap:16px; margin:20px 0; }
  .seal { width:70px; height:70px; border-radius:50%; border:3px solid #1a7a4a; display:flex; align-items:center; justify-content:center; flex-direction:column; }
  .seal-text { font-size:8px; color:#1a7a4a; font-weight:700; letter-spacing:1px; text-align:center; line-height:1.4; }
  .body { font-size:15px; color:#1a1a1a; line-height:1.9; text-align:justify; margin:28px 0; }
  .student-box { background:#f7fdf9; border:1px solid #d4ead9; border-radius:10px; padding:18px 24px; margin:24px 0; display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .student-field label { font-size:10px; color:#7aaa8a; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:2px; }
  .student-field span { font-size:13px; font-weight:600; color:#0f2718; }
  .footer { margin-top:48px; display:flex; justify-content:space-between; align-items:flex-end; }
  .sign-block { text-align:center; }
  .sign-line { width:160px; height:1px; background:#0f2718; margin:40px auto 6px; }
  .sign-name { font-size:13px; font-weight:600; }
  .sign-title { font-size:11px; color:#7aaa8a; }
  .date-block { text-align:left; }
  .date-label { font-size:11px; color:#7aaa8a; text-transform:uppercase; letter-spacing:1px; }
  .date-val { font-size:14px; font-weight:600; color:#0f2718; }
  .watermark { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-family:'Playfair Display',serif; font-size:80px; color:rgba(26,122,74,0.04); font-weight:700; pointer-events:none; white-space:nowrap; }
  .qr-box { text-align:center; margin-top:24px; padding-top:16px; border-top:1px solid #d4ead9; }
  .qr-text { font-size:10px; color:#7aaa8a; font-family:monospace; margin-top:4px; }
  @media print { body{-webkit-print-color-adjust:exact; print-color-adjust:exact;} }
</style>
</head>
<body>
<div class="page">
  <div class="outer-border"></div>
  <div class="inner-border"></div>
  <div class="watermark">NEXUS</div>
  <div class="header">
    <div class="college-name">${student.college.toUpperCase()}</div>
    <div class="college-addr">Affiliated to State Technical University · NAAC Accredited 'A' Grade</div>
    <div class="divider"></div>
    <div class="cert-title">${cert.name.toUpperCase()}</div>
    <div class="cert-subtitle">Official Document</div>
    <div class="cert-no">Certificate No: ${certNo}</div>
  </div>
  <div class="seal-row">
    <div class="seal"><div class="seal-text">NEXUS<br>INSTITUTE</div></div>
  </div>
  <div class="student-box">
    <div class="student-field"><label>Student Name</label><span>${student.name}</span></div>
    <div class="student-field"><label>Roll Number</label><span>${student.roll}</span></div>
    <div class="student-field"><label>Department</label><span>${student.dept}</span></div>
    <div class="student-field"><label>Batch</label><span>${student.batch}</span></div>
    <div class="student-field"><label>Semester</label><span>${student.semester}</span></div>
    <div class="student-field"><label>CGPA</label><span>${student.cgpa}</span></div>
  </div>
  <div class="body">${body}</div>
  <div class="footer">
    <div class="date-block">
      <div class="date-label">Date of Issue</div>
      <div class="date-val">${dateStr}</div>
      <div class="date-label" style="margin-top:8px">Place</div>
      <div class="date-val">College Campus</div>
    </div>
    <div class="sign-block">
      <div class="sign-line"></div>
      <div class="sign-name">${student.principal}</div>
      <div class="sign-title">Principal</div>
      <div class="sign-title">${student.college}</div>
    </div>
    <div class="sign-block">
      <div class="sign-line"></div>
      <div class="sign-name">HOD, ${student.dept}</div>
      <div class="sign-title">Head of Department</div>
      <div class="sign-title">Academic Year ${student.batch}</div>
    </div>
  </div>
  <div class="qr-box">
    <div class="qr-text">Verify at: nexus.verify/${certNo} · This certificate is digitally verified</div>
  </div>
</div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${cert.name.replace(/ /g, '_')}_${student.roll}.html`
  a.click()
  URL.revokeObjectURL(url)
}

// ── AI Receipt generator ───────────────────────────────────────────────────
function generateAIReceipt(due, student, paymentId) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  const receiptNo = `RCP-${Date.now().toString().slice(-8)}`

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Payment Receipt - ${receiptNo}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Plus Jakarta Sans',sans-serif;background:#f7fdf9;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:40px 20px;}
  .receipt{background:#fff;width:420px;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(26,122,74,0.15);}
  .top{background:linear-gradient(135deg,#1a7a4a,#0f4a2a);padding:32px;color:#fff;text-align:center;}
  .check{width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px;}
  .paid{font-size:13px;letter-spacing:3px;opacity:0.7;margin-bottom:8px;font-family:'DM Mono',monospace;}
  .amount{font-size:48px;font-weight:700;margin-bottom:4px;}
  .item-name{opacity:0.8;font-size:14px;}
  .body{padding:28px;}
  .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0f7f3;font-size:13px;}
  .row:last-child{border-bottom:none;}
  .row label{color:#7aaa8a;}
  .row span{font-weight:600;color:#0f2718;font-family:'DM Mono',monospace;font-size:12px;}
  .footer{background:#f7fdf9;padding:20px 28px;text-align:center;border-top:1px solid #d4ead9;}
  .footer p{font-size:11px;color:#7aaa8a;line-height:1.6;}
  .nexus{font-family:'DM Mono',monospace;font-size:12px;color:#1a7a4a;font-weight:600;margin-bottom:8px;}
  .ai-badge{display:inline-flex;align-items:center;gap:6px;background:#eaf7f0;border:1px solid #d4ead9;border-radius:100px;padding:4px 12px;font-size:10px;color:#1a7a4a;font-weight:600;margin-top:10px;}
  @media print{body{background:#fff;padding:0;}receipt{box-shadow:none;}}
</style>
</head>
<body>
<div class="receipt">
  <div class="top">
    <div class="check">✓</div>
    <div class="paid">PAYMENT SUCCESSFUL</div>
    <div class="amount">₹${due.amount}</div>
    <div class="item-name">${due.item}</div>
  </div>
  <div class="body">
    <div class="row"><label>Receipt No.</label><span>${receiptNo}</span></div>
    <div class="row"><label>Payment ID</label><span>${paymentId || 'pay_' + Date.now().toString(36).toUpperCase()}</span></div>
    <div class="row"><label>Student Name</label><span>${student.name}</span></div>
    <div class="row"><label>Roll Number</label><span>${student.roll}</span></div>
    <div class="row"><label>Department</label><span>${student.dept}</span></div>
    <div class="row"><label>Paid To</label><span>${due.dept}</span></div>
    <div class="row"><label>Purpose</label><span>${due.item}</span></div>
    <div class="row"><label>Amount</label><span>₹${due.amount}.00</span></div>
    <div class="row"><label>Date</label><span>${dateStr}</span></div>
    <div class="row"><label>Time</label><span>${timeStr}</span></div>
    <div class="row"><label>Status</label><span style="color:#1a7a4a">PAID ✓</span></div>
  </div>
  <div class="footer">
    <div class="nexus">NEXUS GRADUATION PORTAL</div>
    <p>${student.college}</p>
    <p>This is a computer-generated receipt and does not require a signature.</p>
    <div class="ai-badge">✦ AI-Generated Receipt · Digitally Verified</div>
  </div>
</div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Receipt_${receiptNo}.html`
  a.click()
  URL.revokeObjectURL(url)
}

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')
  const [pipeline, setPipeline] = useState(INITIAL_PIPELINE)
  const [docs, setDocs] = useState(INITIAL_DOCS)
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS)
  const [dues, setDues] = useState(DUES)
  const [certs, setCerts] = useState(CERTIFICATES)
  const [lockerDocs, setLockerDocs] = useState(LOCKER_DOCS)
  const [uploadModal, setUploadModal] = useState(false)
  const [uploadTarget, setUploadTarget] = useState(null)
  const [payModal, setPayModal] = useState(null)
  const [payStep, setPayStep] = useState('form')
  const [lastPaymentId, setLastPaymentId] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [lockerUploadTarget, setLockerUploadTarget] = useState(null)
  const fileInputRef = useRef(null)
  const lockerFileRef = useRef(null)

  const unread = notifs.filter(n => !n.read).length
  const clearedCount = pipeline.filter(p => p.status === 'approved').length
  const totalDues = dues.filter(d => !d.paid).reduce((s, d) => s + d.amount, 0)
  const allCleared = pipeline.every(p => p.status === 'approved')
  const uploadedDocs = docs.filter(d => d.size)
  const pendingDues = dues.filter(d => !d.paid).length

  useEffect(() => {
    function syncFromStore() {
      const status = getStudentStatus(STUDENT.roll)
      if (!status) return
      setPipeline(prev => prev.map(p => {
        const storeStatus = status.clearanceStatus[p.dept]
        if (storeStatus && storeStatus !== p.status) {
          return { ...p, status: storeStatus, comment: status.adminComments[p.dept] || p.comment }
        }
        return p
      }))
    }
    syncFromStore()
    return onStoreUpdate(syncFromStore)
  }, [])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { showToast('File too large! Max 5MB.', 'error'); return }
    setSelectedFile(file)
  }

  function handleLockerFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { showToast('File too large! Max 10MB.', 'error'); return }
    const reader = new FileReader()
    reader.onload = () => {
      setLockerDocs(prev => prev.map(d => d.id === lockerUploadTarget
        ? { ...d, file: file.name, preview: reader.result, size: (file.size / 1024 / 1024).toFixed(1) + ' MB', date: 'Today' }
        : d))
      showToast(`${file.name} uploaded to Digital Locker!`)
      setLockerUploadTarget(null)
    }
    reader.readAsDataURL(file)
  }

  function confirmUpload() {
    if (!selectedFile && !uploadTarget) return
    setUploading(true)
    const targetDoc = docs.find(d => d.id === uploadTarget)
    const fileType = selectedFile ? selectedFile.name.split('.').pop().toUpperCase() : 'PDF'
    const fileSize = selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB' : (Math.random() * 3 + 0.5).toFixed(1) + ' MB'
    const targetDept = targetDoc?.targetDept || 'Library'

    const processUpload = (dataUrl) => {
      studentUploadDocument({
        studentId: STUDENT.roll, studentName: STUDENT.name, initials: STUDENT.photo,
        avatarClass: 'blue-bg', dept: STUDENT.dept, batch: STUDENT.batch,
        docName: targetDoc?.name || selectedFile?.name || 'Document',
        docType: fileType, docSize: fileSize, targetDept, fileDataUrl: dataUrl,
      })
      setDocs(prev => prev.map(d => d.id === uploadTarget
        ? { ...d, status: 'pending', size: fileSize, type: fileType, date: 'Today', fileName: selectedFile?.name }
        : d))
      setUploadModal(false); setUploadTarget(null); setSelectedFile(null); setUploading(false)
      showToast(`✓ "${targetDoc?.name}" uploaded to ${targetDept}!`)
      setNotifs(prev => [{ id: Date.now(), msg: `Document "${targetDoc?.name}" sent to ${targetDept} for review.`, time: 'Just now', read: false, type: 'info' }, ...prev])
    }

    if (selectedFile) {
      const reader = new FileReader()
      reader.onload = () => processUpload(reader.result)
      reader.readAsDataURL(selectedFile)
    } else {
      setTimeout(() => processUpload(null), 500)
    }
  }

  function openPayModal(due) {
    setPayModal(due); setPayStep('form'); setLastPaymentId(null)
  }

  function loadRazorpayScript() {
    return new Promise(resolve => {
      if (window.Razorpay) { resolve(true); return }
      const s = document.createElement('script')
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.onload = () => resolve(true)
      s.onerror = () => resolve(false)
      document.body.appendChild(s)
    })
  }

  async function processPayment() {
    setPayStep('processing')
    const loaded = await loadRazorpayScript()
    if (!loaded) { showToast('Razorpay failed to load. Check connection.', 'error'); setPayStep('form'); return }

    try {
      const response = await fetch('http://localhost:8000/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: payModal.amount, receipt: `receipt_${payModal.id}` })
      })
      const order = await response.json()
      if (!response.ok) { showToast(order.detail || 'Failed to create order', 'error'); setPayStep('form'); return }

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Nexus Graduation Portal',
        description: `Payment for ${payModal.item}`,
        order_id: order.order_id,
        handler: async (response) => {
          try {
            setPayStep('processing')
            const verifyRes = await fetch('http://localhost:8000/api/payment/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            })
            const verifyData = await verifyRes.json()
            if (verifyRes.ok) {
              setLastPaymentId(response.razorpay_payment_id)
              setDues(prev => prev.map(d => d.id === payModal.id ? { ...d, paid: true, paymentId: response.razorpay_payment_id } : d))
              setPayStep('success')
              setNotifs(prev => [{ id: Date.now(), msg: `₹${payModal.amount} paid for "${payModal.item}". Receipt ready.`, time: 'Just now', read: false, type: 'success' }, ...prev])
            } else {
              showToast(verifyData.detail || 'Verification failed', 'error'); setPayStep('form')
            }
          } catch { showToast('Error verifying payment', 'error'); setPayStep('form') }
        },
        prefill: { name: STUDENT.name, email: STUDENT.email, contact: STUDENT.phone.replace(/\D/g, '') },
        theme: { color: '#1a7a4a' }
      }
      const rz = new window.Razorpay(options)
      rz.on('payment.failed', r => { showToast(r.error.description || 'Payment failed', 'error'); setPayStep('form') })
      rz.open()
    } catch { showToast('Error initiating payment', 'error'); setPayStep('form') }
  }

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    showToast('All notifications marked as read')
  }

  const G = '#1a7a4a'; const GM = '#22a05e'; const GL = '#d6f0e2'; const GX = '#eaf7f0'
  const T = '#0f2718'; const T2 = '#3d6b4f'; const T3 = '#7aaa8a'
  const B = '#d4ead9'; const B2 = '#c0dfc8'
  const AM = '#c97a10'; const AL = '#fef3e2'
  const R = '#c0392b'; const RL = '#fdecea'
  const BG = '#f0f7f3'; const S = '#fff'

  const card = { background: S, border: `1px solid ${B}`, borderRadius: 18, padding: '1.5rem' }
  const btn = (bg, color, extra = {}) => ({ background: bg, color, border: 'none', borderRadius: 9, padding: '0.6rem 1.25rem', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', ...extra })
  const btnSm = { background: GX, color: G, border: `1px solid ${B2}`, borderRadius: 7, padding: '0.3rem 0.8rem', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
  const badge = (type) => {
    const m = { approved: [GL, G], pending: [AL, AM], flagged: [RL, R], verified: [GL, G], missing: ['#f1f5f9', '#64748b'], ready: [GL, G], info: ['#e0f2fe', '#0369a1'] }
    const [bg, c] = m[type] || [GX, T2]
    return { background: bg, color: c, borderRadius: 100, padding: '0.2rem 0.7rem', fontSize: '0.7rem', fontWeight: 700, display: 'inline-block', letterSpacing: '0.02em' }
  }
  const input = { width: '100%', padding: '0.7rem 1rem', borderRadius: 9, border: `1.5px solid ${B}`, fontFamily: 'inherit', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', color: T, background: S }

  function PipelineBar({ mini = false }) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', padding: mini ? '0.25rem 0' : '0.5rem 0' }}>
        {pipeline.map((s, i) => {
          const isActive = s.status === 'pending' && pipeline.slice(0, i).every(x => x.status === 'approved')
          const cls = isActive ? 'active' : s.status
          const size = mini ? 22 : 30
          return (
            <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, position: 'relative' }}>
              {i < pipeline.length - 1 && <div style={{ position: 'absolute', top: size / 2 - 1, left: '50%', width: '100%', height: 2, background: s.status === 'approved' ? GM : '#d4ead9', zIndex: 0 }} />}
              <div style={{ width: size, height: size, borderRadius: '50%', background: cls === 'approved' ? GM : cls === 'active' ? S : '#edf7f1', border: cls === 'active' ? `2px solid ${GM}` : cls === 'approved' ? `2px solid ${GM}` : `2px solid ${B}`, color: cls === 'approved' ? S : cls === 'active' ? G : T3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: mini ? '0.55rem' : '0.7rem', fontWeight: 700, zIndex: 1, position: 'relative', boxShadow: cls === 'active' ? `0 0 0 5px ${GL}` : 'none' }}>
                {cls === 'approved' ? '✓' : s.id}
              </div>
              {!mini && <>
                <div style={{ fontSize: '0.62rem', color: cls === 'pending' && !isActive ? T3 : T2, fontWeight: isActive || cls === 'approved' ? 600 : 400, textAlign: 'center' }}>{s.dept}</div>
                <div style={{ fontSize: '0.58rem', color: cls === 'approved' ? GM : isActive ? AM : T3 }}>{cls === 'approved' ? 'Cleared' : isActive ? 'In Review' : 'Awaiting'}</div>
              </>}
            </div>
          )
        })}
      </div>
    )
  }

  function TabDashboard() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 260px', gap: '1rem' }}>
          {[
            ['Departments Cleared', `${clearedCount}/${pipeline.length}`, clearedCount > 0 ? G : AM, `${pipeline.length - clearedCount} remaining`],
            ['Docs Uploaded', uploadedDocs.length, G, `of ${docs.length} required`],
            ['Dues Pending', totalDues > 0 ? `₹${totalDues}` : 'Nil', totalDues > 0 ? R : G, totalDues > 0 ? `${pendingDues} items` : 'All clear'],
            ['Unread Alerts', unread, unread > 0 ? AM : G, unread > 0 ? 'Tap to view' : 'All read'],
          ].map(([lbl, val, color, sub]) => (
            <div key={lbl} style={{ ...card, padding: '1.25rem 1.5rem' }}>
              <div style={{ fontSize: '0.72rem', color: T3, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{lbl}</div>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '2rem', color, lineHeight: 1, marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: '0.72rem', color: T3 }}>{sub}</div>
            </div>
          ))}
          <div style={{ background: `linear-gradient(135deg,${G} 0%,#0f4a2a 100%)`, borderRadius: 18, padding: '1.25rem', color: S, position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.2em', opacity: 0.6, marginBottom: 10 }}>COLLEGE ID</div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: GL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: G, marginBottom: 8 }}>{STUDENT.photo}</div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 2 }}>{STUDENT.name}</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.7, marginBottom: 6 }}>{STUDENT.dept}</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.7rem', opacity: 0.8 }}>{STUDENT.roll}</div>
          </div>
        </div>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Clearance Pipeline</div>
            <span style={badge(allCleared ? 'approved' : 'pending')}>{allCleared ? 'Fully Cleared' : 'In Progress'}</span>
          </div>
          <PipelineBar />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Recent Documents</div>
              <button style={btnSm} onClick={() => setTab('documents')}>View All</button>
            </div>
            {docs.slice(0, 4).map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.6rem 0', borderBottom: `1px solid ${BG}` }}>
                <span style={{ fontSize: 16 }}>{d.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{d.name}</div>
                  <div style={{ fontSize: '0.68rem', color: T3 }}>{d.size ? `${d.type} · ${d.size}` : 'Not uploaded'}</div>
                </div>
                <span style={badge(d.size ? d.status : 'missing')}>{d.size ? d.status : 'missing'}</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Pending Actions</div>
            {totalDues > 0 && (
              <div style={{ background: RL, borderRadius: 10, padding: '0.85rem 1rem', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: R }}>Dues Pending</div>
                  <div style={{ fontSize: '0.72rem', color: '#8b3a35' }}>₹{totalDues} outstanding</div>
                </div>
                <button style={btn(R, S, { fontSize: '0.78rem', padding: '0.35rem 0.85rem' })} onClick={() => setTab('dues')}>Pay Now</button>
              </div>
            )}
            {docs.filter(d => !d.size).slice(0, 2).map(d => (
              <div key={d.id} style={{ background: AL, borderRadius: 10, padding: '0.85rem 1rem', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: AM }}>{d.name} Missing</div>
                  <div style={{ fontSize: '0.72rem', color: '#8b5e10' }}>Upload required</div>
                </div>
                <button style={btn(AM, S, { fontSize: '0.78rem', padding: '0.35rem 0.85rem' })} onClick={() => { setUploadTarget(d.id); setUploadModal(true) }}>Upload</button>
              </div>
            ))}
            {totalDues === 0 && docs.filter(d => !d.size).length === 0 && (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: G, fontWeight: 600 }}>🎉 No pending actions!</div>
            )}
          </div>
        </div>
      </div>
    )
  }

  function TabApplication() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Application Details</div>
            <span style={badge(allCleared ? 'approved' : 'pending')}>{allCleared ? 'Cleared' : 'In Progress'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[['Student', STUDENT.name], ['Roll No.', STUDENT.roll], ['Department', STUDENT.dept], ['Batch', STUDENT.batch], ['Clearance ID', STUDENT.clearanceId], ['Submitted', '15 Apr 2025']].map(([k, v]) => (
              <div key={k} style={{ background: BG, borderRadius: 10, padding: '0.85rem 1rem' }}>
                <div style={{ fontSize: '0.68rem', color: T3, marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: k === 'Clearance ID' ? G : T, fontFamily: k === 'Clearance ID' ? "'DM Mono',monospace" : 'inherit' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${B}`, paddingTop: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: T2, marginBottom: '1rem' }}>Approval Pipeline (in sequence)</div>
            <PipelineBar />
          </div>
          {pipeline.filter(p => p.comment).length > 0 && (
            <div style={{ marginTop: '1.25rem', borderTop: `1px solid ${B}`, paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: T2, marginBottom: '0.75rem' }}>Reviewer Comments</div>
              {pipeline.filter(p => p.comment).map(p => (
                <div key={p.id} style={{ background: GX, borderRadius: 8, padding: '0.75rem 1rem', marginBottom: 6, fontSize: '0.83rem', borderLeft: `3px solid ${GM}` }}>
                  <strong style={{ color: G }}>{p.dept}:</strong> <span style={{ color: T2 }}>{p.comment}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  function TabDocuments() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Document Vault</div>
              <div style={{ fontSize: '0.75rem', color: T3, marginTop: 2 }}>{uploadedDocs.length} of {docs.length} uploaded</div>
            </div>
            <button style={btn(G, S)} onClick={() => setUploadModal(true)}>+ Upload Document</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            {docs.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1rem', borderRadius: 12, border: `1px solid ${d.size ? B2 : B}`, background: d.size ? GX : S }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: d.size ? GL : BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{d.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 2 }}>{d.name}</div>
                  <div style={{ fontSize: '0.68rem', color: T3, marginBottom: 5 }}>{d.size ? `${d.type} · ${d.size} · ${d.date}` : 'Not uploaded yet'}</div>
                  <span style={badge(d.size ? d.status : 'missing')}>{d.size ? d.status : 'missing'}</span>
                </div>
                {d.size
                  ? <div style={{ width: 24, height: 24, borderRadius: '50%', background: GL, display: 'flex', alignItems: 'center', justifyContent: 'center', color: G, fontSize: '0.8rem' }}>✓</div>
                  : <button style={btnSm} onClick={() => { setUploadTarget(d.id); setUploadModal(true) }}>Upload</button>
                }
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  function TabHeatmap() {
    const hmData = pipeline.map((s, i) => {
      const isActive = s.status === 'pending' && pipeline.slice(0, i).every(x => x.status === 'approved')
      return { ...s, disp: isActive ? 'inreview' : s.status === 'pending' ? 'waiting' : s.status }
    })
    const statusConfig = {
      approved: { bg: GL, border: B2, dot: GM, label: 'Cleared', text: G },
      inreview: { bg: AL, border: '#f5d99a', dot: AM, label: 'In Review', text: AM },
      waiting: { bg: '#f8fafc', border: '#e2e8f0', dot: '#94a3b8', label: 'Awaiting', text: '#64748b' },
      flagged: { bg: RL, border: '#f5c6c2', dot: R, label: 'Flagged', text: R },
    }
    const cleared = pipeline.filter(p => p.status === 'approved').length
    const pct = Math.round((cleared / pipeline.length) * 100)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ ...card, background: `linear-gradient(135deg,${G} 0%,#0f4a2a 100%)`, color: S }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.65rem', letterSpacing: '0.18em', opacity: 0.6, marginBottom: 6 }}>CLEARANCE PROGRESS</div>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '3rem', lineHeight: 1, marginBottom: 4 }}>{pct}%</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.75 }}>{cleared} of {pipeline.length} departments cleared</div>
            </div>
            <div style={{ position: 'relative', width: 100, height: 100 }}>
              <svg viewBox="0 0 100 100" style={{ width: 100, height: 100, transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700 }}>{cleared}/{pipeline.length}</div>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <PipelineBar mini />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
          {hmData.map(h => {
            const cfg = statusConfig[h.disp] || statusConfig.waiting
            return (
              <div key={h.id} style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: 16, padding: '1.25rem 1rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {h.disp === 'inreview' && <div style={{ position: 'absolute', inset: 0, borderRadius: 16, border: `2px solid ${AM}`, opacity: 0.4, animation: 'pulse 2s ease infinite' }} />}
                <div style={{ fontSize: 28, marginBottom: 8 }}>{h.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: T, marginBottom: 4 }}>{h.dept}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot }} />
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: cfg.text }}>{cfg.label}</div>
                </div>
                {h.comment && <div style={{ fontSize: '0.65rem', color: T3, fontStyle: 'italic', marginTop: 6 }}>"{h.comment}"</div>}
                {h.disp === 'approved' && <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: GM, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S, fontSize: '0.6rem' }}>✓</div>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  function TabDues() {
    const paidDues = dues.filter(d => d.paid)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Dues & Payments</div>
              <div style={{ fontSize: '0.75rem', color: T3, marginTop: 2 }}>Pay all dues to unblock clearance</div>
            </div>
            <span style={badge(totalDues > 0 ? 'flagged' : 'approved')}>{totalDues > 0 ? `₹${totalDues} pending` : 'All clear'}</span>
          </div>
          {dues.map(d => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderRadius: 12, border: `1px solid ${d.paid ? B2 : '#f5c6c2'}`, background: d.paid ? GX : RL, marginBottom: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: d.paid ? GL : '#fbd5d1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {d.paid ? '✅' : '⚠️'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{d.item}</div>
                <div style={{ fontSize: '0.72rem', color: T3, marginTop: 2 }}>{d.dept}</div>
              </div>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.5rem', color: d.paid ? G : R, marginRight: 8 }}>₹{d.amount}</div>
              {d.paid
                ? <div style={{ display: 'flex', gap: 6 }}>
                  <span style={badge('approved')}>Paid ✓</span>
                  <button style={btnSm} onClick={() => generateAIReceipt(d, STUDENT, d.paymentId)}>↓ Receipt</button>
                </div>
                : <button style={btn(R, S)} onClick={() => openPayModal(d)}>Pay Now</button>
              }
            </div>
          ))}
        </div>
        {paidDues.length > 0 && (
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>Payment History</div>
            {paidDues.map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: `1px solid ${BG}`, fontSize: '0.85rem', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{d.item}</div>
                  <div style={{ fontSize: '0.7rem', color: T3 }}>{d.dept} · AI Receipt available</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ color: G, fontWeight: 700 }}>₹{d.amount}</div>
                  <button style={btnSm} onClick={() => generateAIReceipt(d, STUDENT, d.paymentId)}>↓ Download Receipt</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  function TabNotifications() {
    return (
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>Notifications</div>
            <div style={{ fontSize: '0.75rem', color: T3, marginTop: 2 }}>{unread} unread</div>
          </div>
          <button style={btnSm} onClick={markAllRead}>Mark all read</button>
        </div>
        {notifs.map(n => (
          <div key={n.id} style={{ display: 'flex', gap: 12, padding: '0.9rem 0', borderBottom: `1px solid ${BG}` }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.read ? B : n.type === 'success' ? GM : AM, flexShrink: 0, marginTop: 6 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', color: T2, fontWeight: n.read ? 400 : 600 }}>{n.msg}</div>
              <div style={{ fontSize: '0.7rem', color: T3, marginTop: 3 }}>{n.time}</div>
            </div>
            {!n.read && <button style={btnSm} onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>Read</button>}
          </div>
        ))}
      </div>
    )
  }

  function TabCertificates() {
    const readyCerts = certs.filter(c => c.status === 'ready')
    const pendingCerts = certs.filter(c => c.status === 'pending')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          {[['Total Certificates', certs.length, T], ['Ready to Download', readyCerts.length, G], ['Pending Approval', pendingCerts.length, AM]].map(([lbl, val, color]) => (
            <div key={lbl} style={{ ...card, padding: '1.1rem 1.4rem', textAlign: 'center' }}>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '2.2rem', color, lineHeight: 1, marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: '0.75rem', color: T3, fontWeight: 600 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {readyCerts.length > 0 && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: G, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>✓ Ready for Download</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {readyCerts.map(c => (
                <div key={c.id} style={{ background: GX, border: `1.5px solid ${B2}`, borderRadius: 16, padding: '1.25rem', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: GL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🎓</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 3 }}>{c.name}</div>
                    <div style={{ fontSize: '0.72rem', color: T3, marginBottom: 8 }}>{c.dept} · {c.desc}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button style={btn(G, S, { fontSize: '0.78rem', padding: '0.4rem 1rem' })}
                        onClick={() => { generateCertificatePDF(c, STUDENT); showToast(`${c.name} downloaded!`) }}>
                        ↓ Download PDF
                      </button>
                    </div>
                    <div style={{ marginTop: 8, fontSize: '0.65rem', color: T3, fontFamily: "'DM Mono',monospace" }}>
                      ID: {STUDENT.roll}-{c.type.toUpperCase()}
                    </div>
                  </div>
                  <span style={badge('approved')}>Ready</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingCerts.length > 0 && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: AM, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>⏳ Pending Approval</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {pendingCerts.map(c => (
                <div key={c.id} style={{ background: S, border: `1px solid ${B}`, borderRadius: 16, padding: '1.25rem', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: AL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📋</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 3 }}>{c.name}</div>
                    <div style={{ fontSize: '0.72rem', color: T3, marginBottom: 8 }}>{c.dept} · {c.desc}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: AL, borderRadius: 7, padding: '0.4rem 0.75rem' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: AM }} />
                      <span style={{ fontSize: '0.72rem', color: AM, fontWeight: 600 }}>Awaiting department approval</span>
                    </div>
                  </div>
                  <span style={badge('pending')}>Pending</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  function TabLocker() {
    const categories = [...new Set(LOCKER_DOCS.map(d => d.category))]
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <input ref={lockerFileRef} type="file" accept="image/*,.pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleLockerFileSelect} />

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
          {[
            ['Total Slots', lockerDocs.length, T],
            ['Uploaded', lockerDocs.filter(d => d.file).length, G],
            ['Pending Upload', lockerDocs.filter(d => !d.file).length, AM],
          ].map(([lbl, val, color]) => (
            <div key={lbl} style={{ ...card, padding: '1.1rem 1.4rem', textAlign: 'center' }}>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '2rem', color, lineHeight: 1, marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: '0.75rem', color: T3, fontWeight: 600 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {categories.map(cat => (
          <div key={cat} style={card}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: G, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>{cat} Documents</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              {lockerDocs.filter(d => d.category === cat).map(d => (
                <div key={d.id} style={{ border: `1px solid ${d.file ? B2 : B}`, borderRadius: 14, overflow: 'hidden', background: d.file ? GX : S }}>
                  {/* Preview area */}
                  <div style={{ height: 120, background: d.file ? BG : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: d.file ? 'pointer' : 'default' }}
                    onClick={() => d.file && setPreviewDoc(d)}>
                    {d.preview && d.preview.startsWith('data:image') ? (
                      <img src={d.preview} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : d.file ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 36 }}>📄</div>
                        <div style={{ fontSize: '0.7rem', color: T2, fontWeight: 600, marginTop: 4 }}>{d.file}</div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', opacity: 0.4 }}>
                        <div style={{ fontSize: 32 }}>{d.icon}</div>
                        <div style={{ fontSize: '0.68rem', color: T3, marginTop: 4 }}>Not uploaded</div>
                      </div>
                    )}
                    {d.file && (
                      <div style={{ position: 'absolute', top: 6, right: 6, background: G, color: S, borderRadius: 100, fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px' }}>✓</div>
                    )}
                  </div>
                  {/* Doc info + actions */}
                  <div style={{ padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 3 }}>{d.name}</div>
                    {d.file && <div style={{ fontSize: '0.68rem', color: T3, marginBottom: 8 }}>{d.size} · {d.date}</div>}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ ...btnSm, flex: 1 }} onClick={() => { setLockerUploadTarget(d.id); lockerFileRef.current?.click() }}>
                        {d.file ? '↺ Replace' : '↑ Upload'}
                      </button>
                      {d.file && (
                        <button style={{ ...btnSm, flex: 1 }} onClick={() => setPreviewDoc(d)}>👁 Preview</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Clearance docs in locker */}
        {uploadedDocs.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: G, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Clearance Documents</div>
            {uploadedDocs.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 0', borderBottom: `1px solid ${BG}` }}>
                <span style={{ fontSize: 18 }}>{d.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{d.name}</div>
                  <div style={{ fontSize: '0.7rem', color: T3 }}>{d.type} · {d.size} · {d.date}</div>
                </div>
                <span style={badge(d.status)}>{d.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const tabContent = {
    dashboard: <TabDashboard />,
    application: <TabApplication />,
    documents: <TabDocuments />,
    heatmap: <TabHeatmap />,
    dues: <TabDues />,
    notifications: <TabNotifications />,
    certificates: <TabCertificates />,
    locker: <TabLocker />,
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: BG, minHeight: '100vh', color: T }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        * { box-sizing: border-box; }
      `}</style>

      {/* TOPBAR */}
      <div style={{ background: S, borderBottom: `1px solid ${B}`, padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 56, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '0.9rem', letterSpacing: '0.18em', color: G, textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => navigate('/')}>NEXUS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          {unread > 0 && <div style={{ background: AM, color: S, borderRadius: 100, fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', cursor: 'pointer' }} onClick={() => setTab('notifications')}>{unread} new</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '0.4rem 0.75rem', borderRadius: 10, border: `1px solid ${B}`, background: profileOpen ? GX : S }} onClick={() => setProfileOpen(!profileOpen)}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: GL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: G }}>{STUDENT.photo}</div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: T2 }}>{STUDENT.name}</span>
            <span style={{ fontSize: '0.7rem', color: T3 }}>{profileOpen ? '▲' : '▼'}</span>
          </div>
          <button style={{ background: 'none', border: `1px solid ${B}`, borderRadius: 8, padding: '0.4rem 0.85rem', fontSize: '0.8rem', color: T3, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => navigate('/login')}>Log out</button>
          {profileOpen && (
            <div style={{ position: 'absolute', top: 50, right: 0, background: S, border: `1px solid ${B}`, borderRadius: 16, width: 320, boxShadow: '0 8px 40px rgba(0,0,0,0.12)', zIndex: 200 }} onClick={e => e.stopPropagation()}>
              <div style={{ background: `linear-gradient(135deg,${G},#0f4a2a)`, borderRadius: '16px 16px 0 0', padding: '1.25rem', color: S, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: GL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: G }}>{STUDENT.photo}</div>
                <div><div style={{ fontWeight: 700, fontSize: '1rem' }}>{STUDENT.name}</div><div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{STUDENT.email}</div></div>
              </div>
              <div style={{ padding: '1rem 1.25rem' }}>
                {[['Roll No.', STUDENT.roll], ['DOB', STUDENT.dob], ['Gender', STUDENT.gender], ['Phone', STUDENT.phone], ['Hostel', STUDENT.hostel], ['Department', STUDENT.dept], ['Batch', STUDENT.batch], ['CGPA', STUDENT.cgpa]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${BG}`, fontSize: '0.82rem' }}>
                    <span style={{ color: T3 }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>
        {/* SIDEBAR */}
        <aside style={{ width: 210, background: S, borderRight: `1px solid ${B}`, padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ fontSize: '0.62rem', color: T3, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.4rem 0.75rem', marginBottom: 4 }}>Navigation</div>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setProfileOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0.65rem 0.85rem', borderRadius: 9, cursor: 'pointer', fontSize: '0.84rem', color: tab === t.id ? G : T2, background: tab === t.id ? GX : 'transparent', fontWeight: tab === t.id ? 700 : 400, border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.12s' }}>
              <span style={{ fontSize: 13, opacity: 0.8 }}>{t.icon}</span>
              {t.label}
              {t.id === 'notifications' && unread > 0 && <span style={{ marginLeft: 'auto', background: AM, color: S, borderRadius: 100, fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px' }}>{unread}</span>}
              {t.id === 'dues' && pendingDues > 0 && <span style={{ marginLeft: 'auto', background: R, color: S, borderRadius: 100, fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px' }}>{pendingDues}</span>}
              {t.id === 'certificates' && <span style={{ marginLeft: 'auto', background: G, color: S, borderRadius: 100, fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px' }}>{certs.filter(c => c.status === 'ready').length}</span>}
            </button>
          ))}
          <div style={{ marginTop: 'auto', background: BG, borderRadius: 11, padding: '0.85rem', display: 'flex', gap: 9, alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: GL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: G }}>{STUDENT.photo}</div>
            <div><div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{STUDENT.name.split(' ')[0]}</div><div style={{ fontSize: '0.68rem', color: T3 }}>{STUDENT.roll}</div></div>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', background: BG }} onClick={() => setProfileOpen(false)}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.7rem', marginBottom: 3 }}>{TABS.find(t => t.id === tab)?.label}</div>
              <div style={{ fontSize: '0.8rem', color: T3 }}>
                {tab === 'dashboard' && `Clearance ID: ${STUDENT.clearanceId} · ${clearedCount} of ${pipeline.length} cleared`}
                {tab === 'heatmap' && 'Live view of department clearance status'}
                {tab === 'certificates' && `${certs.filter(c => c.status === 'ready').length} ready · ${certs.filter(c => c.status === 'pending').length} pending`}
                {tab === 'documents' && `${uploadedDocs.length} of ${docs.length} uploaded`}
                {tab === 'dues' && (totalDues > 0 ? `₹${totalDues} pending` : 'All dues cleared')}
                {tab === 'notifications' && `${unread} unread`}
                {tab === 'locker' && `${lockerDocs.filter(d => d.file).length} of ${lockerDocs.length} personal docs uploaded`}
                {tab === 'application' && `Status: ${allCleared ? 'Fully Cleared' : 'In Progress'}`}
              </div>
            </div>
            {tabContent[tab]}
          </div>
        </main>
      </div>

      {/* UPLOAD MODAL */}
      {uploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={() => { setUploadModal(false); setSelectedFile(null) }}>
          <div style={{ background: S, borderRadius: 18, padding: '2rem', width: 440 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.4rem', marginBottom: '0.4rem' }}>Upload Document</div>
            <div style={{ fontSize: '0.83rem', color: T3, marginBottom: '1.25rem' }}>
              {uploadTarget ? `Uploading: ${docs.find(d => d.id === uploadTarget)?.name}` : 'Choose document type'}
              {uploadTarget && <span style={{ display: 'block', fontSize: '0.72rem', color: AM, marginTop: 4 }}>→ Sent to <strong>{docs.find(d => d.id === uploadTarget)?.targetDept}</strong> department</span>}
            </div>
            {!uploadTarget && (
              <select style={{ ...input, marginBottom: '1rem' }} onChange={e => { const doc = docs.find(d => d.name === e.target.value); if (doc) setUploadTarget(doc.id) }}>
                <option value="">Select document...</option>
                {docs.filter(d => !d.size).map(d => <option key={d.id} value={d.name}>{d.name} → {d.targetDept}</option>)}
              </select>
            )}
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{ display: 'none' }} onChange={handleFileSelect} />
            <div style={{ border: `2px dashed ${selectedFile ? GM : B2}`, borderRadius: 12, padding: selectedFile ? '1.25rem' : '2rem', textAlign: 'center', background: selectedFile ? GX : BG, cursor: 'pointer', marginBottom: '1.25rem' }} onClick={() => fileInputRef.current?.click()}>
              {selectedFile ? (
                <>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: G, marginBottom: 4 }}>{selectedFile.name}</div>
                  <div style={{ fontSize: '0.75rem', color: T3 }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  <div style={{ fontSize: '0.72rem', color: AM, marginTop: 6 }} onClick={e => { e.stopPropagation(); setSelectedFile(null) }}>✕ Remove</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: T2, marginBottom: 4 }}>Click to choose file</div>
                  <div style={{ fontSize: '0.78rem', color: T3 }}>PDF, JPG, PNG, DOC · max 5MB</div>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ ...btn(BG, T2), flex: 1 }} onClick={() => { setUploadModal(false); setSelectedFile(null) }}>Cancel</button>
              <button style={{ ...btn(G, S), flex: 1, opacity: uploading ? 0.6 : 1 }} onClick={confirmUpload} disabled={uploading}>
                {uploading ? '⏳ Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAY MODAL */}
      {payModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={() => payStep !== 'processing' && setPayModal(null)}>
          <div style={{ background: S, borderRadius: 18, padding: '2rem', width: 420 }} onClick={e => e.stopPropagation()}>
            {payStep === 'form' && (
              <>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.4rem', marginBottom: '0.4rem' }}>Pay Due</div>
                <div style={{ fontSize: '0.85rem', color: T3, marginBottom: '1.5rem' }}>{payModal.item} — <strong style={{ color: R }}>₹{payModal.amount}</strong></div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={{ ...btn(BG, T2), flex: 1 }} onClick={() => setPayModal(null)}>Cancel</button>
                  <button style={{ ...btn(G, S), flex: 1 }} onClick={processPayment}>Pay with Razorpay</button>
                </div>
              </>
            )}
            {payStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                <div style={{ fontSize: 40, marginBottom: '1rem' }}>⏳</div>
                <div style={{ fontWeight: 700 }}>Processing payment...</div>
                <div style={{ fontSize: '0.83rem', color: T3, marginTop: 6 }}>Please do not close this window.</div>
              </div>
            )}
            {payStep === 'success' && (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: 48, marginBottom: '1rem' }}>✅</div>
                <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: '1.5rem', marginBottom: '0.5rem' }}>Payment Successful!</div>
                <div style={{ fontSize: '0.85rem', color: T3, marginBottom: '1.5rem' }}>₹{payModal.amount} paid. AI receipt ready.</div>
                <div style={{ background: GX, borderRadius: 12, padding: '1rem', marginBottom: '1.25rem', textAlign: 'left', fontSize: '0.83rem' }}>
                  {[['Receipt ID', `RCP-${Date.now().toString().slice(-6)}`], ['Amount', `₹${payModal.amount}`], ['Status', 'Paid ✓']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: `1px solid ${B}` }}>
                      <span style={{ color: T3 }}>{k}</span><span style={{ fontWeight: 700, color: k === 'Status' ? G : T }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={{ ...btn(GX, G), flex: 1, border: `1px solid ${B2}` }} onClick={() => generateAIReceipt(payModal, STUDENT, lastPaymentId)}>
                    ↓ Download AI Receipt
                  </button>
                  <button style={{ ...btn(G, S), flex: 1 }} onClick={() => { setPayModal(null); showToast('Receipt saved!') }}>Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setPreviewDoc(null)}>
          <div style={{ background: S, borderRadius: 18, padding: '1.5rem', maxWidth: 600, width: '90%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{previewDoc.name}</div>
              <button style={btnSm} onClick={() => setPreviewDoc(null)}>✕ Close</button>
            </div>
            {previewDoc.preview && previewDoc.preview.startsWith('data:image') ? (
              <img src={previewDoc.preview} alt={previewDoc.name} style={{ width: '100%', borderRadius: 10, objectFit: 'contain' }} />
            ) : previewDoc.preview && previewDoc.preview.startsWith('data:application/pdf') ? (
              <iframe src={previewDoc.preview} style={{ width: '100%', height: 400, border: 'none', borderRadius: 10 }} title={previewDoc.name} />
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: T3 }}>
                <div style={{ fontSize: 48 }}>📄</div>
                <div style={{ marginTop: '1rem', fontWeight: 600 }}>{previewDoc.file}</div>
                <div style={{ fontSize: '0.8rem', marginTop: 6 }}>Preview not available for this file type.</div>
              </div>
            )}
            {previewDoc.size && <div style={{ fontSize: '0.72rem', color: T3, marginTop: '0.75rem', textAlign: 'center' }}>{previewDoc.size} · Uploaded {previewDoc.date}</div>}
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: toast.type === 'error' ? R : G, color: S, padding: '0.85rem 1.5rem', borderRadius: 12, fontSize: '0.88rem', fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}