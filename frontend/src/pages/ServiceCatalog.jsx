import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  Plus, X, Edit2, Trash2, ToggleLeft, ToggleRight, LayoutGrid, Table2,
  Star, CheckCircle, Loader2, GraduationCap, PlusCircle, Minus,
  Download, RefreshCw, Filter
} from "lucide-react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import SidebarModern from "../components/SidebarModern";

// Register AG Grid modules ONCE at module level
ModuleRegistry.registerModules([AllCommunityModule]);

const SERVICE_TYPE_OPTIONS = [
  { value: "course_access",        label: "Course Access" },
  { value: "assignment_exam_access",label: "Assignment & Exam Access" },
  { value: "exam",                 label: "Exam Access" },
  { value: "hostel",               label: "Hostel Fee" },
  { value: "library",              label: "Library Access" },
  { value: "transport",            label: "Transport Fee" },
  { value: "custom",               label: "Custom Service" },
];

const COLOR_PRESETS = [
  "#4f46e5","#7c3aed","#0ea5e9","#10b981","#f59e0b","#ef4444","#ec4899","#0f172a"
];

const emptyForm = {
  name:"", description:"", service_type:"custom",
  price:"", original_price:"", gst_percentage:"0",
  validity_days:"365", icon:"BookOpen", color:"#4f46e5",
  badge_text:"", is_popular:false, is_active:true, features:[""],
};

// ── Cell Renderers (defined OUTSIDE component for AG Grid v35 stability) ──────

const StatusCellRenderer = ({ value }) => (
  <span style={{display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:20,fontSize:"0.74rem",fontWeight:700,background:value?"#dcfce7":"#fee2e2",color:value?"#16a34a":"#ef4444"}}>
    {value ? "Active" : "Inactive"}
  </span>
);

const PopularCellRenderer = ({ value }) => value
  ? <span style={{display:"inline-flex",alignItems:"center",gap:4,background:"#eef2ff",color:"#4f46e5",padding:"3px 9px",borderRadius:20,fontSize:"0.74rem",fontWeight:800}}>⭐ Popular</span>
  : <span style={{color:"#cbd5e1",fontSize:"0.82rem"}}>—</span>;

const PriceCellRenderer = ({ value }) =>
  value ? <span style={{fontWeight:800,color:"#0f172a"}}>₹{parseFloat(value).toLocaleString("en-IN")}</span>
        : <span style={{color:"#cbd5e1"}}>—</span>;

const OrigPriceCellRenderer = ({ value }) =>
  value ? <span style={{color:"#94a3b8",textDecoration:"line-through"}}>₹{parseFloat(value).toLocaleString("en-IN")}</span>
        : <span style={{color:"#cbd5e1"}}>—</span>;

const ColorCellRenderer = ({ data }) => (
  <div style={{display:"flex",alignItems:"center",gap:7,height:"100%"}}>
    <div style={{width:16,height:16,borderRadius:4,background:data?.color||"#4f46e5",border:"1px solid rgba(0,0,0,0.1)",flexShrink:0}}/>
    <span style={{fontSize:"0.79rem",fontFamily:"monospace",color:"#64748b"}}>{data?.color||"#4f46e5"}</span>
  </div>
);

const BadgeCellRenderer = ({ value }) =>
  value ? <span style={{background:"#fef3c7",color:"#d97706",borderRadius:20,padding:"3px 9px",fontSize:"0.72rem",fontWeight:800}}>{value}</span>
        : <span style={{color:"#cbd5e1"}}>—</span>;

const FeaturesCellRenderer = ({ value }) => (
  <span style={{color:"#475569",fontSize:"0.82rem"}}>{Array.isArray(value)?`${value.length} feature(s)`:"—"}</span>
);

const TypeCellRenderer = ({ value }) => {
  const label = SERVICE_TYPE_OPTIONS.find(o=>o.value===value)?.label || value;
  return <span style={{background:"#f1f5f9",color:"#334155",borderRadius:8,padding:"2px 8px",fontSize:"0.78rem",fontWeight:600}}>{label}</span>;
};

// Actions cell reads callbacks from AG Grid context
const ActionsCellRenderer = ({ data, context }) => {
  if (!data || !context) return null;
  const { onEdit, onToggle, onDelete } = context;
  return (
    <div style={{display:"flex",gap:5,alignItems:"center",height:"100%"}}>
      <button onClick={() => onEdit(data)}
        style={{display:"flex",alignItems:"center",gap:4,background:"#f1f5f9",border:"none",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontWeight:700,fontSize:"0.76rem",color:"#475569"}}>
        <Edit2 size={11}/> Edit
      </button>
      <button onClick={() => onToggle(data)}
        style={{display:"flex",alignItems:"center",gap:4,background:data.is_active?"#dcfce7":"#fee2e2",border:"none",borderRadius:7,padding:"5px 10px",cursor:"pointer",fontWeight:700,fontSize:"0.76rem",color:data.is_active?"#16a34a":"#ef4444"}}>
        {data.is_active ? <ToggleRight size={11}/> : <ToggleLeft size={11}/>}
        {data.is_active ? "Active" : "Inactive"}
      </button>
      <button onClick={() => onDelete(data)}
        style={{background:"#fff1f2",border:"none",borderRadius:7,padding:"6px 8px",cursor:"pointer",display:"flex",alignItems:"center"}}>
        <Trash2 size={11} color="#ef4444"/>
      </button>
    </div>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const labelStyle = {
  display:"block",fontSize:"0.78rem",fontWeight:700,color:"#374151",
  marginBottom:6,textTransform:"uppercase",letterSpacing:"0.4px"
};
const inputStyle = {
  width:"100%",padding:"11px 14px",border:"1.5px solid #e5e7eb",borderRadius:11,
  fontSize:"0.93rem",color:"#111827",background:"white",outline:"none",
  fontWeight:500,boxSizing:"border-box",transition:"border-color 0.2s, box-shadow 0.2s"
};
const focusIn  = e => { e.target.style.borderColor="#4f46e5"; e.target.style.boxShadow="0 0 0 3px rgba(79,70,229,0.12)"; };
const focusOut = e => { e.target.style.borderColor="#e5e7eb"; e.target.style.boxShadow="none"; };

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ServiceCatalog() {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [viewMode, setViewMode] = useState("cards");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const gridRef = useRef(null);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get("payments/services/");
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch { toast.error("Services load nahi huye."); setServices([]); }
    finally { setLoading(false); }
  };

  const openAdd  = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = svc => {
    setForm({
      name: svc.name, description: svc.description||"",
      service_type: svc.service_type, price: svc.price,
      original_price: svc.original_price||"", gst_percentage: svc.gst_percentage||"0",
      validity_days: svc.validity_days||"365", icon: svc.icon||"BookOpen",
      color: svc.color||"#4f46e5", badge_text: svc.badge_text||"",
      is_popular: svc.is_popular||false, is_active: svc.is_active!==false,
      features: svc.features?.length ? svc.features : [""],
    });
    setEditId(svc.id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) { toast.error("Name aur Price required hain."); return; }
    setSaving(true);
    const payload = {
      ...form,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      gst_percentage: parseFloat(form.gst_percentage)||0,
      validity_days: parseInt(form.validity_days)||365,
      features: form.features.filter(f=>f.trim()!==""),
    };
    try {
      if (editId) { await api.put(`payments/services/${editId}/`, payload); toast.success("Updated!"); }
      else        { await api.post("payments/services/", payload);          toast.success("Created!"); }
      setShowForm(false); fetchServices();
    } catch(e) { toast.error(e.response?.data?.detail||"Save failed."); }
    finally { setSaving(false); }
  };

  const handleToggle = async svc => {
    try { await api.post(`payments/services/${svc.id}/toggle/`); fetchServices(); toast.success(`${svc.name} toggled`); }
    catch { toast.error("Toggle failed."); }
  };

  const handleDelete = async svc => {
    if (!window.confirm(`"${svc.name}" delete karna chahte ho?`)) return;
    try { await api.delete(`payments/services/${svc.id}/`); toast.success("Deleted!"); fetchServices(); }
    catch { toast.error("Delete failed."); }
  };

  const addFeature    = () => setForm(f=>({...f, features:[...f.features,""]}));
  const removeFeature = i  => setForm(f=>({...f, features:f.features.filter((_,idx)=>idx!==i)}));
  const updateFeature = (i,v) => setForm(f=>({...f, features:f.features.map((x,idx)=>idx===i?v:x)}));

  const discPct = svc => (svc.original_price && parseFloat(svc.original_price)>parseFloat(svc.price))
    ? Math.round((1-parseFloat(svc.price)/parseFloat(svc.original_price))*100) : null;

  // Pass callbacks via AG Grid context (stable reference via useMemo)
  const gridContext = useMemo(() => ({
    onEdit:   openEdit,
    onToggle: handleToggle,
    onDelete: handleDelete,
  }), []);

  // Column definitions — stable (useMemo)
  const columnDefs = useMemo(() => [
    {
      headerName:"#",
      valueGetter: params => params.node.rowIndex + 1,
      width:55, sortable:false, filter:false, pinned:"left",
      cellStyle:{ color:"#94a3b8", fontWeight:700, fontSize:"0.8rem" }
    },
    {
      field:"name", headerName:"Plan Name",
      flex:1.5, minWidth:160,
      filter:"agTextColumnFilter", floatingFilter:true,
      cellStyle:{ fontWeight:700, color:"#0f172a" }
    },
    {
      field:"service_type", headerName:"Type",
      flex:1, minWidth:150,
      filter:"agTextColumnFilter", floatingFilter:true,
      cellRenderer: TypeCellRenderer,
    },
    {
      field:"price", headerName:"Price (₹)",
      flex:0.8, minWidth:110,
      filter:"agNumberColumnFilter", floatingFilter:true,
      cellRenderer: PriceCellRenderer,
    },
    {
      field:"original_price", headerName:"Orig. Price",
      flex:0.8, minWidth:110,
      filter:"agNumberColumnFilter", floatingFilter:true,
      cellRenderer: OrigPriceCellRenderer,
    },
    {
      field:"gst_percentage", headerName:"GST %",
      width:90,
      filter:"agNumberColumnFilter", floatingFilter:true,
      cellStyle:{ color:"#64748b" }
    },
    {
      field:"validity_days", headerName:"Validity (d)",
      width:110,
      filter:"agNumberColumnFilter", floatingFilter:true,
      cellStyle:{ color:"#64748b" }
    },
    {
      field:"is_active", headerName:"Status",
      width:115,
      filter:"agSetColumnFilter",
      filterParams:{ values:[true,false] },
      floatingFilter:true,
      cellRenderer: StatusCellRenderer,
    },
    {
      field:"is_popular", headerName:"Popular",
      width:115,
      filter:"agSetColumnFilter",
      filterParams:{ values:[true,false] },
      floatingFilter:true,
      cellRenderer: PopularCellRenderer,
    },
    {
      field:"badge_text", headerName:"Badge",
      flex:0.9, minWidth:100,
      filter:"agTextColumnFilter", floatingFilter:true,
      cellRenderer: BadgeCellRenderer,
    },
    {
      field:"color", headerName:"Color",
      width:150, filter:false,
      cellRenderer: ColorCellRenderer,
    },
    {
      field:"features", headerName:"Features",
      width:110, filter:false,
      cellRenderer: FeaturesCellRenderer,
    },
    {
      headerName:"Actions",
      width:250, filter:false, sortable:false,
      pinned:"right",
      cellRenderer: ActionsCellRenderer,
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filterParams: { buttons:["reset","apply"], closeOnApply:true },
  }), []);

  const onExportCSV    = () => gridRef.current?.api?.exportDataAsCsv({ fileName:"service-catalog.csv" });
  const onResetFilters = () => gridRef.current?.api?.setFilterModel(null);

  return (
    <div style={{display:"flex",background:"#f8fafc",minHeight:"100vh",fontFamily:"'Inter',sans-serif"}}>
      <SidebarModern />
      <Toaster position="top-right"/>

      <div style={{flex:1,marginLeft:280,padding:"32px 40px"}}>

        {/* ── Header ── */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}>
          <div>
            <h1 style={{margin:0,fontSize:"1.55rem",fontWeight:900,color:"#0f172a",display:"flex",alignItems:"center",gap:10}}>
              <span style={{background:"linear-gradient(135deg,#4f46e5,#7c3aed)",padding:"6px 10px",borderRadius:12,display:"inline-flex"}}>💳</span>
              Service Catalog
            </h1>
            <p style={{margin:"4px 0 0",color:"#64748b",fontSize:"0.88rem"}}>
              Student subscription plans — price, features, badge sab yahan se manage karo
            </p>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            {/* Cards / Table toggle */}
            <div style={{display:"flex",background:"white",borderRadius:12,padding:4,border:"1px solid #e2e8f0",gap:2}}>
              {[
                { id:"cards", icon:<LayoutGrid size={14}/>, label:"Cards" },
                { id:"table", icon:<Table2 size={14}/>,    label:"Table" },
              ].map(v=>(
                <button key={v.id} onClick={()=>setViewMode(v.id)}
                  style={{display:"flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:9,border:"none",cursor:"pointer",fontWeight:700,fontSize:"0.82rem",background:viewMode===v.id?"#4f46e5":"transparent",color:viewMode===v.id?"white":"#64748b",transition:"all 0.2s"}}>
                  {v.icon} {v.label}
                </button>
              ))}
            </div>

            {viewMode==="table" && (
              <>
                <button onClick={onResetFilters}
                  style={{display:"flex",alignItems:"center",gap:6,background:"white",border:"1.5px solid #e2e8f0",borderRadius:10,padding:"9px 14px",cursor:"pointer",fontWeight:700,fontSize:"0.82rem",color:"#64748b"}}>
                  <Filter size={14}/> Reset Filters
                </button>
                <button onClick={onExportCSV}
                  style={{display:"flex",alignItems:"center",gap:6,background:"white",border:"1.5px solid #e2e8f0",borderRadius:10,padding:"9px 14px",cursor:"pointer",fontWeight:700,fontSize:"0.82rem",color:"#64748b"}}>
                  <Download size={14}/> Export CSV
                </button>
              </>
            )}

            <button onClick={fetchServices}
              style={{background:"white",border:"1.5px solid #e2e8f0",borderRadius:10,padding:"9px 12px",cursor:"pointer",display:"flex",alignItems:"center"}}>
              <RefreshCw size={16} color="#64748b"/>
            </button>

            <motion.button whileTap={{scale:0.96}} onClick={openAdd}
              style={{display:"flex",alignItems:"center",gap:8,background:"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"white",border:"none",borderRadius:12,padding:"11px 20px",fontWeight:800,fontSize:"0.9rem",cursor:"pointer",boxShadow:"0 4px 16px rgba(79,70,229,0.35)"}}>
              <Plus size={18}/> Add Service Plan
            </motion.button>
          </div>
        </div>

        {/* ── Summary Pills ── */}
        <div style={{display:"flex",gap:10,marginBottom:22,flexWrap:"wrap"}}>
          {[
            { label:"Total",    value:services.length,                         color:"#4f46e5", bg:"#eef2ff" },
            { label:"Active",   value:services.filter(s=>s.is_active).length,  color:"#16a34a", bg:"#dcfce7" },
            { label:"Inactive", value:services.filter(s=>!s.is_active).length, color:"#ef4444", bg:"#fee2e2" },
            { label:"Popular",  value:services.filter(s=>s.is_popular).length, color:"#f59e0b", bg:"#fef3c7" },
          ].map(p=>(
            <div key={p.label} style={{background:p.bg,borderRadius:12,padding:"7px 15px",display:"flex",alignItems:"center",gap:7}}>
              <span style={{fontSize:"1.15rem",fontWeight:900,color:p.color}}>{p.value}</span>
              <span style={{fontSize:"0.8rem",fontWeight:600,color:p.color}}>{p.label}</span>
            </div>
          ))}
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div style={{textAlign:"center",padding:80}}>
            <Loader2 size={36} color="#4f46e5" style={{animation:"spin 1s linear infinite"}}/>
          </div>
        ) : services.length===0 ? (
          <div style={{textAlign:"center",padding:80,color:"#94a3b8"}}>
            <GraduationCap size={56} style={{marginBottom:16,opacity:0.3}}/>
            <h3 style={{margin:"0 0 8px"}}>Koi service nahi hai</h3>
            <p style={{margin:0}}>+ Add Service Plan click karo</p>
          </div>

        ) : viewMode==="cards" ? (
          /* ── CARDS VIEW ── */
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}}>
            {services.map(svc => {
              const disc = discPct(svc);
              return (
                <motion.div key={svc.id} whileHover={{y:-4,boxShadow:"0 20px 50px rgba(0,0,0,0.1)"}}
                  style={{background:"white",borderRadius:20,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.05)",border:svc.is_popular?`2px solid ${svc.color||"#4f46e5"}`:"1.5px solid #e2e8f0",position:"relative"}}>
                  <div style={{height:5,background:svc.color||"#4f46e5"}}/>
                  <div style={{position:"absolute",top:14,right:14,display:"flex",flexDirection:"column",gap:5,alignItems:"flex-end"}}>
                    {svc.is_popular && <span style={{background:svc.color||"#4f46e5",color:"white",borderRadius:20,padding:"3px 9px",fontSize:"0.68rem",fontWeight:800,letterSpacing:1}}>MOST POPULAR</span>}
                    {disc && <span style={{background:"#fef3c7",color:"#d97706",borderRadius:20,padding:"3px 9px",fontSize:"0.7rem",fontWeight:800}}>{disc}% OFF</span>}
                    {svc.badge_text && !disc && <span style={{background:"#f0fdf4",color:"#16a34a",borderRadius:20,padding:"3px 9px",fontSize:"0.7rem",fontWeight:800}}>{svc.badge_text}</span>}
                    {!svc.is_active && <span style={{background:"#fee2e2",color:"#ef4444",borderRadius:20,padding:"3px 9px",fontSize:"0.68rem",fontWeight:800}}>INACTIVE</span>}
                  </div>
                  <div style={{padding:"18px 22px 22px"}}>
                    <h3 style={{margin:"0 0 3px",fontSize:"1.05rem",fontWeight:800,color:"#0f172a"}}>{svc.name}</h3>
                    <p style={{margin:"0 0 12px",fontSize:"0.8rem",color:"#64748b",lineHeight:1.5}}>{svc.description}</p>
                    <div style={{marginBottom:12}}>
                      {svc.original_price && <span style={{fontSize:"0.85rem",color:"#94a3b8",textDecoration:"line-through",marginRight:6}}>₹{parseFloat(svc.original_price).toLocaleString("en-IN")}</span>}
                      <span style={{fontSize:"1.7rem",fontWeight:900,color:"#0f172a"}}>₹{parseFloat(svc.price).toLocaleString("en-IN")}</span>
                      <span style={{fontSize:"0.8rem",color:"#94a3b8",marginLeft:4}}>/{svc.validity_days}d</span>
                    </div>
                    {svc.features?.length>0 && (
                      <ul style={{margin:"0 0 14px",padding:0,listStyle:"none",display:"flex",flexDirection:"column",gap:5}}>
                        {svc.features.slice(0,4).map((f,i)=>(
                          <li key={i} style={{display:"flex",alignItems:"center",gap:7,fontSize:"0.82rem",color:"#374151"}}>
                            <CheckCircle size={12} color={svc.color||"#4f46e5"} style={{flexShrink:0}}/> {f}
                          </li>
                        ))}
                        {svc.features.length>4 && <li style={{fontSize:"0.75rem",color:"#94a3b8"}}>+{svc.features.length-4} more</li>}
                      </ul>
                    )}
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>openEdit(svc)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"9px",background:"#f1f5f9",border:"none",borderRadius:9,fontWeight:700,fontSize:"0.8rem",cursor:"pointer",color:"#475569"}}>
                        <Edit2 size={12}/> Edit
                      </button>
                      <button onClick={()=>handleToggle(svc)} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"9px",background:svc.is_active?"#dcfce7":"#fee2e2",border:"none",borderRadius:9,fontWeight:700,fontSize:"0.8rem",cursor:"pointer",color:svc.is_active?"#16a34a":"#ef4444"}}>
                        {svc.is_active?<ToggleRight size={12}/>:<ToggleLeft size={12}/>} {svc.is_active?"Active":"Inactive"}
                      </button>
                      <button onClick={()=>handleDelete(svc)} style={{padding:"9px 11px",background:"#fff1f2",border:"none",borderRadius:9,cursor:"pointer",display:"flex",alignItems:"center"}}>
                        <Trash2 size={12} color="#ef4444"/>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        ) : (
          /* ── TABLE VIEW (AG Grid v35) ── */
          <div style={{background:"white",borderRadius:16,boxShadow:"0 4px 20px rgba(0,0,0,0.06)",border:"1px solid #e2e8f0",overflow:"hidden"}}>
            <div style={{padding:"12px 20px",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fafafa"}}>
              <span style={{fontWeight:700,color:"#64748b",fontSize:"0.84rem",display:"flex",alignItems:"center",gap:7}}>
                <Table2 size={15} color="#4f46e5"/>
                {services.length} plans found
              </span>
              <span style={{fontSize:"0.77rem",color:"#94a3b8"}}>
                Column header ▼ funnel icon → Filter karo
              </span>
            </div>
            <div className="ag-theme-alpine" style={{width:"100%",height:"560px"}}>
              <AgGridReact
                ref={gridRef}
                rowData={services}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                context={gridContext}
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 20, 50]}
                rowHeight={52}
                headerHeight={48}
                floatingFiltersHeight={40}
                animateRows={true}
                suppressRowClickSelection={true}
                overlayNoRowsTemplate='<span style="color:#94a3b8;font-weight:600;">Koi service nahi mili</span>'
              />
            </div>
          </div>
        )}
      </div>

      {/* ── ADD / EDIT FORM MODAL ── */}
      <AnimatePresence>
        {showForm && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20}}>
            <motion.div initial={{scale:0.88,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.88,opacity:0}}
              style={{background:"white",borderRadius:24,width:"100%",maxWidth:620,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 30px 80px rgba(0,0,0,0.25)"}}>

              <div style={{padding:"22px 26px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"white",zIndex:2,borderBottom:"1px solid #f1f5f9"}}>
                <h2 style={{margin:0,fontSize:"1.2rem",fontWeight:900,color:"#0f172a"}}>
                  {editId ? "✏️ Edit Plan" : "➕ New Service Plan"}
                </h2>
                <button onClick={()=>setShowForm(false)} style={{background:"#f1f5f9",border:"none",borderRadius:10,padding:8,cursor:"pointer"}}>
                  <X size={20} color="#64748b"/>
                </button>
              </div>

              <div style={{padding:"22px 26px 26px",display:"flex",flexDirection:"column",gap:16}}>
                <div>
                  <label style={labelStyle}>Plan Name *</label>
                  <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Course Access Premium" style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Is plan mein kya milega..." rows={2} style={{...inputStyle,resize:"vertical",minHeight:56}} onFocus={focusIn} onBlur={focusOut}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <div>
                    <label style={labelStyle}>Service Type</label>
                    <select value={form.service_type} onChange={e=>setForm({...form,service_type:e.target.value})} style={inputStyle}>
                      {SERVICE_TYPE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Validity (days)</label>
                    <input type="number" value={form.validity_days} onChange={e=>setForm({...form,validity_days:e.target.value})} placeholder="365" style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <div>
                    <label style={labelStyle}>Price (₹) *</label>
                    <input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="2999" style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Original Price (₹) <span style={{color:"#94a3b8",fontWeight:400,textTransform:"none"}}>(strikethrough)</span></label>
                    <input type="number" value={form.original_price} onChange={e=>setForm({...form,original_price:e.target.value})} placeholder="5999" style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <div>
                    <label style={labelStyle}>GST %</label>
                    <input type="number" value={form.gst_percentage} onChange={e=>setForm({...form,gst_percentage:e.target.value})} placeholder="18" style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Badge Text</label>
                    <input value={form.badge_text} onChange={e=>setForm({...form,badge_text:e.target.value})} placeholder="Best Value" style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                  </div>
                </div>
                {/* Color Picker */}
                <div>
                  <label style={labelStyle}>Card Color</label>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    {COLOR_PRESETS.map(c=>(
                      <button key={c} onClick={()=>setForm({...form,color:c})}
                        style={{width:30,height:30,borderRadius:8,background:c,border:form.color===c?"3px solid #0f172a":"3px solid transparent",cursor:"pointer",flexShrink:0}}/>
                    ))}
                    <input type="color" value={form.color} onChange={e=>setForm({...form,color:e.target.value})} style={{width:34,height:34,borderRadius:8,border:"none",cursor:"pointer",padding:2}}/>
                    <span style={{fontSize:"0.82rem",color:"#64748b",fontFamily:"monospace"}}>{form.color}</span>
                  </div>
                </div>
                {/* Toggles */}
                <div style={{display:"flex",gap:12}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",background:form.is_popular?"#eef2ff":"#f8fafc",padding:"11px 14px",borderRadius:11,border:`1.5px solid ${form.is_popular?"#818cf8":"#e2e8f0"}`,flex:1}}>
                    <input type="checkbox" checked={form.is_popular} onChange={e=>setForm({...form,is_popular:e.target.checked})} style={{accentColor:"#4f46e5",width:15,height:15}}/>
                    <span style={{fontWeight:700,color:form.is_popular?"#4f46e5":"#64748b",fontSize:"0.85rem"}}>⭐ Most Popular</span>
                  </label>
                  <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",background:form.is_active?"#f0fdf4":"#fff1f2",padding:"11px 14px",borderRadius:11,border:`1.5px solid ${form.is_active?"#86efac":"#fca5a5"}`,flex:1}}>
                    <input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})} style={{accentColor:"#16a34a",width:15,height:15}}/>
                    <span style={{fontWeight:700,color:form.is_active?"#16a34a":"#ef4444",fontSize:"0.85rem"}}>✅ Active (visible to students)</span>
                  </label>
                </div>
                {/* Features */}
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <label style={labelStyle}>Features List</label>
                    <button onClick={addFeature} style={{display:"flex",alignItems:"center",gap:5,background:"#eef2ff",color:"#4f46e5",border:"none",borderRadius:8,padding:"5px 11px",fontWeight:700,fontSize:"0.79rem",cursor:"pointer"}}>
                      <PlusCircle size={13}/> Add
                    </button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:7}}>
                    {form.features.map((feat,i)=>(
                      <div key={i} style={{display:"flex",gap:7,alignItems:"center"}}>
                        <CheckCircle size={14} color="#4f46e5" style={{flexShrink:0}}/>
                        <input value={feat} onChange={e=>updateFeature(i,e.target.value)} placeholder={`Feature ${i+1}`} style={{...inputStyle,flex:1,margin:0}} onFocus={focusIn} onBlur={focusOut}/>
                        {form.features.length>1 && (
                          <button onClick={()=>removeFeature(i)} style={{background:"#fee2e2",border:"none",borderRadius:8,padding:"7px",cursor:"pointer",display:"flex"}}>
                            <Minus size={13} color="#ef4444"/>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Live Preview */}
                <div style={{background:"#f8fafc",borderRadius:12,padding:14,border:"1px dashed #e2e8f0"}}>
                  <p style={{margin:"0 0 8px",fontSize:"0.72rem",fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1}}>Live Preview</p>
                  <div style={{background:"white",borderRadius:12,border:`2px solid ${form.color}`,overflow:"hidden",maxWidth:260}}>
                    <div style={{height:4,background:form.color}}/>
                    <div style={{padding:"12px 14px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                        <strong style={{fontSize:"0.9rem",color:"#0f172a"}}>{form.name||"Plan Name"}</strong>
                        {form.is_popular && <span style={{background:form.color,color:"white",borderRadius:20,padding:"2px 7px",fontSize:"0.62rem",fontWeight:800}}>POPULAR</span>}
                      </div>
                      <div style={{marginBottom:6}}>
                        {form.original_price && <span style={{fontSize:"0.78rem",color:"#94a3b8",textDecoration:"line-through",marginRight:5}}>₹{form.original_price}</span>}
                        <span style={{fontSize:"1.3rem",fontWeight:900}}>₹{form.price||"0"}</span>
                        <span style={{fontSize:"0.72rem",color:"#94a3b8"}}> /{form.validity_days}d</span>
                      </div>
                      {form.features.filter(f=>f.trim()).slice(0,3).map((f,i)=>(
                        <div key={i} style={{fontSize:"0.74rem",color:"#374151",display:"flex",alignItems:"center",gap:4,marginBottom:3}}>
                          <CheckCircle size={10} color={form.color}/> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Save Button */}
                <motion.button whileTap={{scale:0.97}} onClick={handleSave} disabled={saving}
                  style={{height:50,background:saving?"#a5b4fc":"linear-gradient(135deg,#4f46e5,#7c3aed)",color:"white",border:"none",borderRadius:13,fontWeight:800,fontSize:"1rem",cursor:saving?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:"0 4px 16px rgba(79,70,229,0.35)"}}>
                  {saving && <Loader2 size={19} style={{animation:"spin 1s linear infinite"}}/>}
                  {saving ? "Saving..." : editId ? "Update Plan" : "Create Plan"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .ag-theme-alpine {
          --ag-header-background-color: #f8fafc;
          --ag-odd-row-background-color: #fafafa;
          --ag-row-hover-color: #f5f3ff;
          --ag-selected-row-background-color: #eef2ff;
          --ag-border-color: #e2e8f0;
          --ag-header-foreground-color: #374151;
          --ag-font-family: 'Inter', sans-serif;
          --ag-font-size: 13px;
          --ag-row-border-color: #f1f5f9;
        }
        .ag-theme-alpine .ag-header-cell-label {
          font-weight: 800;
          font-size: 0.76rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .ag-theme-alpine .ag-floating-filter-input {
          border-radius: 6px !important;
          font-size: 0.82rem !important;
        }
        .ag-theme-alpine .ag-paging-panel {
          border-top: 1px solid #e2e8f0;
          padding: 10px 20px;
          font-weight: 600;
          font-size: 0.82rem;
          color: #475569;
        }
        .ag-theme-alpine .ag-cell {
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
