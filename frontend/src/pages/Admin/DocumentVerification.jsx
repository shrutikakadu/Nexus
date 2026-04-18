import React from "react";

export default function DocumentVerification() {
    return (
        <div>
            <h2>Document Verification</h2>

            <table border="1">
                <thead>
                    <tr>
                        <th>Document</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>10th Marksheet</td>
                        <td>
                            <button>View</button>
                            <button>Approve</button>
                            <button>Reject</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}