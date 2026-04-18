import React from "react";

export default function AdminStudentManagement() {
    return (
        <div>
            <h2>Students</h2>

            <table border="1">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Roll</th>
                        <th>Department</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>Tanaya</td>
                        <td>CS21-034</td>
                        <td>CSE</td>
                        <td>Complete</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}