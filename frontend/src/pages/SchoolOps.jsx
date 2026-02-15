import React, { useState } from "react";
import SidebarModern from "../components/SidebarModern";
import WeatherWidget from "../components/WeatherWidget"; // Req 0
import { MapPin, Calendar, Clock, Edit3, Save, Trash2, CheckSquare, MoreHorizontal, Filter } from "lucide-react";

export default function SchoolOps() {
  // --- REQ 1: LOCATIONS & VIRTUAL ID ---
  const [loc, setLoc] = useState({ continent: "Asia", country: "India", city: "Meerut" });
  const virtualID = `VID-${loc.country.substring(0,3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(Math.random()*1000)}`;
  
  // --- REQ 3: CALENDAR & TIME ---
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("10:00");

  // --- REQ 2: SMART TABLE DATA ---
  const [records, setRecords] = useState([
      { id: 1, name: "Rahul Sharma", role: "Student", status: "Active" },
      { id: 2, name: "Priya Verma", role: "Teacher", status: "On Leave" },
      { id: 3, name: "Amit Singh", role: "Admin", status: "Active" },
  ]);
  const [selected, setSelected] = useState([]);

  // --- REQ 3: EDITOR (Simple Simulation) ---
  const [editorText, setEditorText] = useState("<b>Notice:</b> Exams starting next week.");

  // Bulk Actions
  const toggleSelect = (id) => {
      if(selected.includes(id)) setSelected(selected.filter(i => i !== id));
      else setSelected([...selected, id]);
  };

  return (
    <div style={{display: "flex", background: "#f8fafc", minHeight: "100vh"}}>
        <SidebarModern />
        <div style={{flex: 1, padding: "30px", marginLeft: "280px"}}>
            
            {/* REQ 0: WEATHER */}
            <div style={{marginBottom: "20px"}}><WeatherWidget /></div>

            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginBottom: "30px"}}>
                
                {/* REQ 1: LOCATION & VIRTUAL ID */}
                <div style={{background: "white", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)"}}>
                    <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:'10px'}}><MapPin size={20} color="#3b82f6"/> Geo-Location & ID</h3>
                    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "15px"}}>
                        <select className="modern-input" value={loc.continent} onChange={e=>setLoc({...loc, continent:e.target.value})}><option>Asia</option><option>Europe</option></select>
                        <select className="modern-input" value={loc.country} onChange={e=>setLoc({...loc, country:e.target.value})}><option>India</option><option>USA</option></select>
                        <select className="modern-input" value={loc.city} onChange={e=>setLoc({...loc, city:e.target.value})}><option>Meerut</option><option>Delhi</option></select>
                    </div>
                    <div style={{background: "#eff6ff", padding: "15px", borderRadius: "10px", border: "1px dashed #3b82f6"}}>
                        <small style={{color: "#64748b", fontWeight: "bold"}}>GENERATED VIRTUAL ID</small>
                        <div style={{fontSize: "1.4rem", fontWeight: "900", color: "#1e40af", fontFamily: "monospace"}}>{virtualID}</div>
                        <div style={{fontSize: "0.8rem", color: "#60a5fa"}}>Lat: 28.9845 N | Long: 77.7064 E</div>
                    </div>
                </div>

                {/* REQ 3: CALENDAR & EDITOR */}
                <div style={{background: "white", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)"}}>
                    <h3 style={{marginTop:0, display:'flex', alignItems:'center', gap:'10px'}}><Calendar size={20} color="#8b5cf6"/> Scheduler & Editor</h3>
                    <div style={{display: "flex", gap: "10px", marginBottom: "15px"}}>
                        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="modern-input" />
                        <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="modern-input" />
                    </div>
                    <div style={{border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px"}}>
                        <div style={{display: "flex", gap: "10px", marginBottom: "10px", borderBottom: "1px solid #f1f5f9", paddingBottom: "5px"}}>
                            <button className="editor-btn"><b>B</b></button>
                            <button className="editor-btn"><i>I</i></button>
                            <button className="editor-btn"><u>U</u></button>
                        </div>
                        <textarea className="editor-area" value={editorText} onChange={e=>setEditorText(e.target.value)} rows="3"></textarea>
                    </div>
                </div>
            </div>

            {/* REQ 2: CHECKBOXES & BULK ACTIONS */}
            <div style={{background: "white", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)"}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
                    <h3 style={{margin:0}}>Records Database</h3>
                    {selected.length > 0 && <button className="btn-danger"><Trash2 size={16}/> Delete ({selected.length})</button>}
                </div>
                <table style={{width: "100%", borderCollapse: "collapse"}}>
                    <thead style={{background: "#f8fafc"}}>
                        <tr>
                            <th style={{padding: "15px", width: "40px"}}><CheckSquare size={18} color="#64748b"/></th>
                            <th style={{padding: "15px", textAlign: "left"}}>Serial No.</th>
                            <th style={{padding: "15px", textAlign: "left"}}>Name</th>
                            <th style={{padding: "15px", textAlign: "left"}}>Role</th>
                            <th style={{padding: "15px", textAlign: "left"}}>Status</th>
                            <th style={{padding: "15px", textAlign: "right"}}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((r, i) => (
                            <tr key={r.id} style={{borderBottom: "1px solid #f1f5f9"}}>
                                <td style={{padding: "15px"}}><input type="checkbox" checked={selected.includes(r.id)} onChange={()=>toggleSelect(r.id)} style={{width: "16px", height: "16px"}}/></td>
                                <td style={{padding: "15px"}}><b>{i+1}</b></td>
                                <td style={{padding: "15px"}}>{r.name}</td>
                                <td style={{padding: "15px"}}><span className="role-tag">{r.role}</span></td>
                                <td style={{padding: "15px"}}><span style={{color: r.status==='Active'?'green':'orange'}}>â— {r.status}</span></td>
                                <td style={{padding: "15px", textAlign: "right"}}><MoreHorizontal size={18} color="#94a3b8"/></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .modern-input { width: 100%; padding: 10px; border: 1px solid #cbd5e1; borderRadius: 8px; outline: none; font-weight: 600; }
                .editor-btn { background: #f1f5f9; border: none; padding: 5px 10px; borderRadius: 5px; cursor: pointer; font-weight: bold; }
                .editor-area { width: 100%; border: none; outline: none; font-family: sans-serif; resize: none; }
                .role-tag { background: #eef2ff; color: #6366f1; padding: 4px 10px; borderRadius: 20px; font-size: 0.8rem; fontWeight: 700; }
                .btn-danger { background: #fee2e2; color: #ef4444; border: none; padding: 8px 16px; borderRadius: 8px; fontWeight: 700; display: flex; alignItems: center; gap: 5px; cursor: pointer; }
            `}</style>
        </div>
    </div>
  );
}