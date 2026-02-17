import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios"; 
import toast, { Toaster } from 'react-hot-toast'; 
import "./dashboard.css"; 

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [showActionPanel, setShowActionPanel] = useState(false);
  
  // History Modal State
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  // Modes
  const [panelMode, setPanelMode] = useState("create"); 
  const [actionType, setActionType] = useState("Issue"); 
  const [selectedItem, setSelectedItem] = useState(null);
  
  // UI States
  const [isAddingCategory, setIsAddingCategory] = useState(false); 
  const [newCatName, setNewCatName] = useState("");

  const [formData, setFormData] = useState({
    name: "", category: "", price: "", qty: 1, issuedTo: "",
    vendor: "", invoice: "", warranty: "", condition: "Good", location: ""
  });

  const inputStyle = { 
    width: '100%', padding: '12px', borderRadius: '12px', 
    border: '1px solid #334155', background: '#1e293b', 
    color: '#ffffff', outline: 'none', fontSize: '0.9rem', transition: '0.3s', boxSizing: 'border-box'
  };

  // ✅ 1. FETCH DATA (Strictly Real DB)
  const fetchData = async () => {
    try {
        const [itemsRes, catRes] = await Promise.all([
            api.get("/inventory/"),
            api.get("/inventory/categories/")
        ]);
        setItems(itemsRes.data);
        setCategories(catRes.data);
    } catch (error) {
        console.error("Database Fetch Error:", error);
        // No dummy data fallback anymore
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // --- ACTIONS ---
  const handleDelete = (id) => {
    toast((t) => (
      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
        <span>Confirm Delete? 🗑️</span>
        <button onClick={() => { confirmDelete(id); toast.dismiss(t.id); }} style={{background: '#dc2626', color: 'white', padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem'}}>Delete</button>
        <button onClick={() => toast.dismiss(t.id)} style={{background: '#e2e8f0', color: '#0f172a', padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.8rem'}}>Cancel</button>
      </div>
    ), { duration: 5000, icon: '⚠️' });
  };

  // ✅ 2. DELETE (Real DB Only)
  const confirmDelete = async (id) => {
    try {
        await api.delete(`/inventory/${id}/`);
        toast.success("Item Permanently Deleted!");
        fetchData();
    } catch (err) { 
        toast.error("Delete Failed! Check Server."); 
    }
  };

  const saveNewCategory = async () => {
    if(!newCatName) return toast.error("Enter category name!");
    try {
        const res = await api.post("/inventory/categories/", { name: newCatName });
        setCategories([...categories, res.data]); 
        setFormData({...formData, category: res.data.id}); 
        setIsAddingCategory(false); 
        setNewCatName("");
        toast.success(`Category '${res.data.name}' Added!`);
    } catch (err) { toast.error("Failed to add category"); }
  };

  const handleViewHistory = async (item) => {
    setSelectedItem(item);
    const loadingToast = toast.loading("Fetching Logs...");
    try {
        const res = await api.get(`/inventory/history/${item.id}/`);
        setHistoryLogs(res.data);
        setShowHistoryPanel(true);
        toast.dismiss(loadingToast);
    } catch(err) { 
        toast.dismiss(loadingToast);
        toast.error("Could not fetch history logs.");
    }
  };

  // ✅ 3. SUBMIT (Real DB Only)
  const handleSubmit = async () => {
    const loadingToast = toast.loading("Saving to Database...");
    try {
        if (panelMode === 'create') {
            if (!formData.name || !formData.price || !formData.category) throw new Error("Please fill all fields");
            
            await api.post("/inventory/", {
                name: formData.name,
                category: parseInt(formData.category),
                unit_price: parseFloat(formData.price),
                total_quantity: parseInt(formData.qty),
                available_quantity: parseInt(formData.qty),
                vendor_name: formData.vendor,
                invoice_no: formData.invoice,
                warranty_expiry: formData.warranty || null
            });
            toast.success("New Item Added! 📦", { id: loadingToast });
        } 
        else if (panelMode === 'edit') {
            await api.patch(`/inventory/${selectedItem.id}/`, {
                name: formData.name,
                category: parseInt(formData.category),
                unit_price: parseFloat(formData.price),
                total_quantity: parseInt(formData.qty),
                vendor_name: formData.vendor,
                warranty_expiry: formData.warranty || null
            });
            toast.success("Database Updated! ✏️", { id: loadingToast });
        } 
        else {
            const inputQty = parseInt(formData.qty);
            if(!inputQty || inputQty <= 0) throw new Error("Quantity must be greater than 0");

            if(actionType === 'Issue') {
                if(!formData.issuedTo) throw new Error("Please enter Issued To name");
                if (inputQty > selectedItem.available_quantity) throw new Error(`Out of Stock! Only ${selectedItem.available_quantity} available.`);
            }

            await api.post("/inventory/transaction/", {
                item: selectedItem.id,
                type: actionType,
                quantity: inputQty,
                issued_to: formData.issuedTo,
                condition: formData.condition
            });
            toast.success(`Stock ${actionType} Successful! ✅`, { id: loadingToast });
        }

        setShowActionPanel(false);
        fetchData(); 
        resetForm();

    } catch (error) {
        toast.dismiss(loadingToast);
        toast.error(error.response?.data?.detail || error.message || "Operation Failed");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", category: "", price: "", qty: 1, issuedTo: "", vendor: "", invoice: "", warranty: "", condition: "Good", location: "" });
    setIsAddingCategory(false);
  };

  const openEditPanel = (item) => {
    setSelectedItem(item);
    setPanelMode("edit");
    setFormData({ 
        name: item.name, category: item.category, price: item.unit_price, 
        qty: item.total_quantity, 
        issuedTo: "",
        vendor: item.vendor_name, invoice: item.invoice_no, warranty: item.warranty_expiry, location: ""
    });
    setShowActionPanel(true);
  };

  const openTransactionPanel = (item, type) => {
    setSelectedItem(item);
    setPanelMode("transaction");
    setActionType(type);
    setFormData({ ...formData, qty: 1, issuedTo: "", condition: "Good" });
    setShowActionPanel(true);
  };

  return (
    <div className="inventory-page-wrapper">
      <div className="ambient-bg"></div>
      <SidebarModern />
      <Toaster position="top-center" reverseOrder={false} />

      <div className="inventory-main-content">
        
        <header className="slide-in-down page-header">
          <div>
            <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', margin: 0, color: '#0f172a' }}>Inventory Control</h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500', margin: '5px 0 0' }}>Real-time database connection.</p>
          </div>
          <button className="btn-glow pulse-animation hover-scale-press" onClick={() => { setPanelMode('create'); resetForm(); setShowActionPanel(true); }}>+ New Item Purchase</button>
        </header>

        {/* ALERTS */}
        <div className="stats-grid">
            <div className="stat-card-3d fade-in-up" style={{animationDelay: '0.1s', '--accent': '#f59e0b'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                    <div><span style={{color:'#64748b', fontWeight:'700', fontSize:'0.85rem'}}>LOW STOCK ALERTS</span><h2 style={{color:'#f59e0b', fontSize:'2.5rem', margin: '5px 0', fontWeight: '900'}}>{items.filter(i => i.available_quantity < 5).length}</h2></div>
                    <div className="icon-box-floating" style={{background: '#fffbeb', color: '#f59e0b'}}>⚠️</div>
                </div>
            </div>
            <div className="stat-card-3d fade-in-up" style={{animationDelay: '0.2s', '--accent': '#ef4444'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
                    <div><span style={{color:'#64748b', fontWeight:'700', fontSize:'0.85rem'}}>TOTAL VALUE</span><h2 style={{color:'#3b82f6', fontSize:'2.5rem', margin: '5px 0', fontWeight: '900'}}>₹{(items.reduce((acc, i) => acc + (i.total_quantity * parseFloat(i.unit_price || 0)), 0)/1000).toFixed(1)}k</h2></div>
                    <div className="icon-box-floating" style={{background: '#eff6ff', color: '#3b82f6'}}>💎</div>
                </div>
            </div>
        </div>

        {/* TABLE */}
        <div className="glass-card fade-in-up table-card">
            
            <div className="table-wrapper">
                <table className="modern-table luxe-table">
                    <thead>
                        <tr>
                            <th style={{width: '25%'}}>ITEM & VENDOR</th>
                            <th style={{width: '15%'}}>CATEGORY</th>
                            <th style={{width: '10%'}}>STOCK</th>
                            <th style={{width: '15%'}}>WARRANTY</th>
                            <th style={{width: '35%', textAlign:'right'}}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length === 0 ? (
                            <tr><td colSpan="5" style={{textAlign:'center', padding:'30px', color:'#94a3b8'}}>No items found in database.</td></tr>
                        ) : currentItems.map((item, idx) => {
                            return (
                            <tr key={item.id} className="floating-row-glow" style={{animationDelay: `${idx * 0.05}s`}}>
                                <td>
                                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                        <div style={{width:'35px', height:'35px', borderRadius:'8px', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center'}}>📦</div>
                                        <div>
                                            <b style={{color: '#1e293b', fontSize: '0.95rem'}}>{item.name}</b>
                                            <div style={{fontSize: '0.75rem', color: '#64748b'}}>{item.vendor_name ? `Vendor: ${item.vendor_name}` : `ID: #INV-${item.id}`}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span style={{background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', color: '#475569'}}>{item.category_name || "General"}</span></td>
                                <td><span style={{color: item.available_quantity < 5 ? '#ef4444' : '#10b981', fontWeight: '800'}}>{item.available_quantity}/{item.total_quantity}</span></td>
                                <td>
                                    {item.warranty_expiry ? 
                                        <span style={{fontSize:'0.85rem', fontWeight: '600', color: '#475569'}}>{item.warranty_expiry}</span> 
                                        : <span style={{color:'#cbd5e1'}}>-</span>
                                    }
                                </td>
                                <td style={{textAlign: 'right'}}>
                                    <button className="icon-btn" title="View History" style={{color:'#6366f1', background:'#eef2ff'}} onClick={() => handleViewHistory(item)}>📜</button>
                                    <span style={{margin: '0 8px', color:'#e2e8f0'}}>|</span>
                                    <button className="icon-btn" title="Return" style={{color:'#16a34a', background:'#f0fdf4'}} onClick={() => openTransactionPanel(item, 'Return')}>📥</button>
                                    <button className="icon-btn" title="Issue" style={{color:'#ea580c', background:'#fff7ed'}} onClick={() => openTransactionPanel(item, 'Issue')}>📤</button>
                                    <span style={{margin: '0 8px', color:'#e2e8f0'}}>|</span>
                                    <button className="icon-btn" title="Edit" style={{color:'#3b82f6', background:'#eff6ff'}} onClick={() => openEditPanel(item)}>✏️</button>
                                    <button className="icon-btn" title="Delete" style={{color:'#dc2626', background:'#fef2f2'}} onClick={() => handleDelete(item.id)}>🗑️</button>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>

            {/* ✅ PAGINATION CONTROLS */}
            {items.length > 0 && (
                <div className="pagination-bar">
                    <button className="page-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>← Prev</button>
                    <span className="page-info">Page <b>{currentPage}</b> of {totalPages}</span>
                    <button className="page-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next →</button>
                </div>
            )}

        </div>

        {/* --- SIDE PANEL --- */}
        {showActionPanel && (
            <div className="overlay-blur" onClick={() => setShowActionPanel(false)}>
                <div className="luxe-panel slide-in-right" onClick={(e) => e.stopPropagation()}>
                    <div className="panel-header-simple" style={{flexShrink: 0}}>
                        <h2 style={{margin: '0 0 5px', color: '#0f172a', fontWeight:'800'}}>
                            {panelMode === 'create' ? 'Add Asset' : panelMode === 'edit' ? 'Edit Asset' : `${actionType} Stock`}
                        </h2>
                        <button className="close-circle-btn hover-rotate" onClick={() => setShowActionPanel(false)}>✕</button>
                    </div>
                    
                    <div className="panel-content-scroll" style={{marginTop: '20px', flex: 1, overflowY: 'auto'}}>
                        
                        {(panelMode === 'create' || panelMode === 'edit') && (
                            <>
                                <div className="input-group"><label>Item Name</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} /></div>
                                
                                <div className="grid-2-col">
                                    <div className="input-group"><label>Vendor Name</label><input type="text" placeholder="e.g. Dell Store" value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} style={inputStyle} /></div>
                                    <div className="input-group"><label>Invoice No</label><input type="text" placeholder="INV-001" value={formData.invoice} onChange={e => setFormData({...formData, invoice: e.target.value})} style={inputStyle} /></div>
                                </div>

                                <div className="grid-2-col">
                                    <div className="input-group">
                                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                                            <label style={{margin:0}}>Category</label>
                                            {!isAddingCategory ? <span style={{fontSize:'0.75rem', color:'#3b82f6', cursor:'pointer', fontWeight:'700'}} onClick={() => setIsAddingCategory(true)}>+ Add New</span> : <span style={{fontSize:'0.75rem', color:'#ef4444', cursor:'pointer', fontWeight:'700'}} onClick={() => setIsAddingCategory(false)}>✕ Cancel</span>}
                                        </div>
                                        {!isAddingCategory ? (
                                            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={inputStyle}>
                                                <option value="">Select...</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                            </select>
                                        ) : (
                                            <div style={{display:'flex', gap:'5px'}}><input type="text" placeholder="New Category" value={newCatName} onChange={e => setNewCatName(e.target.value)} style={inputStyle} autoFocus /><button onClick={saveNewCategory} style={{background:'#10b981', border:'none', borderRadius:'10px', color:'white', width:'40px', cursor:'pointer'}}>✓</button></div>
                                        )}
                                    </div>
                                    <div className="input-group"><label>Warranty Expiry</label><input type="date" value={formData.warranty} onChange={e => setFormData({...formData, warranty: e.target.value})} style={inputStyle} /></div>
                                </div>
                                
                                <div className="grid-2-col">
                                    <div className="input-group"><label>Unit Price (₹)</label><input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={inputStyle} /></div>
                                    
                                    {/* ✅ STOCK EDIT FIELD (Available in both Create & Edit) */}
                                    <div className="input-group">
                                        <label>Total Quantity</label>
                                        <input type="number" value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} style={inputStyle} />
                                    </div>
                                </div>

                                <div className="input-group"><label>Location / Room No</label><input type="text" placeholder="e.g. Lab 1, Store Room A" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} style={inputStyle} /></div>
                            </>
                        )}

                        {panelMode === 'transaction' && (
                            <>
                                <div style={{background: actionType==='Issue'?'#fef2f2':'#f0fdf4', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: `1px solid ${actionType==='Issue'?'#fca5a5':'#bbf7d0'}`}}>
                                    <h4 style={{margin: 0, color: actionType==='Issue'?'#991b1b':'#166534'}}>Current Stock: {selectedItem.available_quantity}</h4>
                                </div>
                                <div className="input-group"><label>Quantity</label><input type="number" style={inputStyle} value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} /></div>
                                {actionType === 'Issue' && <div className="input-group" style={{marginTop: '15px'}}><label>Issued To (Name)</label><input type="text" style={inputStyle} value={formData.issuedTo} onChange={e => setFormData({...formData, issuedTo: e.target.value})} /></div>}
                                
                                {actionType === 'Return' && (
                                    <div className="input-group" style={{marginTop: '15px'}}>
                                        <label style={{display: 'block', marginBottom: '8px', fontWeight: '700', color: '#64748b'}}>Condition</label>
                                        <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} style={inputStyle}>
                                            <option value="Good">Good</option>
                                            <option value="Damaged">Damaged (Log Damage)</option>
                                        </select>
                                    </div>
                                )}
                            </>
                        )}

                        <button className="btn-confirm-gradient hover-lift" onClick={handleSubmit} style={{width: '100%', padding: '16px', fontSize: '1rem', marginTop:'30px', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', flexShrink: 0}}>
                            {panelMode === 'create' ? 'Save Asset' : panelMode === 'edit' ? 'Update Details' : 'Confirm'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- HISTORY MODAL --- */}
        {showHistoryPanel && selectedItem && (
            <div className="overlay-blur centered-flex" onClick={() => setShowHistoryPanel(false)}>
                <div className="glass-card history-modal" onClick={e => e.stopPropagation()}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', flexShrink: 0}}>
                        <div>
                            <h2 style={{margin:0, color:'#0f172a'}}>History Log</h2>
                            <p style={{margin:0, color:'#64748b', fontSize:'0.9rem'}}>Item: {selectedItem.name}</p>
                        </div>
                        <button className="close-circle-btn" onClick={() => setShowHistoryPanel(false)}>✕</button>
                    </div>
                    
                    <div style={{overflowY:'auto', flex:1}}>
                        <table style={{width:'100%', borderCollapse:'collapse'}}>
                            <thead>
                                <tr style={{textAlign:'left', borderBottom:'2px solid #f1f5f9', color:'#94a3b8', fontSize:'0.8rem'}}>
                                    <th style={{padding:'10px'}}>DATE</th>
                                    <th>TYPE</th>
                                    <th>QTY</th>
                                    <th>DETAILS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyLogs.length === 0 ? <tr><td colSpan="4" style={{textAlign:'center', padding:'20px', color:'#cbd5e1'}}>No history available in database.</td></tr> : 
                                historyLogs.map(log => (
                                    <tr key={log.id} style={{borderBottom:'1px solid #f8fafc'}}>
                                        <td style={{padding:'12px', fontSize:'0.85rem', color:'#64748b', whiteSpace: 'nowrap'}}>{log.formatted_date}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700',
                                                background: log.type === 'Issue' ? '#fff7ed' : log.type === 'Return' ? '#f0fdf4' : '#eff6ff',
                                                color: log.type === 'Issue' ? '#ea580c' : log.type === 'Return' ? '#16a34a' : '#3b82f6'
                                            }}>{log.type}</span>
                                        </td>
                                        <td style={{fontWeight:'bold', color:'#334155'}}>{log.quantity}</td>
                                        <td style={{fontSize:'0.85rem', color:'#475569', whiteSpace: 'nowrap'}}>
                                            {log.issued_to ? `User: ${log.issued_to}` : '-'}
                                            {log.condition === 'Damaged' && <span style={{color:'#ef4444', marginLeft:'5px', fontWeight:'700'}}>(DAMAGED)</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

      </div>
      
      {/* 🚀 CSS FOR 100% RESPONSIVENESS AND TABLE HORIZONTAL SCROLL */}
      <style>{`
        /* Avoid Body scroll locking globally */
        html, body, #root { margin: 0; padding: 0; height: 100%; }

        .inventory-page-wrapper {
            display: flex;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background: #f8fafc;
            font-family: 'Inter', sans-serif;
        }

        .inventory-main-content {
            flex: 1;
            margin-left: 280px; 
            padding: 30px;
            padding-bottom: 120px !important; /* Prevents Chatbot overlap on desktop */
            height: 100vh;
            overflow-y: auto !important; /* Desktop Scroll Guarantee */
            box-sizing: border-box;
            max-width: calc(100% - 280px);
            position: relative;
            z-index: 1;
        }

        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 35px; flex-shrink: 0; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; width: 100%; }
        
        .table-card { flex: 1; background: white; padding: 25px; border-radius: 24px; display: flex; flex-direction: column; justify-content: space-between; }

        /* ✅ TABLE HORIZONTAL SCROLL FIX */
        .table-wrapper {
            overflow-x: auto;
            width: 100%;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 10px;
        }
        
        .modern-table { width: 100%; border-collapse: collapse; min-width: 800px; }

        /* Pagination Styles */
        .pagination-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
        .page-info { color: #64748b; font-size: 0.9rem; }
        .page-btn { background: #fff; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 10px; cursor: pointer; transition: 0.2s; color: #334155; font-weight: 600; font-size: 0.85rem; }
        .page-btn:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .icon-btn { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin-left: 6px; transition: 0.2s; font-size: 0.95rem; }
        .icon-btn:hover { transform: scale(1.1); filter: brightness(0.95); }
        .centered-flex { display: flex; align-items: center; justify-content: center; }
        
        @keyframes slideInDown { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes bounceInGlass { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes checkPop { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
        @keyframes pulseBlue { 0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 70% { box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); } 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); } }
        @keyframes floatIcon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        .slide-in-down { animation: slideInDown 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .fade-in-up { animation: fadeUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .slide-in-right { animation: slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .bounce-in-glass { animation: bounceInGlass 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .pulse-animation { animation: pulseBlue 2s infinite; }

        .stat-card-3d { width: 100%; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); padding: 25px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1); transition: all 0.3s ease; position: relative; overflow: hidden; box-sizing: border-box; }
        .stat-card-3d:hover { transform: translateY(-10px) perspective(1000px) rotateX(2deg) rotateY(2deg); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); }
        .icon-box-floating { width: 60px; height: 60px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; animation: floatIcon 4s ease-in-out infinite; }
        
        .glass-card { background: white; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .modern-table th { color: #94a3b8; font-size: 0.75rem; letter-spacing: 1px; text-align: left; padding: 20px; font-weight: 700; white-space: nowrap; }
        .floating-row-glow { transition: all 0.2s ease; }
        .floating-row-glow:hover { transform: translateY(-3px); background: #f8fafc; }
        .floating-row-glow td { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
        
        .overlay-blur { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: flex-end; }
        .luxe-panel { width: 450px; height: 100%; background: white; padding: 35px; display: flex; flex-direction: column; box-shadow: -20px 0 60px rgba(0,0,0,0.15); box-sizing: border-box; }
        .close-circle-btn { width: 36px; height: 36px; border-radius: 50%; background: #f1f5f9; border: none; cursor: pointer; color: #64748b; font-size: 1rem; flex-shrink: 0; }
        
        .btn-confirm-gradient { background: linear-gradient(135deg, #0f172a 0%, #334155 100%); color: white; border-radius: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2); }
        .btn-glow { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border: none; color: white; padding: 10px 22px; border-radius: 50px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 15px rgba(99, 102, 241, 0.25); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; white-space: nowrap; }
        .input-group label { display: block; font-size: 0.85rem; color: #64748b; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.3px; }
        .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; width: 100%; }

        /* History Modal Fix */
        .history-modal { width: 600px; height: 500px; max-width: 90vw; max-height: 90vh; background: white; padding: 30px; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; box-sizing: border-box; }

        /* 📱 RESPONSIVE MEDIA QUERIES */
        @media (max-width: 1024px) {
            .inventory-main-content { margin-left: 0 !important; max-width: 100%; width: 100%; }
        }

        @media (max-width: 850px) {
            /* Unlock Scroll on Mobile completely */
            html, body, #root { height: auto !important; min-height: 100vh !important; overflow-y: visible !important; }
            
            .inventory-page-wrapper {
                display: block !important; 
                height: auto !important;
                min-height: 100vh !important;
            }

            .inventory-main-content {
                margin-left: 0 !important;
                padding: 15px !important;
                padding-top: 85px !important; 
                padding-bottom: 160px !important; /* Space for chatbot */
                width: 100vw !important;
                max-width: 100vw !important;
                height: auto !important;
                min-height: 100vh !important;
                overflow: visible !important;
                display: block !important; /* Break Flex lock */
            }

            .page-header { flex-direction: column; align-items: flex-start !important; gap: 15px; }
            .btn-glow { width: 100%; }

            .stats-grid { grid-template-columns: 1fr !important; }
            
            .table-card { padding: 15px !important; }
            
            .grid-2-col { grid-template-columns: 1fr !important; gap: 15px !important; }

            .luxe-panel { width: 100%; padding: 20px; }
            .history-modal { padding: 20px; }
        }
      `}</style>
    </div>
  );
}