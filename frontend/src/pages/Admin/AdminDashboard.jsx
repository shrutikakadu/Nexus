import AdminSidebar from "../../components/AdminSidebar"

export default function AdminDashboard() {

    const stats = [
        { title: "Total Students", value: 240 },
        { title: "Pending Requests", value: 18 },
        { title: "Documents Pending", value: 12 },
        { title: "Certificates Generated", value: 95 }
    ]

    return (

        <div style={{ display: "flex" }}>

            <AdminSidebar />

            <div style={{ padding: "40px", width: "100%" }}>

                <h1>Admin Dashboard</h1>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: "20px",
                    marginTop: "30px"
                }}>

                    {stats.map((s, i) => (
                        <div key={i} style={{
                            background: "#ffffff",
                            padding: "25px",
                            borderRadius: "10px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
                        }}>
                            <h4>{s.title}</h4>
                            <h2>{s.value}</h2>
                        </div>
                    ))}

                </div>

            </div>

        </div>

    )
}