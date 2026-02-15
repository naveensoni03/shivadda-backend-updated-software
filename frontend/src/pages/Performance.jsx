import { useEffect, useState } from "react";
import api from "../api/axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'; // Chart ke liye

export default function Performance() {
    const [performance, setPerformance] = useState(null);

    useEffect(() => {
        api.get("/exams/my-performance/").then(res => setPerformance(res.data));
    }, []);

    if (!performance) return <p>Loading Analytics...</p>;

    return (
        <div className="card">
            <h1>Performance Analytics</h1> {/* [cite: 35] */}
            <div style={{ display: 'flex', gap: '20px' }}>
                <div className="card" style={{ background: '#22c55e22' }}>
                    <h4>Current Rank</h4> {/* [cite: 37] */}
                    <h2>#{performance.rank}</h2>
                </div>
                <div className="card" style={{ background: '#ef444422' }}>
                    <h4>Weak Topics</h4> {/*  */}
                    <ul>
                        {performance.weak_topics.map(topic => <li key={topic}>{topic}</li>)}
                    </ul>
                </div>
            </div>
            {/* Accuracy Tracking Chart [cite: 38] */}
            <LineChart width={600} height={300} data={performance.history}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#6366f1" />
            </LineChart>
        </div>
    );
}