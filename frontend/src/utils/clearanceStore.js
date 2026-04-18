/**
 * Nexus Clearance Store — Shared state via localStorage
 * Bridges Student Dashboard ↔ Admin Dashboards
 * 
 * Student uploads documents → stored here → Admin dashboards read them
 * Admin approves/rejects  → stored here → Student dashboard reads status
 */

const STORE_KEY = 'nexus_clearance_store'

// Default seed data matching existing student
const DEFAULT_STORE = {
  submissions: [
    // Pre-seeded submissions from the student
    {
      id: 'sub_001',
      studentId: 'CS2025041',
      studentName: 'Hritani Sharma',
      initials: 'HS',
      avatarClass: 'blue-bg',
      dept: 'Computer Science',
      batch: '2025',
      documents: [
        { docId: 'doc_1', name: 'College ID Card', type: 'JPG', size: '1.2 MB', uploadedAt: '15 Apr 2025', targetDept: 'Library', status: 'verified' },
        { docId: 'doc_2', name: 'Library Receipt', type: 'PDF', size: '0.8 MB', uploadedAt: '15 Apr 2025', targetDept: 'Library', status: 'verified' },
        { docId: 'doc_3', name: 'Lab Manual Return', type: 'PDF', size: '2.1 MB', uploadedAt: '16 Apr 2025', targetDept: 'Lab', status: 'pending' },
      ],
      clearanceStatus: {
        Library: 'approved',
        Lab: 'approved',
        HOD: 'pending',
        Principal: 'pending',
        Accounts: 'pending',
        Hostel: 'pending',
      },
      adminComments: {
        Library: 'All books returned. No dues.',
        Lab: 'Lab manuals submitted.',
      },
      createdAt: '2025-04-15T10:00:00',
    }
  ],
  // Track uploaded files with metadata (simulated file content as data URLs)
  uploadedFiles: {},
}

/** Get the full store */
export function getStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) {
      localStorage.setItem(STORE_KEY, JSON.stringify(DEFAULT_STORE))
      return { ...DEFAULT_STORE }
    }
    return JSON.parse(raw)
  } catch {
    return { ...DEFAULT_STORE }
  }
}

/** Save the full store */
function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
  // Dispatch a custom event so other tabs/components can react
  window.dispatchEvent(new CustomEvent('nexus-store-update', { detail: store }))
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
      adminComments: {},
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

  saveStore(store)
  return docId
}

/** Student gets their clearance status */
export function getStudentStatus(studentId) {
  const store = getStore()
  const submission = store.submissions.find(s => s.studentId === studentId)
  return submission || null
}

// ─── ADMIN-SIDE ACTIONS ──────────────────────────────────────────

/** Get all submissions visible to a specific admin role */
export function getSubmissionsForAdmin(adminRole) {
  const store = getStore()
  return store.submissions.map(s => ({
    ...s,
    // Filter documents relevant to this admin's department
    relevantDocs: s.documents.filter(d => d.targetDept === adminRole || adminRole === 'HOD' || adminRole === 'Principal'),
    statusForRole: s.clearanceStatus[adminRole] || 'pending',
  }))
}

/** Admin approves a student's clearance */
export function adminApprove(studentId, adminRole, comment = '') {
  const store = getStore()
  const submission = store.submissions.find(s => s.studentId === studentId)
  if (!submission) return false

  submission.clearanceStatus[adminRole] = 'approved'
  if (comment) submission.adminComments[adminRole] = comment

  // Mark relevant docs as verified
  submission.documents.forEach(d => {
    if (d.targetDept === adminRole) d.status = 'verified'
  })

  saveStore(store)
  return true
}

/** Admin rejects a student's clearance */
export function adminReject(studentId, adminRole, comment = '') {
  const store = getStore()
  const submission = store.submissions.find(s => s.studentId === studentId)
  if (!submission) return false

  submission.clearanceStatus[adminRole] = 'rejected'
  if (comment) submission.adminComments[adminRole] = comment

  // Mark relevant docs as rejected
  submission.documents.forEach(d => {
    if (d.targetDept === adminRole) d.status = 'rejected'
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
