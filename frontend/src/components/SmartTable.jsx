import React, { useState } from "react";
import { Trash2, CheckSquare, MoreHorizontal, Filter } from "lucide-react";

export default function SmartTable({ columns, data, title, onBulkAction }) {
  const [selected, setSelected] = useState([]);

  const toggleSelect = (id) => {
    if(selected.includes(id)) setSelected(selected.filter(i => i !== id));
    else setSelected([...selected, id]);
  };

  const toggleAll = () => {
    if(selected.length === data.length) setSelected([]);
    else setSelected(data.map(d => d.id));
  };

  return (
    <div style={{background: "white", borderRadius: "20px", padding: "25px", border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"}}>
        <div style={{display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center"}}>
            <h3 style={{margin: 0, color: "#1e293b", fontSize: "1.1rem", fontWeight: "800"}}>{title}</h3>
            {selected.length > 0 && (
                <div style={{display: "flex", gap: "10px"}}>
                    <button onClick={() => onBulkAction('delete', selected)} style={{background: "#fef2f2", color: "#ef4444", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"}}><Trash2 size={16}/> Delete ({selected.length})</button>
                </div>
            )}
        </div>
        <table style={{width: "100%", borderCollapse: "collapse"}}>
            <thead>
                <tr style={{borderBottom: "2px solid #f1f5f9"}}>
                    <th style={{padding: "15px", width: "40px"}}><input type="checkbox" checked={selected.length === data.length && data.length > 0} onChange={toggleAll} style={{cursor: "pointer", width: "16px", height: "16px"}} /></th>
                    <th style={{padding: "15px", textAlign: "left", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase"}}>S.No</th>
                    {columns.map((col, i) => <th key={i} style={{padding: "15px", textAlign: "left", fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase"}}>{col.header}</th>)}
                    <th style={{padding: "15px", textAlign: "right"}}>Action</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, idx) => (
                    <tr key={row.id} style={{borderBottom: "1px solid #f8fafc"}}>
                        <td style={{padding: "15px"}}><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleSelect(row.id)} style={{cursor: "pointer", width: "16px", height: "16px"}} /></td>
                        <td style={{padding: "15px", color: "#94a3b8", fontWeight: "600", fontSize: "0.9rem"}}>{idx + 1}</td>
                        {columns.map((col, cIdx) => (
                            <td key={cIdx} style={{padding: "15px", color: "#334155", fontWeight: "500", fontSize: "0.9rem"}}>
                                {col.render ? col.render(row) : row[col.field]}
                            </td>
                        ))}
                        <td style={{padding: "15px", textAlign: "right"}}><button style={{background: "none", border: "none", cursor: "pointer", color: "#94a3b8"}}><MoreHorizontal size={18}/></button></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}