import React, { useState, useEffect } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios"; 
import toast, { Toaster } from 'react-hot-toast'; 
import { Html5QrcodeScanner } from "html5-qrcode"; // ✅ ASLI SCANNER LIBRARY
import "./dashboard.css"; 

export default function Library() {
  const [activeTab, setActiveTab] = useState("books");
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals & Panels
  const [showPanel, setShowPanel] = useState(false);
  const [panelMode, setPanelMode] = useState("add_book"); 
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // ✅ REAL SCANNER STATE
  const [showScannerModal, setShowScannerModal] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Form States
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [categoryList, setCategoryList] = useState(["Science", "Fiction", "History", "Technology", "General"]);

  const [bookForm, setBookForm] = useState({ 
      id: null, title: "", author: "", isbn: "", category: "General", 
      total_copies: 1, location: "", pdf_url: "",
      publisher: "", year: "", price: "", language: "English"
  });
  const [issueForm, setIssueForm] = useState({ book_id: "", student_roll: "", days: 15 });
  const [returnForm, setReturnForm] = useState({ condition: "Good", remarks: "", fine: 0 });

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #334155', background: '#1e293b', color: '#ffffff', outline: 'none', fontSize: '0.9rem', transition: '0.3s', boxSizing: 'border-box' };

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
        const [booksRes, issuesRes] = await Promise.all([
            api.get("/library/books/"),
            api.get("/library/issues/")
        ]);
        setBooks(booksRes.data);
        setFilteredBooks(booksRes.data);
        setIssues(issuesRes.data);
        
        const existingCats = [...new Set(booksRes.data.map(b => b.category))];
        setCategoryList(prev => [...new Set([...prev, ...existingCats])]);

    } catch (error) { console.error("Data Load Failed"); }
  };

  useEffect(() => { fetchData(); }, []);

  // Search Logic
  useEffect(() => {
    const results = books.filter(b => 
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.isbn.includes(searchTerm)
    );
    setFilteredBooks(results);
  }, [searchTerm, books]);

  // ✅ REAL CAMERA SCANNER LOGIC
  useEffect(() => {
    let html5QrcodeScanner = null;

    if (showScannerModal) {
      // Initialize Scanner
      html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 150 } }, // Best size for Barcodes
        false
      );

      html5QrcodeScanner.render(
        (decodedText) => {
          // ON SUCCESS
          try {
              new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg").play().catch(()=>{});
          } catch(e) {}
          
          setSearchTerm(decodedText);
          setActiveTab('books');
          toast.success(`Scanned ISBN: ${decodedText}`, { icon: '📸' });
          
          // Cleanup & Close
          html5QrcodeScanner.clear();
          setShowScannerModal(false);
        },
        (error) => {
          // ON ERROR (Runs continuously, no need to log or toast)
        }
      );
    }

    // Cleanup when modal closes
    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(error => {
          console.error("Failed to clear scanner", error);
        });
      }
    };
  }, [showScannerModal]);

  // --- ACTIONS ---
  const handleAddBook = async () => {
    if(!bookForm.title || !bookForm.isbn) return toast.error("Title & ISBN required"); 
    const load = toast.loading("Saving...");
    
    try {
        let finalCategory = isAddingCategory && newCatName ? newCatName : bookForm.category;
        if(isAddingCategory && newCatName) setCategoryList(prev => [...new Set([...prev, newCatName])]);

        const payload = { 
            ...bookForm, 
            category: finalCategory,
            price: bookForm.price || 0 
        };
        
        if(panelMode === 'add_book') payload.available_copies = bookForm.total_copies;

        if (panelMode === 'add_book') {
            await api.post("/library/books/", payload);
            toast.success("Book Added! 📚", { id: load });
        } else {
            await api.patch(`/library/books/${bookForm.id}/`, payload);
            toast.success("Updated! ✏️", { id: load });
        }

        setShowPanel(false); 
        fetchData(); 
        resetBookForm();
    } catch (err) { toast.error("Failed", { id: load }); }
  };

  const handleDeleteBook = async () => {
      const load = toast.loading("Deleting...");
      try {
          await api.delete(`/library/books/${selectedItem.id}/`);
          toast.success("Deleted 🗑️", { id: load });
          setShowConfirmModal(false);
          fetchData(); 
      } catch (err) { toast.error("Delete Failed", { id: load }); }
  };

  const confirmDelete = (book) => {
      setSelectedItem(book);
      setConfirmAction(() => handleDeleteBook);
      setShowConfirmModal(true);
  };

  const handleIssueBook = async () => {
    if(!issueForm.student_roll || !issueForm.book_id) return toast.error("Select Book & Student");
    const load = toast.loading("Issuing...");
    try {
        await api.post("/library/issues/", { book: issueForm.book_id, student_roll: issueForm.student_roll });
        toast.success("Issued! 🎒", { id: load });
        setShowPanel(false); 
        fetchData(); 
        setIssueForm({ book_id: "", student_roll: "", days: 15 });
    } catch (err) { toast.error(err.response?.data?.error || "Failed", { id: load }); }
  };

  const handleReturn = async () => {
    const load = toast.loading("Returning...");
    try {
        const res = await api.post(`/library/issues/${selectedItem.id}/return_book/`);
        const fine = parseFloat(res.data.fine_collected);
        fine > 0 ? toast.success(`Returned. Fine: ₹${fine} 💰`, { id: load }) 
                 : toast.success("Returned ✅", { id: load });
        setShowReturnModal(false);
        fetchData();
    } catch (err) { toast.error("Failed", { id: load }); }
  };

  const openReturnModal = (issue) => {
      const today = new Date();
      const due = new Date(issue.due_date);
      let fine = 0;
      if (today > due) {
          const diffTime = Math.abs(today - due);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          fine = diffDays * 10;
      }
      setReturnForm({ condition: "Good", remarks: "", fine: fine });
      setSelectedItem(issue);
      setShowReturnModal(true);
  };

  const handleConditionChange = (condition) => {
      let newFine = returnForm.fine;
      if (condition === "Lost") {
          const book = books.find(b => b.title === selectedItem.book_title);
          const bookPrice = book ? parseFloat(book.price || 0) : 500; 
          newFine += bookPrice;
          toast("Book Price Added to Fine", { icon: "💸" });
      }
      setReturnForm({ ...returnForm, condition: condition, fine: newFine });
  };

  const resetBookForm = () => {
      setBookForm({ id: null, title: "", author: "", isbn: "", category: "General", total_copies: 1, location: "", pdf_url: "", publisher: "", year: "", price: "", language: "English" });
      setIsAddingCategory(false); setNewCatName("");
  };

  const isOverdue = (dateStr) => new Date() > new Date(dateStr);
  const openViewDetail = (book) => { setSelectedItem(book); setShowDetailModal(true); };
  
  const openEditPanel = (book) => {
      setPanelMode("edit_book");
      setBookForm(book); 
      setShowPanel(true);
  };

  const triggerReturn = (issue) => openReturnModal(issue);

  return (
    <div className="library-page-wrapper">
      <div className="ambient-bg"></div>
      <SidebarModern />
      <Toaster position="top-center" />

      <div className="library-main-content">
        
        <header className="slide-in-down page-header">
          <div>
            <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Library Command</h1>
            <p style={{ color: '#64748b', margin: '5px 0 0' }}>Real-time circulation, inventory & e-library.</p>
          </div>
          <div className="header-actions">
             {/* ✅ Click triggers the Real Camera Modal */}
             <div className="scanner-btn hover-scale-press" onClick={() => setShowScannerModal(true)}>📷 Scan ISBN</div>
             <button className="btn-glow hover-scale-press" style={{background: '#3b82f6'}} onClick={() => {setPanelMode("issue_book"); setShowPanel(true);}}>📖 Issue</button>
             <button className="btn-glow hover-scale-press" onClick={() => {setPanelMode("add_book"); resetBookForm(); setShowPanel(true);}}>+ Add Book</button>
          </div>
        </header>

        {/* STATS */}
        <div className="stats-grid" style={{display: 'flex', gap: '20px', marginBottom: '25px'}}>
            <div className="stat-card-3d fade-in-up" style={{'--accent': '#3b82f6'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div><span style={{color:'#64748b', fontWeight:'700', fontSize:'0.85rem'}}>TOTAL ASSETS</span><h2 style={{color:'#3b82f6', fontSize:'2rem', margin: '5px 0', fontWeight: '900'}}>{books.length}</h2></div>
                    <div className="icon-box-floating" style={{background: '#eff6ff', color: '#3b82f6'}}>📚</div>
                </div>
            </div>
            <div className="stat-card-3d fade-in-up" style={{'--accent': '#f59e0b', animationDelay: '0.1s'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div><span style={{color:'#64748b', fontWeight:'700', fontSize:'0.85rem'}}>OVERDUE</span><h2 style={{color:'#dc2626', fontSize:'2rem', margin: '5px 0', fontWeight: '900'}}>{issues.filter(i => i.status === 'Issued' && isOverdue(i.due_date)).length}</h2></div>
                    <div className="icon-box-floating" style={{background: '#fef2f2', color: '#dc2626'}}>⚠️</div>
                </div>
            </div>
            <div className="stat-card-3d fade-in-up" style={{'--accent': '#10b981', animationDelay: '0.2s'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div><span style={{color:'#64748b', fontWeight:'700', fontSize:'0.85rem'}}>FINES COLLECTED</span><h2 style={{color:'#10b981', fontSize:'2rem', margin: '5px 0', fontWeight: '900'}}>₹{(issues.reduce((acc, i) => acc + parseFloat(i.fine_amount || 0), 0)).toFixed(0)}</h2></div>
                    <div className="icon-box-floating" style={{background: '#ecfdf5', color: '#10b981'}}>💰</div>
                </div>
            </div>
        </div>

        {/* TABS & SEARCH */}
        <div className="tab-search-wrapper" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <div style={{display:'flex', gap:'15px', flexWrap: 'wrap'}}>
                <div className={`tab-pill ${activeTab==='books'?'active':''}`} onClick={()=>setActiveTab('books')}>Book Catalog</div>
                <div className={`tab-pill ${activeTab==='circulation'?'active':''}`} onClick={()=>setActiveTab('circulation')}>Circulation Desk</div>
            </div>
            {activeTab === 'books' && (
                <input type="text" placeholder="🔍 Search Title, Author, ISBN..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} 
                className="search-input" style={{padding:'12px 20px', borderRadius:'30px', border:'1px solid #cbd5e1', outline:'none', background:'white', color:'#1e293b'}} /> 
            )}
        </div>

        {/* VIEW 1: BOOK CATALOG */}
        {activeTab === 'books' && (
            <div className="glass-card fade-in-up table-card">
                <div className="table-wrapper">
                    <table className="modern-table luxe-table">
                        <thead>
                            <tr style={{background: '#f8fafc', color: '#0f172a'}}>
                                <th style={{width:'35%', color: '#64748b', fontWeight: '800'}}>TITLE / AUTHOR</th>
                                <th style={{color: '#64748b', fontWeight: '800'}}>ISBN / LOC</th>
                                <th style={{color: '#64748b', fontWeight: '800'}}>CATEGORY</th>
                                <th style={{color: '#64748b', fontWeight: '800'}}>PRICE</th>
                                <th style={{color: '#64748b', fontWeight: '800'}}>AVAILABILITY</th>
                                <th style={{textAlign:'right', color: '#64748b', fontWeight: '800'}}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBooks.map(book => (
                                <tr key={book.id} className="floating-row-glow">
                                    <td>
                                        <div style={{display:'flex', alignItems:'center', gap:'10px', whiteSpace: 'nowrap'}}>
                                            <div style={{width:'40px', height:'50px', background:'linear-gradient(135deg, #e2e8f0, #cbd5e1)', borderRadius:'4px', flexShrink: 0}}></div>
                                            <div>
                                                <b style={{color: '#1e293b', fontSize:'0.95rem'}}>{book.title}</b>
                                                <div style={{fontSize:'0.8rem', color:'#64748b'}}>{book.author}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{fontSize:'0.85rem', fontWeight:'600', color:'#334155', whiteSpace: 'nowrap'}}>{book.isbn}</div>
                                        <div style={{fontSize:'0.75rem', color:'#64748b', whiteSpace: 'nowrap'}}>📍 {book.location || "N/A"}</div>
                                    </td>
                                    <td><span className="badge-gray" style={{whiteSpace: 'nowrap'}}>{book.category}</span></td>
                                    <td><b style={{color:'#334155', whiteSpace: 'nowrap'}}>₹{book.price || '0'}</b></td>
                                    <td>
                                        <span style={{color: book.available_copies>0?'#10b981':'#ef4444', fontWeight:'800', display:'flex', alignItems:'center', gap:'5px', whiteSpace: 'nowrap'}}>
                                            <span style={{width:'8px', height:'8px', borderRadius:'50%', background: book.available_copies>0?'#10b981':'#ef4444'}}></span>
                                            {book.available_copies} / {book.total_copies}
                                        </span>
                                    </td>
                                    <td style={{textAlign:'right', whiteSpace: 'nowrap'}}>
                                        <button className="icon-btn" title="View Details" onClick={() => openViewDetail(book)}>👁️</button>
                                        {book.available_copies > 0 && <button className="icon-btn" title="Quick Issue" onClick={() => {setPanelMode("issue_book"); setIssueForm({...issueForm, book_id: book.id}); setShowPanel(true);}}>⚡</button>}
                                        <button className="icon-btn" title="Edit" onClick={() => openEditPanel(book)}>✏️</button>
                                        <button className="icon-btn" title="Delete" onClick={() => confirmDelete(book)} style={{color:'#ef4444'}}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* VIEW 2: CIRCULATION */}
        {activeTab === 'circulation' && (
            <div className="glass-card fade-in-up table-card">
                <div className="table-wrapper">
                    <table className="modern-table luxe-table">
                        <thead>
                            <tr style={{background: '#f8fafc', color: '#0f172a'}}>
                                <th style={{color: '#64748b', fontWeight: '800'}}>STUDENT</th>
                                <th style={{color: '#64748b', fontWeight: '800'}}>BOOK TITLE</th>
                                <th style={{color: '#64748b', fontWeight: '800'}}>DUE DATE</th>
                                <th style={{color: '#64748b', fontWeight: '800'}}>STATUS</th>
                                <th style={{textAlign:'right', color: '#64748b', fontWeight: '800'}}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues.map(issue => {
                                const isLate = issue.status === 'Issued' && isOverdue(issue.due_date);
                                return (
                                    <tr key={issue.id} className="floating-row-glow" style={{borderLeft: isLate ? '4px solid #ef4444' : 'none'}}>
                                        <td><b style={{color: '#334155', whiteSpace: 'nowrap'}}>{issue.student_roll}</b></td>
                                        <td><span style={{color:'#475569', whiteSpace: 'nowrap'}}>{issue.book_title}</span></td>
                                        <td>
                                            <span style={{color: isLate ? '#ef4444' : '#64748b', fontWeight: isLate?'bold':'normal', whiteSpace: 'nowrap'}}>
                                                {issue.due_date} {isLate && <span style={{fontSize:'0.7rem', background:'#fef2f2', padding:'2px 6px', borderRadius:'4px', marginLeft:'5px'}}>LATE</span>}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{background: issue.status==='Returned'?'#f0fdf4': isLate ? '#fef2f2' : '#fff7ed', color: issue.status==='Returned'?'#16a34a': isLate ? '#dc2626' : '#ea580c', padding:'4px 10px', borderRadius:'20px', fontSize:'0.75rem', fontWeight:'700', whiteSpace: 'nowrap'}}>
                                                {issue.status}
                                            </span>
                                        </td>
                                        <td style={{textAlign:'right', whiteSpace: 'nowrap'}}>
                                            {issue.status === 'Issued' ? (
                                                <button className="return-btn" onClick={() => triggerReturn(issue)}>Return 📥</button>
                                            ) : (
                                                <span style={{fontSize:'0.75rem', color: issue.fine_amount>0?'#ef4444':'#94a3b8', fontWeight:'bold'}}>
                                                    {issue.fine_amount>0 ? `Paid Fine: ₹${issue.fine_amount}` : 'Returned'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* ✅ REAL CAMERA SCANNER MODAL */}
        {showScannerModal && (
            <div className="overlay-blur centered-flex" onClick={() => setShowScannerModal(false)}>
                <div className="modal-box slide-in-up" onClick={e=>e.stopPropagation()} style={{textAlign: 'center', width: '450px'}}>
                    <div className="panel-header-simple" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                        <h3 style={{margin:0, color:'#0f172a'}}>Scan Book Barcode</h3>
                        <button className="close-circle-btn" onClick={() => setShowScannerModal(false)}>✕</button>
                    </div>
                    
                    {/* The div where html5-qrcode will render the camera */}
                    <div id="reader" style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}></div>
                    
                    <p style={{color: '#64748b', fontSize: '0.9rem', marginTop: '20px', fontWeight: '500'}}>
                        Point your device camera at the ISBN Barcode to search automatically.
                    </p>
                </div>
            </div>
        )}

        {/* --- CONFIRM DELETE MODAL --- */}
        {showConfirmModal && (
            <div className="overlay-blur centered-flex" onClick={() => setShowConfirmModal(false)}>
                <div className="modal-box slide-in-up" onClick={e=>e.stopPropagation()}>
                    <h3 style={{margin:'0 0 10px', color:'#dc2626'}}>Confirm Delete</h3>
                    <p style={{color:'#64748b', marginBottom:'20px'}}>Are you sure you want to delete <b>{selectedItem?.title}</b>? Cannot be undone.</p>
                    <div style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
                        <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                        <button className="btn-confirm" onClick={confirmAction} style={{background:'#dc2626'}}>Delete</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- VIEW DETAILS MODAL --- */}
        {showDetailModal && selectedItem && (
            <div className="overlay-blur centered-flex" onClick={() => setShowDetailModal(false)}>
                <div className="modal-box slide-in-up" onClick={e=>e.stopPropagation()} style={{maxWidth:'450px', maxHeight: '90vh', overflowY: 'auto'}}>
                    <div className="panel-header-simple" style={{display: 'flex', justifyContent: 'space-between'}}>
                        <h3 style={{margin:0, color:'#0f172a'}}>Book Details</h3>
                        <button className="close-circle-btn" onClick={() => setShowDetailModal(false)}>✕</button>
                    </div>
                    <div style={{marginTop:'20px'}}>
                        <div style={{background:'#eef2ff', padding:'15px', borderRadius:'12px', textAlign:'center', marginBottom:'20px'}}>
                            <h2 style={{margin:0, color:'#3b82f6'}}>{selectedItem.title}</h2>
                            <p style={{color:'#64748b', margin:0}}>by {selectedItem.author}</p>
                        </div>
                        <div className="grid-2-col" style={{gap:'10px'}}>
                            <div style={{background:'#f8fafc', padding:'10px', borderRadius:'8px'}}><small style={{color:'#64748b'}}>ISBN</small><br/><b style={{color:'#1e293b'}}>{selectedItem.isbn}</b></div>
                            <div style={{background:'#f8fafc', padding:'10px', borderRadius:'8px'}}><small style={{color:'#64748b'}}>Category</small><br/><b style={{color:'#1e293b'}}>{selectedItem.category}</b></div>
                            <div style={{background:'#f8fafc', padding:'10px', borderRadius:'8px'}}><small style={{color:'#64748b'}}>Publisher</small><br/><b style={{color:'#1e293b'}}>{selectedItem.publisher || "N/A"}</b></div>
                            <div style={{background:'#f8fafc', padding:'10px', borderRadius:'8px'}}><small style={{color:'#64748b'}}>Year</small><br/><b style={{color:'#1e293b'}}>{selectedItem.year || "N/A"}</b></div>
                            <div style={{background:'#f8fafc', padding:'10px', borderRadius:'8px'}}><small style={{color:'#64748b'}}>Price</small><br/><b style={{color:'#1e293b'}}>₹{selectedItem.price || "0"}</b></div>
                            <div style={{background:'#f8fafc', padding:'10px', borderRadius:'8px'}}><small style={{color:'#64748b'}}>Location</small><br/><b style={{color:'#1e293b'}}>{selectedItem.location || "N/A"}</b></div>
                        </div>
                        {selectedItem.pdf_url && <a href={selectedItem.pdf_url} target="_blank" rel="noreferrer" className="btn-confirm-gradient" style={{display:'block', textAlign:'center', textDecoration:'none', marginTop:'20px', padding:'12px'}}>Download E-Book 📥</a>}
                    </div>
                </div>
            </div>
        )}

        {/* --- RETURN & FINE MODAL --- */}
        {showReturnModal && selectedItem && (
            <div className="overlay-blur centered-flex" onClick={() => setShowReturnModal(false)}>
                <div className="modal-box slide-in-up" onClick={e=>e.stopPropagation()} style={{width:'450px', maxHeight: '90vh', overflowY: 'auto'}}>
                    <div className="panel-header-simple" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <h3 style={{margin:0, color:'#0f172a'}}>Return Book</h3>
                        <button className="close-circle-btn" onClick={() => setShowReturnModal(false)}>✕</button>
                    </div>
                    
                    <div style={{background:'#f1f5f9', padding:'15px', borderRadius:'12px', margin:'20px 0'}}>
                        <p style={{margin:'0 0 5px', color:'#64748b', fontSize:'0.9rem'}}>Book: <b style={{color:'#1e293b'}}>{selectedItem.book_title}</b></p>
                        <p style={{margin:0, color:'#64748b', fontSize:'0.9rem'}}>Student: <b style={{color:'#1e293b'}}>{selectedItem.student_roll}</b></p>
                    </div>

                    <div className="grid-2-col">
                        <div className="input-group">
                            <label>Book Condition</label>
                            <select value={returnForm.condition} onChange={e=>handleConditionChange(e.target.value)} style={inputStyle}>
                                <option>Good</option>
                                <option>Damaged</option>
                                <option>Lost</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Calculated Fine (₹)</label>
                            <input type="number" value={returnForm.fine} onChange={e=>setReturnForm({...returnForm, fine:e.target.value})} style={{...inputStyle, borderColor: returnForm.fine>0?'#ef4444':'#334155', color: returnForm.fine>0?'#ef4444':'white'}} />
                        </div>
                    </div>

                    {returnForm.fine > 0 && <p style={{color:'#ef4444', fontSize:'0.85rem', marginTop:'-15px', marginBottom:'15px'}}>⚠️ Fine applied (Late or Damaged/Lost).</p>}

                    <div className="input-group">
                        <label>Remarks</label>
                        <input type="text" placeholder="Optional notes..." value={returnForm.remarks} onChange={e=>setReturnForm({...returnForm, remarks:e.target.value})} style={inputStyle} />
                    </div>

                    <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                        <button className="btn-confirm-gradient" style={{width:'100%', padding:'14px'}} onClick={handleReturn}>Confirm Return</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- ADD / ISSUE SLIDE PANEL --- */}
        {showPanel && (
            <div className="overlay-blur" onClick={() => setShowPanel(false)}>
                <div className="luxe-panel slide-in-right" onClick={(e) => e.stopPropagation()}>
                    <div className="panel-header-simple" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0}}>
                        <h2 style={{margin:0, color:'#0f172a'}}>
                            {panelMode === 'add_book' ? 'Catalog New Book' : panelMode === 'edit_book' ? 'Edit Details' : 'Issue Circulation'}
                        </h2>
                        <button className="close-circle-btn" onClick={() => setShowPanel(false)}>✕</button>
                    </div>
                    
                    <div className="panel-content-scroll" style={{marginTop:'20px', flex: 1, overflowY: 'auto'}}>
                        
                        {(panelMode === 'add_book' || panelMode === 'edit_book') && (
                            <>
                                <div className="input-group"><label>Book Title</label><input type="text" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} style={inputStyle} /></div>
                                <div className="grid-2-col">
                                    <div className="input-group"><label>Author</label><input type="text" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} style={inputStyle} /></div>
                                    <div className="input-group"><label>ISBN/Code</label><input type="text" value={bookForm.isbn} onChange={e => setBookForm({...bookForm, isbn: e.target.value})} style={inputStyle} /></div>
                                </div>
                                <div className="grid-2-col">
                                    <div className="input-group"><label>Publisher</label><input type="text" placeholder="e.g. Pearson" value={bookForm.publisher} onChange={e => setBookForm({...bookForm, publisher: e.target.value})} style={inputStyle} /></div>
                                    <div className="input-group"><label>Pub. Year</label><input type="text" placeholder="2024" value={bookForm.year} onChange={e => setBookForm({...bookForm, year: e.target.value})} style={inputStyle} /></div>
                                </div>
                                <div className="grid-2-col">
                                    <div className="input-group"><label>Price (₹)</label><input type="number" placeholder="500" value={bookForm.price} onChange={e => setBookForm({...bookForm, price: e.target.value})} style={inputStyle} /></div>
                                    <div className="input-group"><label>Language</label><input type="text" placeholder="English" value={bookForm.language} onChange={e => setBookForm({...bookForm, language: e.target.value})} style={inputStyle} /></div>
                                </div>

                                <div className="grid-2-col">
                                    <div className="input-group">
                                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                                            <label style={{margin:0}}>Category</label>
                                            {!isAddingCategory ? <span style={{fontSize:'0.75rem', color:'#3b82f6', cursor:'pointer', fontWeight:'700'}} onClick={() => setIsAddingCategory(true)}>+ Add New</span> : <span style={{fontSize:'0.75rem', color:'#ef4444', cursor:'pointer', fontWeight:'700'}} onClick={() => setIsAddingCategory(false)}>✕ Cancel</span>}
                                        </div>
                                        {!isAddingCategory ? (
                                            <div style={{display:'flex', gap:'5px'}}>
                                                <select value={bookForm.category} onChange={e => setBookForm({...bookForm, category: e.target.value})} style={inputStyle}>
                                                    {categoryList.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <button onClick={()=>setIsAddingCategory(true)} style={{background:'#e2e8f0', border:'none', borderRadius:'8px', padding:'0 12px', fontSize:'1.2rem', cursor:'pointer'}} title="Add New Category">+</button>
                                            </div>
                                        ) : (
                                            <div style={{display:'flex', gap:'5px'}}>
                                                <input type="text" placeholder="New Category Name..." value={newCatName} onChange={e => setNewCatName(e.target.value)} style={inputStyle} autoFocus />
                                                <button onClick={()=>setIsAddingCategory(false)} style={{background:'#fef2f2', color:'red', border:'none', borderRadius:'8px', padding:'0 12px', cursor:'pointer'}}>✕</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="input-group"><label>Total Copies</label><input type="number" value={bookForm.total_copies} onChange={e => setBookForm({...bookForm, total_copies: e.target.value})} style={inputStyle} /></div>
                                </div>
                                <div className="input-group"><label>Shelf Location</label><input type="text" placeholder="e.g. Row A, Shelf 2" value={bookForm.location} onChange={e => setBookForm({...bookForm, location: e.target.value})} style={inputStyle} /></div>
                                <div className="input-group"><label>Digital E-Book Link (PDF)</label><input type="text" placeholder="https://..." value={bookForm.pdf_url} onChange={e => setBookForm({...bookForm, pdf_url: e.target.value})} style={inputStyle} /></div>
                                
                                <button className="btn-confirm-gradient hover-lift" onClick={handleAddBook} style={{width:'100%', padding:'16px', marginTop:'20px'}}>
                                    {panelMode === 'add_book' ? 'Add to Catalog' : 'Update Details'}
                                </button>
                            </>
                        )}

                        {panelMode === 'issue_book' && (
                            <>
                                <div className="input-group">
                                    <label>Select Book</label>
                                    <select value={issueForm.book_id} onChange={e => setIssueForm({...issueForm, book_id: e.target.value})} style={inputStyle}>
                                        <option value="">-- Choose from Stock --</option>
                                        {books.filter(b => b.available_copies > 0).map(b => <option key={b.id} value={b.id}>{b.title} (Qty: {b.available_copies})</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label>Student Roll Number</label>
                                    <input type="text" placeholder="e.g. 2024-CS-01" value={issueForm.student_roll} onChange={e => setIssueForm({...issueForm, student_roll: e.target.value})} style={inputStyle} />
                                </div>
                                <div className="input-group">
                                    <label>Issue Duration (Days)</label>
                                    <select value={issueForm.days} onChange={e => setIssueForm({...issueForm, days: e.target.value})} style={inputStyle}>
                                        <option value="7">7 Days</option>
                                        <option value="15">15 Days</option>
                                        <option value="30">30 Days (Staff)</option>
                                    </select>
                                </div>
                                <button className="btn-confirm-gradient hover-lift" onClick={handleIssueBook} style={{width:'100%', padding:'16px', marginTop:'20px'}}>Confirm Issue</button>
                            </>
                        )}

                    </div>
                </div>
            </div>
        )}

      </div>

      {/* 🚀 RESPONSIVE & SCANNER OVERRIDE CSS */}
      <style>{`
        /* Core Reset & Fix */
        html, body, #root { margin: 0; padding: 0; height: 100%; }
        
        .library-page-wrapper {
            display: flex;
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background: #f8fafc;
            font-family: 'Inter', sans-serif;
        }

        .library-main-content {
            flex: 1;
            margin-left: 280px; 
            padding: 30px 40px;
            padding-bottom: 120px !important; 
            height: 100vh;
            overflow-y: auto !important; 
            box-sizing: border-box;
            max-width: calc(100% - 280px);
            position: relative;
            z-index: 1;
        }

        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-shrink: 0; }
        .header-actions { display: flex; gap: 10px; }

        .tab-pill { padding: 10px 20px; background: white; border-radius: 50px; cursor: pointer; font-weight: 700; color: #64748b; transition: 0.3s; border: 1px solid #e2e8f0; font-size: 0.9rem; }
        .tab-pill.active { background: #0f172a; color: white; border-color: #0f172a; box-shadow: 0 5px 15px rgba(15, 23, 42, 0.2); }
        
        .icon-btn { width: 34px; height: 34px; border-radius: 10px; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin-left: 6px; transition: 0.2s; font-size: 1rem; background: #f1f5f9; color: #64748b; flex-shrink: 0; }
        .icon-btn:hover { transform: translateY(-2px); background: #e2e8f0; color: #0f172a; }
        
        .return-btn { background: #0f172a; border: none; color: white; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 700; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.1); white-space: nowrap;}
        .return-btn:hover { transform: translateY(-2px); background: #1e293b; }
        
        .badge-gray { background: #f1f5f9; padding: 5px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase; }
        
        .scanner-btn { display: flex; align-items: center; background: white; padding: 8px 15px; border-radius: 30px; border: 1px solid #cbd5e1; cursor: pointer; font-weight: 600; color: #475569; font-size: 0.9rem; transition: 0.2s; white-space: nowrap; user-select: none; }
        .scanner-btn:hover { background: #f8fafc; border-color: #94a3b8; }

        /* ✅ HTML5 QR CODE OVERRIDES TO MAKE IT LOOK PREMIUM */
        #reader { border: none !important; }
        #reader video { border-radius: 12px; object-fit: cover; }
        #reader button { 
            background: #6366f1; color: white; border: none; padding: 10px 20px; 
            border-radius: 8px; cursor: pointer; margin: 10px 5px; 
            font-family: inherit; font-weight: 600; transition: 0.2s;
        }
        #reader button:hover { background: #4f46e5; transform: translateY(-2px); }
        #reader select { padding: 8px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 10px; font-family: inherit; }
        #reader a { display: none !important; } /* Hides "Powered by html5-qrcode" */

        .btn-confirm-gradient { background: linear-gradient(135deg, #0f172a 0%, #334155 100%); color: white; border-radius: 16px; font-weight: 700; cursor: pointer; border:none; box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2); transition: 0.3s;}
        .btn-confirm-gradient:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-confirm { background: #0f172a; color: white; padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; }
        .btn-cancel { background: #f1f5f9; color: #64748b; padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; }
        
        .btn-glow { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border: none; color: white; padding: 12px 24px; border-radius: 50px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 15px rgba(99, 102, 241, 0.25); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; white-space: nowrap;}
        
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; width: 100%; }
        .stat-card-3d { width: 100%; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px); padding: 25px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1); transition: all 0.3s ease; position: relative; overflow: hidden; box-sizing: border-box;}
        .stat-card-3d:hover { transform: translateY(-5px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1); }
        .icon-box-floating { width: 55px; height: 55px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; animation: floatIcon 4s ease-in-out infinite; flex-shrink: 0;}
        
        .input-group label { display: block; font-size: 0.85rem; color: #64748b; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.3px; }
        .grid-2-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; width: 100%; }
        
        .overlay-blur { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: flex-end; }
        .luxe-panel { width: 480px; height: 100%; background: white; padding: 35px; display: flex; flex-direction: column; box-shadow: -20px 0 60px rgba(0,0,0,0.15); box-sizing: border-box; }
        .close-circle-btn { width: 36px; height: 36px; border-radius: 50%; background: #f1f5f9; border: none; cursor: pointer; color: #64748b; font-size: 1rem; transition:0.2s; flex-shrink: 0;}
        .close-circle-btn:hover { background: #e2e8f0; color: #0f172a; }

        .modal-box { background: white; padding: 30px; border-radius: 24px; box-shadow: 0 25px 80px rgba(0,0,0,0.3); width: 400px; max-width: 90vw; text-align: left; box-sizing: border-box;}
        .centered-flex { display: flex; align-items: center; justify-content: center; padding: 20px;}

        /* ✅ TABLE HORIZONTAL SCROLL FIX */
        .table-card { padding: 25px; background: white; border-radius: 24px; }
        .table-wrapper { overflow-x: auto; width: 100%; -webkit-overflow-scrolling: touch; padding-bottom: 10px; }
        .modern-table { width: 100%; border-collapse: collapse; min-width: 800px; }
        .modern-table th { color: #64748b; font-weight: 800; text-align: left; padding: 15px; white-space: nowrap; border-bottom: 2px solid #f1f5f9;}
        .floating-row-glow { transition: all 0.2s ease; }
        .floating-row-glow:hover { transform: translateY(-2px); background: #f8fafc; box-shadow: 0 5px 15px -5px rgba(0,0,0,0.05); }
        .floating-row-glow td { padding: 15px; border-bottom: 1px solid #f1f5f9; }
        
        @keyframes slideInDown { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floatIcon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        
        /* 📱 RESPONSIVE MEDIA QUERIES */
        @media (max-width: 1024px) {
            .library-main-content { margin-left: 0 !important; max-width: 100%; width: 100%; }
        }

        @media (max-width: 850px) {
            /* Unlock Scroll on Mobile completely */
            html, body, #root { height: auto !important; min-height: 100vh !important; overflow-y: visible !important; }
            
            .library-page-wrapper {
                display: block !important; 
                height: auto !important;
                min-height: 100vh !important;
            }

            .library-main-content {
                margin-left: 0 !important;
                padding: 15px !important;
                padding-top: 85px !important; 
                padding-bottom: 180px !important; /* Space for chatbot */
                width: 100vw !important;
                max-width: 100vw !important;
                height: auto !important;
                min-height: 100vh !important;
                overflow: visible !important;
                display: block !important; /* Break Flex lock */
            }

            .page-header { flex-direction: column; align-items: flex-start !important; gap: 15px; }
            .header-actions { width: 100%; flex-wrap: wrap; }
            .header-actions button, .header-actions .scanner-btn { flex: 1; justify-content: center; }

            .stats-grid { grid-template-columns: 1fr !important; }
            
            .tab-search-wrapper { flex-direction: column; align-items: flex-start; gap: 15px; }
            .search-input { width: 100% !important; box-sizing: border-box; }

            .table-card { padding: 15px !important; width: 100%; box-sizing: border-box; }
            
            .luxe-panel { width: 100%; padding: 20px; }
            .grid-2-col { grid-template-columns: 1fr !important; gap: 15px !important; }
        }
      `}</style>
    </div>
  );
}