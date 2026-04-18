import React from "react";

export default function AdminDashboard() {
    return (
        <div>
            <h1>Admin Dashboard</h1>

            <div style={{ display: "flex", gap: "20px" }}>

                <div className="card">
                    <h3>Total Students</h3>
                    <p>240</p>
                </div>

                <div className="card">
                    <h3>Pending Requests</h3>
                    <p>18</p>
                </div>

                <div className="card">
                    <h3>Documents Pending</h3>
                    <p>12</p>
                </div>

                <div className="card">
                    <h3>Certificates Generated</h3>
                    <p>95</p>
                </div>

            </div>
        </div>
    );
}