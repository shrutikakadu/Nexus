/**
 * Nexus Clearance Store — Shared state via localStorage
 * Bridges Student Dashboard ↔ Admin Dashboards
 * 
 * Student uploads documents → stored here → Admin dashboards read them
 * Admin approves/rejects  → stored here → Student dashboard reads status
 */

const STORE_KEY = 'nexus_clearance_store'
const STORE_VERSION = 3  // Bumped to seed sample students

// ── SAMPLE STUDENTS — always visible on admin dashboards ────────────────
const SAMPLE_STUDENTS = [
  {
    id: 'sub_sample_1',
    studentId: 'CS2025041',
    studentName: 'Hritani Sharma',
    initials: 'HS',
    avatarClass: 'blue-bg',
    dept: 'Computer Science',
    batch: '2025',
    documents: [
      { docId: 'doc_s1_1', name: 'College ID Card', type: 'PDF', size: '1.2 MB', uploadedAt: '25 Apr 2026', targetDept: 'Library', status: 'pending' },
      { docId: 'doc_s1_2', name: 'Library Receipt', type: 'PDF', size: '0.8 MB', uploadedAt: '25 Apr 2026', targetDept: 'Library', status: 'pending' },
      { docId: 'doc_s1_3', name: 'Lab Manual Return', type: 'JPG', size: '2.1 MB', uploadedAt: '26 Apr 2026', targetDept: 'Lab', status: 'pending' },
      { docId: 'doc_s1_4', name: 'Fee Clearance', type: 'PDF', size: '0.5 MB', uploadedAt: '26 Apr 2026', targetDept: 'Accounts', status: 'pending' },
      { docId: 'doc_s1_5', name: 'Hostel No-Dues', type: 'PDF', size: '0.3 MB', uploadedAt: '27 Apr 2026', targetDept: 'Hostel', status: 'pending' },
    ],
    clearanceStatus: { Library: 'approved', Lab: 'approved', HOD: 'pending', Principal: 'pending', Accounts: 'approved', Hostel: 'approved' },
    dues: [
      { id: 101, dept: 'Accounts', item: 'Tuition Fee (Sem 8)', amount: 4500, paid: true, paymentId: 'pay_demo_hs1' },
      { id: 102, dept: 'Library', item: 'Late Return Fine', amount: 150, paid: true, paymentId: 'pay_demo_hs2' },
      { id: 103, dept: 'Hostel', item: 'Hostel Dues', amount: 650, paid: true, paymentId: 'pay_demo_hs3' },
    ],
    adminComments: { Library: 'All books returned. Cleared.', Lab: 'Lab equipment verified.' },
    notifications: [],
    createdAt: '2026-04-25T10:00:00.000Z',
  },
  {
    id: 'sub_sample_2',
    studentId: 'IT2025018',
    studentName: 'Arjun Mehta',
    initials: 'AM',
    avatarClass: 'blue-bg',
    dept: 'Information Technology',
    batch: '2025',
    documents: [
      { docId: 'doc_s2_1', name: 'College ID Card', type: 'PDF', size: '1.0 MB', uploadedAt: '24 Apr 2026', targetDept: 'Library', status: 'pending' },
      { docId: 'doc_s2_2', name: 'Lab Manual Return', type: 'PDF', size: '1.5 MB', uploadedAt: '24 Apr 2026', targetDept: 'Lab', status: 'pending' },
      { docId: 'doc_s2_3', name: 'Fee Clearance', type: 'PDF', size: '0.7 MB', uploadedAt: '25 Apr 2026', targetDept: 'Accounts', status: 'pending' },
      { docId: 'doc_s2_4', name: 'Hostel No-Dues', type: 'PDF', size: '0.4 MB', uploadedAt: '25 Apr 2026', targetDept: 'Hostel', status: 'pending' },
    ],
    clearanceStatus: { Library: 'pending', Lab: 'pending', HOD: 'pending', Principal: 'pending', Accounts: 'pending', Hostel: 'pending' },
    dues: [
      { id: 201, dept: 'Accounts', item: 'Tuition Fee (Sem 8)', amount: 4500, paid: false },
      { id: 202, dept: 'Library', item: 'Late Return Fine', amount: 340, paid: false },
      { id: 203, dept: 'Hostel', item: 'Hostel Dues', amount: 800, paid: false },
    ],
    adminComments: {},
    notifications: [],
    createdAt: '2026-04-24T09:30:00.000Z',
  },
  {
    id: 'sub_sample_3',
    studentId: 'EC2025007',
    studentName: 'Neha Patel',
    initials: 'NP',
    avatarClass: 'blue-bg',
    dept: 'Electronics & Communication',
    batch: '2025',
    documents: [
      { docId: 'doc_s3_1', name: 'College ID Card', type: 'PDF', size: '0.9 MB', uploadedAt: '22 Apr 2026', targetDept: 'Library', status: 'verified' },
      { docId: 'doc_s3_2', name: 'Library Receipt', type: 'PDF', size: '0.6 MB', uploadedAt: '22 Apr 2026', targetDept: 'Library', status: 'verified' },
      { docId: 'doc_s3_3', name: 'Lab Manual Return', type: 'JPG', size: '1.8 MB', uploadedAt: '23 Apr 2026', targetDept: 'Lab', status: 'verified' },
      { docId: 'doc_s3_4', name: 'Fee Clearance', type: 'PDF', size: '0.4 MB', uploadedAt: '23 Apr 2026', targetDept: 'Accounts', status: 'verified' },
      { docId: 'doc_s3_5', name: 'Hostel No-Dues', type: 'PDF', size: '0.3 MB', uploadedAt: '23 Apr 2026', targetDept: 'Hostel', status: 'verified' },
      { docId: 'doc_s3_6', name: 'Sports No-Dues', type: 'PDF', size: '0.2 MB', uploadedAt: '24 Apr 2026', targetDept: 'HOD', status: 'verified' },
    ],
    clearanceStatus: { Library: 'approved', Lab: 'approved', HOD: 'approved', Principal: 'approved', Accounts: 'approved', Hostel: 'approved' },
    dues: [
      { id: 301, dept: 'Accounts', item: 'Tuition Fee (Sem 8)', amount: 4500, paid: true, paymentId: 'pay_demo_np1' },
      { id: 302, dept: 'Library', item: 'Late Return Fine', amount: 120, paid: true, paymentId: 'pay_demo_np2' },
      { id: 303, dept: 'Hostel', item: 'Hostel Dues', amount: 650, paid: true, paymentId: 'pay_demo_np3' },
    ],
    adminComments: { Library: 'Cleared.', Lab: 'All clear.', HOD: 'Approved by HOD.', Principal: 'Final approval granted.' },
    notifications: [],
    createdAt: '2026-04-22T08:00:00.000Z',
  },
  {
    id: 'sub_sample_4',
    studentId: 'ME2025033',
    studentName: 'Karan Joshi',
    initials: 'KJ',
    avatarClass: 'blue-bg',
    dept: 'Mechanical Engineering',
    batch: '2025',
    documents: [
      { docId: 'doc_s4_1', name: 'College ID Card', type: 'PDF', size: '1.1 MB', uploadedAt: '26 Apr 2026', targetDept: 'Library', status: 'rejected' },
      { docId: 'doc_s4_2', name: 'Lab Manual Return', type: 'JPG', size: '2.3 MB', uploadedAt: '26 Apr 2026', targetDept: 'Lab', status: 'pending' },
      { docId: 'doc_s4_3', name: 'Hostel No-Dues', type: 'PDF', size: '0.5 MB', uploadedAt: '27 Apr 2026', targetDept: 'Hostel', status: 'pending' },
    ],
    clearanceStatus: { Library: 'rejected', Lab: 'pending', HOD: 'pending', Principal: 'pending', Accounts: 'pending', Hostel: 'pending' },
    dues: [
      { id: 401, dept: 'Accounts', item: 'Tuition Fee (Sem 8)', amount: 4500, paid: false },
      { id: 402, dept: 'Library', item: 'Lost Book Charge', amount: 1200, paid: false },
      { id: 403, dept: 'Hostel', item: 'Hostel Dues', amount: 800, paid: false },
    ],
    adminComments: { Library: 'Book "Advanced Thermodynamics" not returned. Fine pending.' },
    notifications: [],
    createdAt: '2026-04-26T14:00:00.000Z',
  },
  {
    id: 'sub_sample_5',
    studentId: 'CE2025022',
    studentName: 'Tanya Roy',
    initials: 'TR',
    avatarClass: 'blue-bg',
    dept: 'Civil Engineering',
    batch: '2025',
    documents: [
      { docId: 'doc_s5_1', name: 'College ID Card', type: 'PDF', size: '0.9 MB', uploadedAt: '27 Apr 2026', targetDept: 'Library', status: 'pending' },
      { docId: 'doc_s5_2', name: 'Library Receipt', type: 'PDF', size: '0.5 MB', uploadedAt: '27 Apr 2026', targetDept: 'Library', status: 'pending' },
      { docId: 'doc_s5_3', name: 'Lab Manual Return', type: 'PDF', size: '1.4 MB', uploadedAt: '28 Apr 2026', targetDept: 'Lab', status: 'pending' },
      { docId: 'doc_s5_4', name: 'Fee Clearance', type: 'PDF', size: '0.6 MB', uploadedAt: '28 Apr 2026', targetDept: 'Accounts', status: 'pending' },
      { docId: 'doc_s5_5', name: 'Hostel No-Dues', type: 'PDF', size: '0.3 MB', uploadedAt: '28 Apr 2026', targetDept: 'Hostel', status: 'pending' },
    ],
    clearanceStatus: { Library: 'approved', Lab: 'pending', HOD: 'pending', Principal: 'pending', Accounts: 'pending', Hostel: 'approved' },
    dues: [
      { id: 501, dept: 'Accounts', item: 'Tuition Fee (Sem 8)', amount: 4500, paid: true, paymentId: 'pay_demo_tr1' },
      { id: 502, dept: 'Library', item: 'Late Return Fine', amount: 120, paid: true, paymentId: 'pay_demo_tr2' },
      { id: 503, dept: 'Hostel', item: 'Hostel Dues', amount: 650, paid: true, paymentId: 'pay_demo_tr3' },
    ],
    adminComments: { Library: 'Books returned. Fine paid.', Hostel: 'Room vacated and verified.' },
    notifications: [],
    createdAt: '2026-04-27T11:00:00.000Z',
  },
]

// Clean default store — seeded with sample students on first create
const DEFAULT_STORE = {
  version: STORE_VERSION,
  submissions: [...SAMPLE_STUDENTS],
  // Track uploaded files with metadata (simulated file content as data URLs)
  uploadedFiles: {},
  // Notifications for admins (role-based)
  adminNotifications: [
    { id: 1001, role: 'Library', msg: 'New document "College ID Card" uploaded by Arjun Mehta (IT2025018)', time: '2 hours ago', read: false },
    { id: 1002, role: 'Lab', msg: 'New document "Lab Manual Return" uploaded by Karan Joshi (ME2025033)', time: '1 hour ago', read: false },
    { id: 1003, role: 'Accounts', msg: 'Payment of ₹4500 received from Hritani Sharma for Tuition Fee (Sem 8)', time: '3 hours ago', read: true },
    { id: 1004, role: 'Hostel', msg: 'New document "Hostel No-Dues" uploaded by Tanya Roy (CE2025022)', time: '4 hours ago', read: false },
    { id: 1005, role: 'Library', msg: 'Karan Joshi (ME2025033) flagged — book not returned', time: '5 hours ago', read: true },
  ],
}

/** Get the full store */
export function getStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) {
      const seeded = { ...DEFAULT_STORE, submissions: [...SAMPLE_STUDENTS] }
      localStorage.setItem(STORE_KEY, JSON.stringify(seeded))
      return seeded
    }
    const parsed = JSON.parse(raw)
    // Force reset if store is from an older version (had stale pre-seeded data)
    if (!parsed.version || parsed.version < STORE_VERSION) {
      const seeded = { ...DEFAULT_STORE, submissions: [...SAMPLE_STUDENTS] }
      localStorage.setItem(STORE_KEY, JSON.stringify(seeded))
      return seeded
    }
    return parsed
  } catch {
    return { ...DEFAULT_STORE }
  }
}

/** Save the full store */
function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
  // Dispatch a custom event so other tabs/components can react
  window.dispatchEvent(new CustomEvent('nexus-store-update', { detail: store }))
  // Sync clearance data to backend for the nudge email system
  syncClearanceToBackend(store)
}

// ─── STUDENT-SIDE ACTIONS ────────────────────────────────────────

/** Student uploads a document targeting a department */
export function studentUploadDocument({ studentId, studentName, initials, avatarClass, dept, batch, docName, docType, docSize, targetDept, fileDataUrl }) {
  const store = getStore()
  let submission = store.submissions.find(s => s.studentId === studentId)

  if (!submission) {
    submission = {
      id: `sub_${Date.now()}`,
      studentId,
      studentName,
      initials,
      avatarClass,
      dept,
      batch,
      documents: [],
      clearanceStatus: { Library: 'pending', Lab: 'pending', HOD: 'pending', Principal: 'pending', Accounts: 'pending', Hostel: 'pending' },
      dues: [
        { id: 1, dept: 'Accounts', item: 'Tuition Fee (Sem 8)', amount: 4500, paid: false },
        { id: 2, dept: 'Library', item: 'Late Return Fine', amount: 150, paid: false },
        { id: 3, dept: 'Hostel', item: 'Hostel Dues', amount: 650, paid: false },
      ],
      adminComments: {},
      notifications: [],
      createdAt: new Date().toISOString(),
    }
    store.submissions.push(submission)
  }

  const docId = `doc_${Date.now()}`
  submission.documents.push({
    docId,
    name: docName,
    type: docType,
    size: docSize,
    uploadedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    targetDept,
    status: 'pending',
  })

  // Store the file data
  if (fileDataUrl) {
    store.uploadedFiles[docId] = fileDataUrl
  }

  // Notify the relevant admin
  if (!store.adminNotifications) store.adminNotifications = []
  store.adminNotifications.push({
    id: Date.now(),
    role: targetDept,
    msg: `New document "${docName}" uploaded by ${studentName} (${studentId})`,
    time: 'Just now',
    read: false
  })

  saveStore(store)
  return docId
}

/** Initialize a student in the store so admins can see them immediately */
export function initStudentSubmission({ studentId, studentName, initials, avatarClass, dept, batch }) {
  const store = getStore()
  let submission = store.submissions.find(s => s.studentId === studentId)
  if (!submission) {
    submission = {
      id: `sub_${Date.now()}`,
      studentId,
      studentName,
      initials,
      avatarClass: avatarClass || 'blue-bg',
      dept,
      batch,
      documents: [],
      clearanceStatus: { Library: 'pending', Lab: 'pending', HOD: 'pending', Principal: 'pending', Accounts: 'pending', Hostel: 'pending' },
      dues: [
        { id: 1, dept: 'Accounts', item: 'Tuition Fee (Sem 8)', amount: 4500, paid: false },
        { id: 2, dept: 'Library', item: 'Late Return Fine', amount: 150, paid: false },
        { id: 3, dept: 'Hostel', item: 'Hostel Dues', amount: 650, paid: false },
      ],
      adminComments: {},
      notifications: [],
      createdAt: new Date().toISOString(),
    }
    store.submissions.push(submission)
    saveStore(store)
  }
}

/** Student gets their clearance status */
export function getStudentStatus(studentId) {
  const store = getStore()
  const submission = store.submissions.find(s => s.studentId === studentId)
  return submission || null
}

/** Student marks notifications as read */
export function studentMarkNotificationsRead(studentId) {
  const store = getStore()
  const submission = store.submissions.find(s => s.studentId === studentId)
  if (submission && submission.notifications) {
    submission.notifications.forEach(n => n.read = true)
    saveStore(store)
  }
}

/** Student pays a due */
export function studentPayDue(studentId, dueId, paymentId) {
  const store = getStore()
  const submission = store.submissions.find(s => s.studentId === studentId)
  if (!submission) return false

  const due = (submission.dues || []).find(d => String(d.id) === String(dueId))
  if (due) {
    due.paid = true
    due.paymentId = paymentId
    
    // Notify Accounts Admin
    if (!store.adminNotifications) store.adminNotifications = []
    store.adminNotifications.push({
      id: Date.now(),
      role: 'Accounts',
      msg: `Payment of ₹${due.amount} received from ${submission.studentName} for ${due.item}`,
      time: 'Just now',
      read: false
    })
    
    saveStore(store)
    return true
  }
  return false
}

/** Process a CSV string of dues and update the store */
export function processDuesCSV(csvText, dept) {
  const store = getStore()
  const lines = csvText.split('\n')
  let updatedCount = 0

  // Expected format: RollNumber,Amount,Item
  lines.forEach(line => {
    const [roll, amount, item] = line.split(',').map(s => s?.trim())
    if (!roll || isNaN(amount)) return

    const submission = store.submissions.find(s => s.studentId === roll)
    if (submission) {
      if (!submission.dues) submission.dues = []
      // Check if this specific due already exists
      const existing = submission.dues.find(d => d.item === item && d.dept === dept)
      if (!existing) {
        submission.dues.push({
          id: Date.now() + Math.random(),
          dept,
          item: item || 'Pending Dues',
          amount: parseInt(amount),
          paid: false
        })
        updatedCount++
        
        // Notify student
        if (!submission.notifications) submission.notifications = []
        submission.notifications.push({
          id: Date.now(),
          msg: `⚠️ New dues added by ${dept}: ₹${amount} for ${item}`,
          time: 'Just now',
          read: false,
          type: 'error'
        })
      }
    }
  })

  if (updatedCount > 0) saveStore(store)
  return updatedCount
}

// ─── BACKEND PROFILE SYNC — Fetch real students into the store ──

const BACKEND_BASE = 'http://localhost:8000'
let _profileSyncDone = false

/**
 * Fetch all completed student profiles from the backend DB
 * and merge them into the clearance store so they show up on admin dashboards.
 * Runs eagerly on module load — dispatches a store update event when done
 * so all mounted admin dashboards auto-refresh with the new data.
 */
function syncBackendProfiles() {
  if (_profileSyncDone) return
  _profileSyncDone = true

  fetch(`${BACKEND_BASE}/api/auth/profiles`)
    .then(res => { if (!res.ok) throw new Error('fail'); return res.json() })
    .then(profiles => {
      const store = getStore()
      let added = 0

      for (const p of profiles) {
        // Skip if this student (by roll number) already exists in the store
        if (store.submissions.find(s => s.studentId === p.roll)) continue

        const initials = (p.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        const submission = {
          id: `sub_db_${p.roll}`,
          studentId: p.roll,
          studentName: p.name,
          studentEmail: p.email,
          initials,
          avatarClass: 'blue-bg',
          dept: p.dept || '',
          batch: p.batch || '',
          documents: [],
          clearanceStatus: { Library: 'pending', Lab: 'pending', HOD: 'pending', Principal: 'pending', Accounts: 'pending', Hostel: 'pending' },
          dues: [
            { id: Date.now() + 1, dept: 'Accounts', item: 'Tuition Fee (Sem 8)', amount: 4500, paid: false },
            { id: Date.now() + 2, dept: 'Library', item: 'Late Return Fine', amount: 150, paid: false },
            { id: Date.now() + 3, dept: 'Hostel', item: 'Hostel Dues', amount: 650, paid: false },
          ],
          adminComments: {},
          notifications: [],
          createdAt: new Date().toISOString(),
        }
        store.submissions.push(submission)
        added++

        // Add a notification for admins about the new student
        if (!store.adminNotifications) store.adminNotifications = []
        store.adminNotifications.push({
          id: Date.now() + Math.random(),
          role: 'Library',
          msg: `New student registered: ${p.name} (${p.roll}) — ${p.dept}`,
          time: 'Recently',
          read: false,
        })
      }

      if (added > 0) {
        saveStore(store)  // This dispatches 'nexus-store-update', causing all dashboards to re-render
      }
    })
    .catch(() => { /* Silent fail — backend may not be running */ })
}

// ── Run sync eagerly when this module is first imported ──
syncBackendProfiles()

// ─── ADMIN-SIDE ACTIONS ──────────────────────────────────────────

/** Get all submissions visible to a specific admin role */
export function getSubmissionsForAdmin(adminRole) {
  const store = getStore()
  return store.submissions.map(s => ({
    ...s,
    relevantDocs: s.documents.filter(d => d.targetDept === adminRole || adminRole === 'HOD' || adminRole === 'Principal'),
    statusForRole: s.clearanceStatus[adminRole] || 'pending',
  }))
}

/** Get admin notifications for a specific role */
export function getAdminNotifications(role) {
  const store = getStore()
  if (!store.adminNotifications) return []
  return store.adminNotifications.filter(n => n.role === role || role === 'Principal').reverse()
}

/** Admin marks their notifications as read */
export function adminMarkNotificationsRead(role) {
  const store = getStore()
  if (!store.adminNotifications) return
  store.adminNotifications.forEach(n => {
    if (n.role === role || role === 'Principal') n.read = true
  })
  saveStore(store)
}

/** Admin approves a student's clearance */
export function adminApprove(studentId, adminRole, comment = '') {
  const store = getStore()
  const submission = store.submissions.find(s => s.studentId === studentId)
  if (!submission) return { success: false, message: 'Student not found' }

  // 1. Check if all dues for this dept are paid
  const pendingDues = (submission.dues || []).filter(d => d.dept === adminRole && !d.paid)
  if (pendingDues.length > 0 && adminRole !== 'HOD' && adminRole !== 'Principal') {
    return { success: false, message: `Student has ₹${pendingDues.reduce((s,d)=>s+d.amount,0)} pending dues in your department.` }
  }

  // 2. Check if required documents are uploaded (for dept admins)
  if (adminRole !== 'HOD' && adminRole !== 'Principal') {
    const deptDocs = submission.documents.filter(d => d.targetDept === adminRole)
    if (deptDocs.length === 0) {
      return { success: false, message: `Required documents for ${adminRole} have not been uploaded yet.` }
    }
  }

  submission.clearanceStatus[adminRole] = 'approved'
  if (comment) submission.adminComments[adminRole] = comment
  if (!submission.notifications) submission.notifications = []
  
  submission.notifications.push({
    id: Date.now(),
    msg: `✅ ${adminRole} department has APPROVED your clearance.`,
    time: 'Just now',
    read: false,
    type: 'success'
  })

  // Mark relevant docs as verified
  submission.documents.forEach(d => {
    if (d.targetDept === adminRole) d.status = 'verified'
  })

  saveStore(store)
  return { success: true }
}

/** Admin rejects a student's clearance */
export function adminReject(studentId, adminRole, comment = '') {
  const store = getStore()
  const submission = store.submissions.find(s => s.studentId === studentId)
  if (!submission) return false

  submission.clearanceStatus[adminRole] = 'rejected'
  if (comment) submission.adminComments[adminRole] = comment
  if (!submission.notifications) submission.notifications = []

  submission.notifications.push({
    id: Date.now(),
    msg: `⚠️ ${adminRole} flagged your application. Reason: ${comment || 'No reason provided'}`,
    time: 'Just now',
    read: false,
    type: 'error'
  })

  // Mark relevant docs as rejected
  submission.documents.forEach(d => {
    if (d.targetDept === adminRole) d.status = 'rejected'
  })

  saveStore(store)
  return true
}

/** Admin flags a student's clearance */
export function adminFlag(studentId, adminRole, comment = '') {
  const store = getStore()
  const submission = store.submissions.find(s => s.studentId === studentId)
  if (!submission) return false

  submission.clearanceStatus[adminRole] = 'flagged'
  if (comment) submission.adminComments[adminRole] = comment

  // Mark relevant docs as flagged
  submission.documents.forEach(d => {
    if (d.targetDept === adminRole) d.status = 'flagged'
  })

  saveStore(store)
  return true
}

/** Get a file's data URL by docId */
export function getUploadedFile(docId) {
  const store = getStore()
  return store.uploadedFiles[docId] || null
}

/** Hook helper — use in useEffect to subscribe to store changes */
export function onStoreUpdate(callback) {
  const handler = (e) => callback(e.detail)
  window.addEventListener('nexus-store-update', handler)
  // Also listen to storage events from other tabs
  const storageHandler = (e) => {
    if (e.key === STORE_KEY) callback(JSON.parse(e.newValue))
  }
  window.addEventListener('storage', storageHandler)
  return () => {
    window.removeEventListener('nexus-store-update', handler)
    window.removeEventListener('storage', storageHandler)
  }
}

// ─── BACKEND SYNC FOR NUDGE SYSTEM ──────────────────────────────

const BACKEND_URL = 'http://localhost:8000'
let syncDebounceTimer = null

/**
 * Sync clearance data to the backend database.
 * This enables the automated email nudge system to detect stale requests.
 * Debounced to avoid flooding the backend on rapid updates.
 */
function syncClearanceToBackend(store) {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer)
  syncDebounceTimer = setTimeout(() => {
    try {
      const requests = []
      for (const sub of (store.submissions || [])) {
        const email = sub.studentEmail || sub.email || ''
        for (const [dept, status] of Object.entries(sub.clearanceStatus || {})) {
          requests.push({
            student_id: sub.studentId,
            student_name: sub.studentName,
            student_email: email,
            department: dept,
            status: status,
            admin_comment: (sub.adminComments || {})[dept] || '',
          })
        }
      }
      if (requests.length === 0) return

      fetch(`${BACKEND_URL}/api/nudge/sync-clearance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests }),
      }).catch(() => { /* silently fail — nudge sync is best-effort */ })
    } catch {
      // Silent fail — don't break the main store flow
    }
  }, 2000) // 2-second debounce
}
