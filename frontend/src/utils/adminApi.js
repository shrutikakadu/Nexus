/**
 * Shared API utility for admin dashboards to fetch registered students.
 * Import and call fetchRegisteredStudents(deptName) in any admin dashboard.
 */

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/auth` : 'http://127.0.0.1:8000/api/auth'

/**
 * Fetch all registered students from the backend and map them
 * to the format used by admin dashboard tables.
 * @param {string} deptName - Department name (Library, Lab, Accounts, Hostel, HOD, Principal)
 * @returns {Promise<Array>} Mapped student array
 */
export async function fetchRegisteredStudents(deptName) {
    try {
        const res = await fetch(`${API_BASE}/students`)
        if (!res.ok) return []
        const data = await res.json()
        return data.map((s, i) => {
            let studentDues = null;
            try {
                const saved = localStorage.getItem(`nexus_dues_${s.roll}`)
                if (saved) studentDues = JSON.parse(saved)
            } catch {}

            // Match structure of INITIAL_DUES in StudentDashboard:
            // 0: Tuition, 1: Library Fine, 2: Hostel, 3: Exam Fee, 4: Lab Deposit
            const tuitionPaid = studentDues ? studentDues[0]?.paid : false;
            const libFinePaid = studentDues ? studentDues[1]?.paid : false;
            const libFineAmount = studentDues ? (studentDues[1]?.amount ?? 150) : 150;
            const hostelPaid = studentDues ? studentDues[2]?.paid : false;
            
            return {
                id: `api_${s.roll}`,
                studentId: s.roll,
                initials: (s.name || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
                avatarClass: ['green-bg', 'blue-bg', 'amber-bg', 'purple-bg'][i % 4],
                name: s.name,
                roll: s.roll,
                dept: s.dept,
                batch: s.batch,
                email: s.email,
                status: s.clearance_status?.[deptName] || 'pending',
                statusColor: s.clearance_status?.[deptName] === 'approved' ? 'green' : s.clearance_status?.[deptName] === 'rejected' ? 'red' : 'amber',
                statusLabel: s.clearance_status?.[deptName] === 'approved' ? 'Cleared' : s.clearance_status?.[deptName] === 'rejected' ? 'Rejected' : 'Pending',
                heatmap: s.clearance_status || {},
                clearance_status: s.clearance_status || {},
                // Dept-specific defaults synced from dues if applicable
                booksIssued: 0, fine: libFinePaid ? 0 : libFineAmount,
                libraryFine: libFinePaid ? '₹0' : `₹${libFineAmount}`,
                labManual: 'Not Submitted', equipment: 'Not Returned',
                tuition: tuitionPaid ? 'Paid' : 'Pending',
                feesTotal: tuitionPaid ? 0 : 4500,
                scholarship: 'None',
                hostelFees: hostelPaid ? 'Paid' : 'Pending',
                messDues: hostelPaid ? '₹0' : '₹650',
                damage: 'None',
                roomNo: s.hostel || 'N/A', checkout: 'Pending',
                project: 'Not Submitted', internship: 'Not Completed',
                fromStore: true,
            }
        })
    } catch {
        return []
    }
}

/**
 * Update clearance status in the backend.
 */
export async function updateClearanceAPI(roll, dept, status, comment = '') {
    const adminEmail = localStorage.getItem('nexus_email') || ''
    try {
        await fetch(
            `${API_BASE}/clearance/update?roll=${encodeURIComponent(roll)}&dept=${encodeURIComponent(dept)}&new_status=${status}&comment=${encodeURIComponent(comment)}&admin_email=${encodeURIComponent(adminEmail)}`,
            { method: 'POST' }
        )
    } catch {
        // Offline — will sync later
    }
}
