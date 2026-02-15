import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";

export default function StudentFinance() {
    const [feeData, setFeeData] = useState(null);

    useEffect(() => {
        api.get("/fees/my-ledger/").then(res => setFeeData(res.data));
    }, []);

    if (!feeData) return <p>Loading Ledger...</p>;

    return (
        <div style={{ display: "flex" }}>
            <Sidebar />
            <div style={{ flex: 1, padding: "40px", color: "#fff" }}>
                <h1>Student Fee Ledger (Point 53)</h1>
                <div className="card" style={{ background: '#1e293b', padding: '20px', borderRadius: '12px' }}>
                    <h3>Summary</h3>
                    <p>Total Paid: ₹{feeData.summary.total_paid}</p>
                    <p style={{ color: '#ef4444' }}>Outstanding: ₹{feeData.summary.outstanding_balance}</p>
                </div>

                <table className="agents-table" style={{ marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th>Installment</th>
                            <th>Due Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feeData.ledger.map(item => (
                            <tr key={item.id}>
                                <td>₹{item.amount}</td>
                                <td>{item.due_date}</td>
                                <td style={{ color: item.status ? '#22c55e' : '#f59e0b' }}>
                                    {item.status ? "Paid" : "Pending"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}