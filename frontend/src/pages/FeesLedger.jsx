import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import "./dashboard.css"; 
import toast, { Toaster } from 'react-hot-toast'; 
import api from "../api/axios"; // ✅ Import API instance
import { ChevronLeft, ChevronRight } from "lucide-react"; // Import Icons

export default function FeesLedger() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("All");
  
  // Panel States
  const [activePanel, setActivePanel] = useState("none"); 
  const [selectedTxn, setSelectedTxn] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Adjust items per page

  // Notification States
  const [showSuccess, setShowSuccess] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  // Fee Structure
  const feeStructure = {
    "10-A": { tuition: 5000, transport: 2000, library: 500, exam: 1000 },
    "10-B": { tuition: 5000, transport: 2000, library: 500, exam: 1000 },
    "12-Science": { tuition: 7500, transport: 2500, library: 1000, exam: 1500 },
    "12-Commerce": { tuition: 6500, transport: 2500, library: 800, exam: 1500 }
  };

  const [formData, setFormData] = useState({
    studentName: "", rollNo: "", class: "10-A",
    feeType: "Tuition Fee", amount: "", paymentMode: "Cash", referenceNo: "",
    date: new Date().toISOString().split('T')[0],
    tuitionFee: "", transportFee: "", libraryFee: "", fine: "", discount: "",
    payableAmount: "" // ✅ for pending payment
  });

  // ✅ FETCH TRANSACTIONS FROM DATABASE
  const fetchTransactions = async () => {
      try {
          const res = await api.get('fees/transactions/');
          setTransactions(res.data);
      } catch (error) {
          console.error("Error fetching fees:", error);
          toast.error("Failed to load ledger.");
      }
  };

  useEffect(() => {
      fetchTransactions();
  }, []);

  useEffect(() => {
    if (activePanel === 'collect') {
        const fees = feeStructure[formData.class] || { tuition: 0, transport: 0, library: 0 };
        setFormData(prev => ({
            ...prev,
            tuitionFee: fees.tuition,
            transportFee: fees.transport,
            libraryFee: fees.library,
            fine: 0,
            discount: 0
        }));
    }
  }, [formData.class, activePanel]);

  const filteredData = transactions.filter(t => {
    if (filter === "All") return true;
    if (filter === "Paid") return t.status === "Paid";
    if (filter === "Pending") return t.status === "Pending" || t.status === "Partial";
    if (filter === "Overdue") return t.status === "Overdue";
    return true;
  });

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const nextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

  const totalCollected = transactions.reduce((acc, curr) => acc + curr.paid, 0);
  const totalDue = transactions.reduce((acc, curr) => acc + curr.due, 0);

  const calculateTotal = () => {
    const t = Number(formData.tuitionFee) || 0;
    const tr = Number(formData.transportFee) || 0;
    const l = Number(formData.libraryFee) || 0;
    const f = Number(formData.fine) || 0;
    const d = Number(formData.discount) || 0;
    return (t + tr + l + f) - d;
  };

  // ✅ COLLECT FEE (POST TO DB)
  const handleCollectFee = async () => {
    if(!formData.studentName) return toast.error("Student Name Required");
    const loadId = toast.loading("Processing Transaction...");
    const totalAmount = calculateTotal();

    const newTxn = {
        id: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        student: formData.studentName,
        roll: formData.rollNo || "N/A",
        class: formData.class,
        total: totalAmount,
        paid: totalAmount, 
        due: 0, 
        date: formData.date,
        status: "Paid",
        mode: formData.paymentMode,
        breakdown: {
            tuition: formData.tuitionFee,
            transport: formData.transportFee,
            library: formData.libraryFee,
            fine: formData.fine
        }
    };

    try {
        await api.post('fees/transactions/', newTxn);
        
        await fetchTransactions(); // Refresh Data from DB
        toast.dismiss(loadId);
        setActivePanel("none");
        setNotificationMsg("Fee Collected & Receipt Generated! 🧾");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
        
        setFormData({ studentName: "", rollNo: "", class: "10-A", feeType: "Tuition Fee", amount: "", paymentMode: "Cash", referenceNo: "", date: new Date().toISOString().split('T')[0], tuitionFee: "", transportFee: "", libraryFee: "", fine: "", discount: "", payableAmount: "" });
    } catch (error) {
        toast.dismiss(loadId);
        toast.error("Failed to save transaction.");
        console.error(error);
    }
  };

  const handleViewReceipt = (txn) => {
    setSelectedTxn(txn);
    setActivePanel("receipt");
  };

  // ✅ Open pending payment panel
  const handlePayPending = (txn) => {
    setSelectedTxn(txn);
    setFormData({
      ...formData,
      studentName: txn.student,
      rollNo: txn.roll,
      class: txn.class,
      payableAmount: txn.due,
      paymentMode: txn.mode || "Cash",
      date: new Date().toISOString().split('T')[0]
    });
    setActivePanel("pendingPayment");
  };

  // ✅ PAY PENDING FEE (PATCH TO DB)
  const handleSubmitPendingPayment = async () => {
    const payAmount = Number(formData.payableAmount);
    if (!payAmount || payAmount <= 0) return toast.error("Enter valid amount");
    const loadId = toast.loading("Updating Ledger...");

    try {
        await api.patch('fees/transactions/', {
            id: selectedTxn.id,
            amount_paid: payAmount
        });

        await fetchTransactions(); // Refresh Data
        toast.dismiss(loadId);
        
        setActivePanel("receipt");
        setNotificationMsg("Pending Fee Paid Successfully! 🎉");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
    } catch (error) {
        toast.dismiss(loadId);
        toast.error("Update Failed");
        console.error(error);
    }
  };

  const handlePrint = () => {
      window.print();
  };

  const getStatusColor = (status) => {
    switch(status) {
        case 'Paid': return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };
        case 'Pending': return { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' };
        case 'Partial': return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
        case 'Overdue': return { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' };
        default: return {};
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', outline: 'none', fontSize: '0.9rem', transition: '0.3s', boxSizing: 'border-box'
  };

  return (
    <div className="dashboard-container fees-page-wrapper">
      <div className="ambient-bg"></div>
      <SidebarModern />
      <Toaster position="top-center"/>

      <div className="main-content fees-main-content">
        
        <header className="slide-in-down page-header">
          <div>
            <h1 className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>Finance & Fees</h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500', margin: '5px 0 0' }}>Ledger, Invoices and Defaulter Management.</p>
          </div>
          
          <button className="btn-glow pulse-animation hover-scale-press" onClick={() => setActivePanel("collect")}>
            <span style={{marginRight: '8px', fontSize: '1.2rem'}}>+</span> Collect Fee
          </button>
        </header>

        {/* STATS ROW */}
        <div className="stats-grid" style={{display: 'flex', gap: '25px', marginBottom: '30px', flexShrink: 0, width: '100%'}}>
            <div className="stat-card-3d fade-in-up" style={{animationDelay: '0.1s', '--accent': '#10b981'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center', position: 'relative', zIndex: 2}}>
                    <div><span style={{color:'#64748b', fontWeight:'700', fontSize:'0.85rem', letterSpacing:'1px'}}>TOTAL REVENUE</span><h2 style={{color:'#10b981', fontSize:'2.5rem', margin: '5px 0', fontWeight: '900'}}>₹{totalCollected.toLocaleString()}</h2></div>
                    <div className="icon-box-floating" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}>🏦</div>
                </div>
            </div>
            
            <div className="stat-card-3d fade-in-up" style={{animationDelay: '0.2s', '--accent': '#ef4444'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center', position: 'relative', zIndex: 2}}>
                    <div><span style={{color:'#64748b', fontWeight:'700', fontSize:'0.85rem', letterSpacing:'1px'}}>OUTSTANDING</span><h2 style={{color:'#ef4444', fontSize:'2.5rem', margin: '5px 0', fontWeight: '900'}}>₹{totalDue.toLocaleString()}</h2></div>
                    <div className="icon-box-floating" style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}}>📉</div>
                </div>
            </div>
        </div>

        {/* MAIN LEDGER AREA - FIXED HEIGHT & NO SCROLL */}
        <div className="glass-container fade-in-up table-card">
            
            <div className="filter-tabs">
                {["All", "Paid", "Pending", "Overdue"].map(tab => (
                    <button key={tab} onClick={() => { setFilter(tab); setCurrentPage(1); }} className={`tab-btn-modern ${filter === tab ? 'active' : ''}`}>
                        {tab} {tab === 'Overdue' && <span style={{marginLeft:'5px', background:'#ef4444', color:'white', padding:'2px 6px', borderRadius:'10px', fontSize:'0.7rem'}}>!</span>}
                    </button>
                ))}
            </div>

            {/* TABLE CONTENT */}
            <div className="table-wrapper">
                <table className="modern-table luxe-table">
                    <thead>
                        <tr>
                            <th style={{width: '15%'}}>RECEIPT #</th>
                            <th style={{width: '20%'}}>STUDENT</th>
                            <th style={{width: '15%'}}>CLASS</th> 
                            <th style={{width: '15%'}}>DATE</th>
                            <th style={{width: '15%'}}>AMOUNT</th>
                            <th style={{width: '12%'}}>STATUS</th>
                            <th style={{width: '8%', textAlign: 'right'}}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((txn, idx) => {
                            const style = getStatusColor(txn.status);
                            return (
                                <tr key={idx} className="floating-row-glow stagger-animation" style={{animationDelay: `${idx * 0.05}s`}}>
                                    <td><span style={{fontWeight:'700', color:'#4f46e5', fontSize:'0.85rem'}}>{txn.id}</span></td>
                                    <td>
                                        <div style={{display:'flex', flexDirection:'column'}}>
                                            <b style={{color: '#1e293b', fontSize: '0.95rem'}}>{txn.student}</b>
                                            <span style={{color: '#64748b', fontSize: '0.8rem'}}>Roll: {txn.roll}</span>
                                        </div>
                                    </td>
                                    <td><span className="badge-gray">{txn.class}</span></td>
                                    <td><span style={{color:'#334155', fontWeight:'600'}}>{txn.date}</span></td>
                                    <td>
                                        <div style={{display:'flex', flexDirection:'column'}}>
                                            <span style={{fontWeight:'700', color: '#0f172a'}}>₹{txn.total.toLocaleString()}</span>
                                            {txn.due > 0 && <span style={{fontSize:'0.75rem', color:'#ef4444'}}>Due: ₹{txn.due}</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-badge-modern" style={{background: style.bg, color: style.text, border: `1px solid ${style.border}`}}>
                                            {txn.status === 'Overdue' && <span style={{marginRight:'4px'}}>⚠️</span>} 
                                            {txn.status}
                                        </span>
                                    </td>
                                    <td style={{textAlign: 'right'}}>
                                        {txn.due > 0 ? (
                                          <button className="btn-action-modern monitor hover-scale-press" onClick={() => handlePayPending(txn)}>Pay Due 💳</button>
                                        ) : (
                                          <button className="btn-action-modern results hover-scale-press" onClick={() => handleViewReceipt(txn)}>Receipt 🧾</button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="pagination-container">
                <button 
                    onClick={prevPage} 
                    disabled={currentPage === 1}
                    className="btn-pagination"
                    style={{opacity: currentPage === 1 ? 0.5 : 1}}
                >
                    <ChevronLeft size={18}/>
                </button>
                <span style={{fontWeight: '700', color: '#475569'}}>Page {currentPage} of {totalPages || 1}</span>
                <button 
                    onClick={nextPage} 
                    disabled={currentPage === totalPages}
                    className="btn-pagination"
                    style={{opacity: currentPage === totalPages ? 0.5 : 1}}
                >
                    <ChevronRight size={18}/>
                </button>
            </div>

        </div>

        {/* --- RIGHT SIDE SLIDING PANEL --- */}
        {activePanel !== "none" && (
            <div className="overlay-blur" onClick={() => setActivePanel("none")}>
                <div className={`luxe-panel slide-in-right ${activePanel === 'receipt' ? 'receipt-panel' : ''}`} onClick={(e) => e.stopPropagation()}>
                    
                    <div className="panel-header-simple no-print" style={{borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px', flexShrink: 0}}>
                        <div>
                            <h2 style={{margin: '0 0 5px', color: '#0f172a', fontWeight:'800'}}>
                                {activePanel === 'collect' ? 'Collect Fee' : activePanel === 'pendingPayment' ? 'Pay Pending Fee' : 'Payment Receipt'}
                            </h2>
                            <p style={{margin: 0, color: '#64748b', fontSize: '0.9rem'}}>
                                {activePanel === 'collect' ? 'Auto-filled based on class structure.' : activePanel === 'pendingPayment' ? `Pending Amount: ₹${selectedTxn?.due}` : `Ref: ${selectedTxn?.id}`}
                            </p>
                        </div>
                        <button className="close-circle-btn hover-rotate" onClick={() => setActivePanel("none")}>✕</button>
                    </div>
                    
                    <div className="panel-content-scroll">
                        
                        {activePanel === 'collect' && (
                            <>
                                <h4 style={{color:'#6366f1', fontSize:'0.85rem', textTransform:'uppercase', marginBottom:'15px', letterSpacing:'1px'}}>Student Details</h4>
                                <div className="input-group"><label>Search Student Name</label><input type="text" placeholder="e.g. Rahul Kumar" value={formData.studentName} onChange={(e) => setFormData({...formData, studentName: e.target.value})} style={inputStyle} /></div>
                                <div className="grid-2-col">
                                    <div className="input-group"><label>Class (Auto-fills Fees)</label>
                                        <select value={formData.class} onChange={(e) => setFormData({...formData, class: e.target.value})} style={inputStyle}>
                                            {Object.keys(feeStructure).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group"><label>Roll Number</label><input type="text" placeholder="101" value={formData.rollNo} onChange={(e) => setFormData({...formData, rollNo: e.target.value})} style={inputStyle} /></div>
                                </div>

                                <h4 style={{color:'#6366f1', fontSize:'0.85rem', textTransform:'uppercase', marginBottom:'15px', marginTop:'20px', letterSpacing:'1px'}}>Fee Breakdown</h4>
                                <div className="grid-2-col">
                                    <div className="input-group"><label>Tuition Fee (₹)</label><input type="number" placeholder="0" value={formData.tuitionFee} onChange={(e) => setFormData({...formData, tuitionFee: e.target.value})} style={inputStyle} /></div>
                                    <div className="input-group"><label>Transport Fee (₹)</label><input type="number" placeholder="0" value={formData.transportFee} onChange={(e) => setFormData({...formData, transportFee: e.target.value})} style={inputStyle} /></div>
                                </div>
                                <div className="grid-2-col">
                                    <div className="input-group"><label>Library/Lab (₹)</label><input type="number" placeholder="0" value={formData.libraryFee} onChange={(e) => setFormData({...formData, libraryFee: e.target.value})} style={inputStyle} /></div>
                                    <div className="input-group"><label>Late Fine (₹)</label><input type="number" placeholder="0" value={formData.fine} onChange={(e) => setFormData({...formData, fine: e.target.value})} style={inputStyle} /></div>
                                </div>
                                <div className="input-group"><label>Discount / Scholarship (₹)</label><input type="number" placeholder="0" value={formData.discount} onChange={(e) => setFormData({...formData, discount: e.target.value})} style={inputStyle} /></div>

                                <div style={{background:'#f8fafc', padding:'15px', borderRadius:'12px', border:'1px solid #e2e8f0', marginBottom:'20px'}}>
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                        <span style={{color:'#64748b', fontWeight:'600'}}>Total Payable:</span>
                                        <span style={{color:'#0f172a', fontWeight:'900', fontSize:'1.4rem'}}>₹{calculateTotal().toLocaleString()}</span>
                                    </div>
                                </div>

                                <h4 style={{color:'#6366f1', fontSize:'0.85rem', textTransform:'uppercase', marginBottom:'15px', letterSpacing:'1px'}}>Payment Mode</h4>
                                <div className="grid-2-col">
                                    <div className="input-group"><label>Method</label><select value={formData.paymentMode} onChange={(e) => setFormData({...formData, paymentMode: e.target.value})} style={inputStyle}><option>Cash</option><option>UPI / Online</option><option>Cheque</option></select></div>
                                    <div className="input-group"><label>Date</label><input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={inputStyle} /></div>
                                </div>

                                <button className="btn-confirm-gradient hover-lift" onClick={handleCollectFee} style={{width: '100%', padding: '16px', fontSize: '1rem', marginTop:'10px'}}>
                                    🧾 Generate Receipt
                                </button>
                            </>
                        )}

                        {activePanel === 'pendingPayment' && selectedTxn && (
                          <>
                            <h4 style={{color:'#6366f1', fontSize:'0.85rem', textTransform:'uppercase', marginBottom:'15px', letterSpacing:'1px'}}>Student Details</h4>
                            <div className="input-group"><label>Student Name</label><input type="text" value={formData.studentName} disabled style={inputStyle} /></div>
                            <div className="grid-2-col">
                              <div className="input-group"><label>Class</label><input type="text" value={formData.class} disabled style={inputStyle} /></div>
                              <div className="input-group"><label>Roll No</label><input type="text" value={formData.rollNo} disabled style={inputStyle} /></div>
                            </div>

                            <h4 style={{color:'#6366f1', fontSize:'0.85rem', textTransform:'uppercase', marginBottom:'15px', marginTop:'20px', letterSpacing:'1px'}}>Pending Payment</h4>
                            <div className="input-group">
                              <label>Pending Amount (₹)</label>
                              <input type="number" value={formData.payableAmount} onChange={(e) => setFormData({...formData, payableAmount: e.target.value})} style={inputStyle} />
                            </div>

                            <h4 style={{color:'#6366f1', fontSize:'0.85rem', textTransform:'uppercase', marginBottom:'15px', marginTop:'20px', letterSpacing:'1px'}}>Payment Mode</h4>
                            <div className="grid-2-col">
                              <div className="input-group"><label>Method</label><select value={formData.paymentMode} onChange={(e) => setFormData({...formData, paymentMode: e.target.value})} style={inputStyle}><option>Cash</option><option>UPI / Online</option><option>Cheque</option></select></div>
                              <div className="input-group"><label>Date</label><input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={inputStyle} /></div>
                            </div>

                            <button className="btn-confirm-gradient hover-lift" onClick={handleSubmitPendingPayment} style={{width: '100%', padding: '16px', fontSize: '1rem', marginTop:'10px'}}>
                              💳 Pay Pending & Generate Receipt
                            </button>
                          </>
                        )}

                        {activePanel === 'receipt' && selectedTxn && (
                            <div id="printable-receipt" className="receipt-container">
                                <div className="watermark">PAID</div>

                                <div style={{textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '20px'}}>
                                    <h1 style={{margin:0, fontSize: '1.8rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '1px'}}>Shivadda Academy</h1>
                                    <p style={{margin: '5px 0 0', color: '#64748b', fontSize: '0.9rem'}}>123, Knowledge Park, Education City, New Delhi - 110001</p>
                                    <p style={{margin: 0, color: '#64748b', fontSize: '0.9rem'}}>Phone: +91 98765 43210 | Email: accounts@shivadda.com</p>
                                </div>

                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                                    <div>
                                        <p style={{margin:0, color:'#64748b', fontSize:'0.85rem'}}>Receipt No:</p>
                                        <b style={{color:'#0f172a'}}>{selectedTxn.id}</b>
                                    </div>
                                    <div style={{textAlign: 'right'}}>
                                        <p style={{margin:0, color:'#64748b', fontSize:'0.85rem'}}>Date:</p>
                                        <b style={{color:'#0f172a'}}>{selectedTxn.date}</b>
                                    </div>
                                </div>

                                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '25px'}}>
                                    <div className="grid-2-col" style={{marginBottom: '10px'}}>
                                        <div><span style={{color:'#64748b', fontSize:'0.9rem'}}>Student Name:</span> <b style={{marginLeft:'5px', color:'#0f172a'}}>{selectedTxn.student}</b></div>
                                        <div><span style={{color:'#64748b', fontSize:'0.9rem'}}>Roll No:</span> <b style={{marginLeft:'5px', color:'#0f172a'}}>{selectedTxn.roll}</b></div>
                                    </div>
                                    <div className="grid-2-col">
                                        <div><span style={{color:'#64748b', fontSize:'0.9rem'}}>Class:</span> <b style={{marginLeft:'5px', color:'#0f172a'}}>{selectedTxn.class}</b></div>
                                        <div><span style={{color:'#64748b', fontSize:'0.9rem'}}>Payment Mode:</span> <b style={{marginLeft:'5px', color:'#0f172a'}}>{selectedTxn.mode}</b></div>
                                    </div>
                                </div>

                                <table className="receipt-table" style={{width: '100%', borderCollapse: 'collapse', marginBottom: '20px'}}>
                                    <thead>
                                        <tr style={{background: '#0f172a', color: 'white', WebkitPrintColorAdjust: 'exact'}}>
                                            <th style={{padding: '10px', textAlign: 'left', borderRadius: '6px 0 0 6px'}}>Description</th>
                                            <th style={{padding: '10px', textAlign: 'right', borderRadius: '0 6px 6px 0'}}>Amount (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTxn.breakdown ? (
                                            <>
                                                <tr><td style={{padding: '10px', borderBottom: '1px solid #cbd5e1', color: '#000'}}>Tuition Fee</td><td style={{textAlign: 'right', padding: '10px', borderBottom: '1px solid #cbd5e1', color: '#000', fontWeight:'600'}}>{selectedTxn.breakdown.tuition}</td></tr>
                                                <tr><td style={{padding: '10px', borderBottom: '1px solid #cbd5e1', color: '#000'}}>Transport Fee</td><td style={{textAlign: 'right', padding: '10px', borderBottom: '1px solid #cbd5e1', color: '#000', fontWeight:'600'}}>{selectedTxn.breakdown.transport}</td></tr>
                                                <tr><td style={{padding: '10px', borderBottom: '1px solid #cbd5e1', color: '#000'}}>Library & Lab</td><td style={{textAlign: 'right', padding: '10px', borderBottom: '1px solid #cbd5e1', color: '#000', fontWeight:'600'}}>{selectedTxn.breakdown.library}</td></tr>
                                                {selectedTxn.breakdown.fine > 0 && <tr><td style={{padding: '10px', borderBottom: '1px solid #cbd5e1', color:'#dc2626'}}>Late Fine</td><td style={{textAlign: 'right', padding: '10px', borderBottom: '1px solid #cbd5e1', color:'#dc2626', fontWeight:'700'}}>{selectedTxn.breakdown.fine}</td></tr>}
                                            </>
                                        ) : (
                                            <tr><td style={{padding: '10px', borderBottom: '1px solid #cbd5e1', color: '#000'}}>Consolidated Fee</td><td style={{textAlign: 'right', padding: '10px', borderBottom: '1px solid #cbd5e1', color: '#000', fontWeight:'600'}}>{selectedTxn.total}</td></tr>
                                        )}
                                        
                                        <tr style={{background: '#f1f5f9', WebkitPrintColorAdjust: 'exact'}}>
                                            <td style={{padding: '15px 10px', fontWeight: '900', color: '#0f172a', fontSize: '1.1rem'}}>Total Paid</td>
                                            <td style={{textAlign: 'right', padding: '15px 10px', fontWeight: '900', color: '#0f172a', fontSize: '1.1rem'}}>₹{selectedTxn.paid.toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '60px', paddingTop: '10px'}}>
                                    <div style={{textAlign: 'center'}}>
                                        <div style={{width: '150px', borderTop: '1px solid #334155', margin: '0 auto'}}></div>
                                        <span style={{fontSize: '0.8rem', color: '#64748b'}}>Accountant Signature</span>
                                    </div>
                                    <div style={{textAlign: 'center'}}>
                                        <div style={{width: '150px', borderTop: '1px solid #334155', margin: '0 auto'}}></div>
                                        <span style={{fontSize: '0.8rem', color: '#64748b'}}>School Seal</span>
                                    </div>
                                </div>
                                
                                <div style={{textAlign: 'center', marginTop: '30px', fontSize: '0.7rem', color: '#94a3b8'}}>
                                    This is a computer-generated receipt. No signature required.
                                </div>

                                <button className="btn-confirm-gradient hover-lift no-print" onClick={handlePrint} style={{width:'100%', marginTop: '30px', padding: '14px', fontSize: '1rem'}}>
                                    🖨️ Print Receipt
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        )}

        {showSuccess && (
          <div className="overlay-blur centered-flex" style={{zIndex: 3000}}>
              <div className="glass-card bounce-in-glass success-card-luxe">
                <div className="success-ring-luxe"><span className="checkmark-anim">L</span></div>
                <h2 style={{fontSize: '1.5rem', fontWeight: '900', margin: '20px 0 10px', color: '#0f172a'}}>Success!</h2>
                <p style={{color: '#64748b', fontSize: '1rem', margin: 0}}>{notificationMsg}</p>
              </div>
          </div>
        )}

      </div>

      <style>{`
        /* Core */
        .gradient-text { background: linear-gradient(135deg, #0f172a 0%, #334155 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .input-group label { display: block; font-size: 0.85rem; color: #000000; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.3px; }
        
        /* Receipt Specific Styling */
        .receipt-container { background: white; padding: 40px; border: 1px solid #e2e8f0; position: relative; overflow: hidden; }
        .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 8rem; color: rgba(16, 185, 129, 0.05); font-weight: 900; z-index: 0; pointer-events: none; border: 5px solid rgba(16, 185, 129, 0.1); padding: 10px 40px; border-radius: 20px; }
        .receipt-panel { width: 600px; } 

        /* Print Logic */
        @media print {
            body * { visibility: hidden; }
            .no-print { display: none !important; }
            #printable-receipt, #printable-receipt * { visibility: visible; }
            #printable-receipt { position: fixed; left: 0; top: 0; width: 100%; height: 100%; padding: 0; margin: 0; border: none; z-index: 9999; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .luxe-panel { box-shadow: none; width: 100%; height: auto; position: static; overflow: visible; }
            .overlay-blur { position: static; background: white; width: 100%; height: 100%; }
        }

        .luxe-panel { width: 450px; height: 100%; background: white; padding: 35px; display: flex; flex-direction: column; box-shadow: -20px 0 60px rgba(0,0,0,0.15); box-sizing: border-box; transition: 0.3s; }
        .badge-gray { background: #f1f5f9; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; color: #475569; white-space: nowrap; }
        
        @keyframes slideInDown { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes bounceInGlass { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes checkPop { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
        @keyframes floatIcon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        
        .slide-in-down { animation: slideInDown 0.7s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .fade-in-up { animation: fadeUp 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .slide-in-right { animation: slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .bounce-in-glass { animation: bounceInGlass 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

        /* ✅ FIXED: Stat Cards to take full width and wrap properly */
        .stat-card-3d { flex: 1; width: 100%; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); padding: 25px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1); transition: all 0.3s ease; position: relative; overflow: hidden; box-sizing: border-box; }
        .stat-card-3d:hover { transform: translateY(-10px) perspective(1000px) rotateX(2deg) rotateY(2deg); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); }
        .icon-box-floating { width: 60px; height: 60px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; animation: floatIcon 4s ease-in-out infinite; }
        .card-glow { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, var(--accent) 0%, transparent 60%); opacity: 0; transition: opacity 0.3s; pointer-events: none; mix-blend-mode: soft-light; }
        .stat-card-3d:hover .card-glow { opacity: 0.15; }

        .glass-container { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(30px); border-radius: 32px; border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 20px 60px -15px rgba(0,0,0,0.08); }
        .floating-row-glow { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); border-radius: 18px; border: 1px solid transparent; }
        .floating-row-glow:hover { transform: translateY(-5px) scale(1.01); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.08); background: white; z-index: 10; position: relative; }
        .floating-row-glow td { padding: 20px; border-bottom: 1px solid #f8fafc; white-space: nowrap; }

        .filter-tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; overflow-x: auto; white-space: nowrap; }
        .tab-btn-modern { position: relative; border: none; background: transparent; padding: 10px 24px; font-weight: 700; color: #64748b; cursor: pointer; transition: color 0.3s; z-index: 2; font-size: 0.9rem; border-radius: 30px; white-space: nowrap; }
        .tab-btn-modern.active { color: #0f172a; background: white; box-shadow: 0 5px 15px rgba(0,0,0,0.08); }
        
        .status-badge-modern { padding: 8px 16px; border-radius: 30px; font-size: 0.75rem; font-weight: 900; letter-spacing: 0.8px; text-transform: uppercase; white-space: nowrap; display: inline-flex; align-items: center; justify-content: center; min-width: 80px; }
        
        .btn-action-modern { border: none; padding: 10px 18px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 0.85rem; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
        .btn-action-modern.monitor { background: #fee2e2; color: #dc2626; border: 2px solid #fca5a5; }
        .btn-action-modern.results { background: #f0fdf4; color: #16a34a; border: 2px solid #bbf7d0; }
        .overlay-blur { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: flex-end; }
        .close-circle-btn { width: 36px; height: 36px; border-radius: 50%; background: #f1f5f9; border: none; cursor: pointer; color: #64748b; font-size: 1rem; flex-shrink: 0; }
        .btn-confirm-gradient { background: linear-gradient(135deg, #0f172a 0%, #334155 100%); border: none; color: white; border-radius: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2); }
        .btn-glow { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border: none; color: white; padding: 10px 22px; border-radius: 50px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 15px rgba(99, 102, 241, 0.25); display: flex; align-items: center; font-size: 0.9rem; white-space: nowrap; }

        .success-card-luxe { background: white; padding: 40px; border-radius: 30px; text-align: center; width: 400px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .success-ring-luxe { width: 100px; height: 100px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; animation: checkPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .checkmark-anim { font-size: 3.5rem; color: #10b981; transform: rotate(45deg) scaleX(-1); display: inline-block; }
        .centered-flex { display: flex; align-items: center; justify-content: center; }
        
        .btn-pagination { background: white; border: 1px solid #cbd5e1; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; color: #475569; flex-shrink: 0; }
        .btn-pagination:hover:not(:disabled) { background: #f1f5f9; border-color: #94a3b8; color: #0f172a; transform: translateY(-2px); }

        /* ✅ PANEL SCROLL FIX */
        .panel-content-scroll {
            overflow-y: auto;
            flex: 1;
            padding-bottom: 20px;
        }

        /* ✅ TABLE HORIZONTAL SCROLL FIX */
        .table-wrapper {
            overflow-x: auto;
            width: 100%;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 10px;
        }
        .modern-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 800px; /* Forces scroll on smaller screens */
        }
        .modern-table th {
            text-align: left;
            padding: 15px 20px;
            color: #94a3b8;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 1px;
            border-bottom: 2px solid #f1f5f9;
            white-space: nowrap;
        }

        /* 📱 RESPONSIVE MEDIA QUERIES */
        
        /* ✅ DESKTOP SPECIFIC FIX (SCROLL UNLOCK) */
        @media (min-width: 1025px) {
            html, body, #root { 
                height: 100%; 
                margin: 0; padding: 0; 
                overflow: hidden; 
            }
            .fees-page-wrapper {
                height: 100vh;
                overflow: hidden;
            }
            .fees-main-content {
                margin-left: 280px; 
                height: 100vh;
                overflow-y: auto !important; /* Forces scroll on desktop */
                padding-bottom: 120px !important; /* Space for chatbot */
                max-width: calc(100% - 280px);
            }
            .table-card {
                height: auto; /* Allow natural height instead of flex: 1 */
                overflow: visible;
            }
        }

        /* 📱 TABLET & MOBILE */
        @media (max-width: 1024px) {
            .fees-main-content { margin-left: 0 !important; width: 100%; max-width: 100%; }
        }

        @media (max-width: 850px) {
            /* Unlock Scroll on Mobile */
            html, body, #root { height: auto !important; min-height: 100vh !important; overflow-y: visible !important; }
            
            .fees-page-wrapper {
                display: block !important; 
                height: auto !important;
                min-height: 100vh !important;
            }

            .fees-main-content {
                margin-left: 0 !important;
                padding: 15px !important;
                padding-top: 85px !important; 
                padding-bottom: 150px !important; /* Space for chatbot */
                width: 100vw !important;
                max-width: 100vw !important;
                height: auto !important;
                min-height: 100vh !important;
                overflow: visible !important;
                display: block !important; /* Break Flex lock */
            }

            .page-header { flex-direction: column; align-items: flex-start !important; gap: 15px; }
            .btn-glow { width: 100%; justify-content: center; }

            /* ✅ FIXED: Mobile par cards equal width lenge aur aapas mein chipkenge nahi */
            .stats-grid { flex-direction: column; gap: 15px !important; }
            .stat-card-3d { width: 100% !important; box-sizing: border-box; }
            
            .table-card { padding: 15px !important; width: 100%; box-sizing: border-box; height: auto !important; overflow: visible !important; }
            
            /* Slide Panel mobile fix */
            .luxe-panel { width: 100%; padding: 20px; }
            .receipt-panel { width: 100%; padding: 20px; }
            
            .grid-2-col { grid-template-columns: 1fr !important; gap: 15px !important; }
            
            /* Modal Fix */
            .success-card-luxe { max-width: 90vw !important; width: auto; padding: 30px; }
        }
      `}</style>
    </div>
  );
}