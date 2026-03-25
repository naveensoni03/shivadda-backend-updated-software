import React, { useEffect, useState } from "react";
import SidebarModern from "../components/SidebarModern";
import api from "../api/axios";
import toast, { Toaster } from 'react-hot-toast';
import {
    Globe, Map as MapIcon, Plus, Trash2, X, Flag,
    Layers, ChevronDown, ChevronRight, Sparkles, LayoutList, MapPin, ArrowLeft, Save,
    CheckSquare, Check, Eye, EyeOff, Power,
    ChevronLeft // ✅ NEW: Added ChevronLeft for Pagination
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- HELPER COMPONENTS ---
const GlassCard = ({ children, className, style }) => (
    <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
            background: "white",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.06)",
            overflow: "hidden",
            ...style
        }}
        className={className}
    >
        {children}
    </motion.div>
);

const GradientStat = ({ label, value, icon, color }) => (
    <motion.div
        whileHover={{ scale: 1.05, y: -2 }}
        style={{
            background: color,
            padding: '12px 20px', borderRadius: '18px',
            color: 'white', display: 'flex', alignItems: 'center', gap: '12px',
            boxShadow: '0 8px 20px -5px rgba(0,0,0,0.2)',
            minWidth: '140px'
        }}
    >
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '10px', display: 'flex' }}>{icon}</div>
        <div>
            <div style={{ fontSize: '0.7rem', fontWeight: '600', opacity: 0.9, textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', lineHeight: 1 }}>{value}</div>
        </div>
    </motion.div>
);

// --- FULL EXTENDED STATIC CASCADING DATA ---
const continentsData = {
    "Asia": ["India", "China", "Japan", "Pakistan", "Bangladesh", "Nepal", "Sri Lanka", "Afghanistan", "Iran", "Iraq", "Saudi Arabia", "Indonesia", "Malaysia", "Philippines", "Vietnam", "Thailand", "South Korea", "Turkey", "Israel", "UAE"],
    "Europe": ["United Kingdom", "France", "Germany", "Italy", "Spain", "Russia", "Ukraine", "Poland", "Netherlands", "Belgium", "Sweden", "Switzerland", "Austria", "Norway", "Greece", "Portugal", "Ireland", "Denmark", "Finland", "Czech Republic"],
    "Africa": ["Nigeria", "Egypt", "South Africa", "Kenya", "Ghana", "Morocco", "Ethiopia", "Uganda", "Algeria", "Tanzania", "Sudan", "Angola", "Mozambique", "Madagascar", "Cameroon", "Côte d'Ivoire", "Niger", "Burkina Faso", "Mali", "Malawi"],
    "North America": ["United States", "Canada", "Mexico", "Cuba", "Guatemala", "Haiti", "Dominican Republic", "Honduras", "El Salvador", "Nicaragua", "Costa Rica", "Panama", "Jamaica", "Trinidad and Tobago", "Bahamas", "Belize", "Barbados", "Saint Lucia"],
    "South America": ["Brazil", "Argentina", "Colombia", "Chile", "Peru", "Venezuela", "Ecuador", "Bolivia", "Paraguay", "Uruguay", "Guyana", "Suriname", "French Guiana", "Falkland Islands"],
    "Oceania": ["Australia", "New Zealand", "Papua New Guinea", "Fiji", "Solomon Islands", "Vanuatu", "Samoa", "Kiribati", "Tonga", "Micronesia", "Palau", "Tuvalu", "Nauru"],
    "Antarctica": ["Antarctica"]
};

// Generating complete lists (Mock but complete view for UI logic)
const allIndianStates = [
    "Andaman and Nicobar", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli",
    "Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala",
    "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
    "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

// Helper to generate generic massive lists if specific one is missing
const generateGenericList = (prefix, count) => Array.from({ length: count }, (_, i) => `${prefix} ${i + 1}`);

const countriesData = {
    "India": allIndianStates,
    "United States": ["California", "Texas", "New York", "Florida", "Illinois", "Washington", "Nevada", "Ohio", "Georgia", "North Carolina", "Michigan", "New Jersey", "Virginia", "Pennsylvania", "Massachusetts", "Indiana", "Arizona", "Tennessee", "Missouri", "Maryland"],
    "Canada": ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan", "Nova Scotia", "New Brunswick", "Newfoundland and Labrador", "Prince Edward Island"],
    "Australia": ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Northern Territory", "Australian Capital Territory"],
    "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"]
};

// Extensive District/State Data for demo purposes
const statesData = {
    "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Banda", "Bara Banki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
    "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
    "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"]
};

// Generic Zone lists to ensure ALL districts have something
const districtsData = {
    "Agra": ["East Zone", "West Zone", "North Zone", "South Zone", "Central Zone"],
    "Jaipur": ["Zone 1", "Zone 2", "Zone 3", "Zone 4", "Zone 5", "Zone 6", "Zone 7", "Zone 8"],
    "Lucknow": ["Gomti Nagar Zone", "Alambagh Zone", "Hazratganj Zone", "Indira Nagar Zone", "Ashiyana Zone", "Cantonment Zone"],
};

// Depth Map to logically determine which dropdowns to show
const depthMap = {
    "Global": 0,
    "Continent": 1,
    "Country": 2,
    "State": 3,
    "District": 4,
    "Zone": 5,
    "School": 6
};

// --- MAIN COMPONENT ---
export default function Locations() {
    const [places, setPlaces] = useState([]);
    const [breadcrumbs, setBreadcrumbs] = useState([]);

    const [newPlace, setNewPlace] = useState({
        name: "",
        place_type: "Continent",
        space_type: "Physical",
        place_uses_for: "None",
        pin_code: "",
        zip_code: "",
        beat_no: "",
        village_code: "",
        virtual_id: "",
        google_map_id: "",
        latitude: "",
        longitude: "",
        work_status: "Ministerial Office",
        status: "ACTIVE"
    });

    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loadingId, setLoadingId] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    // ✅ NEW: Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    // --- SEQUENTIAL CASCADING STATES ---
    const [selectedContinent, setSelectedContinent] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedZone, setSelectedZone] = useState("");

    const currentDepth = depthMap[newPlace.place_type] || 0;

    // Reset handlers to clear lower dependencies when a higher dependency changes
    const handleContinentChange = (e) => {
        setSelectedContinent(e.target.value);
        setSelectedCountry(""); setSelectedState(""); setSelectedDistrict(""); setSelectedZone("");
    };
    const handleCountryChange = (e) => {
        setSelectedCountry(e.target.value);
        setSelectedState(""); setSelectedDistrict(""); setSelectedZone("");
    };
    const handleStateChange = (e) => {
        setSelectedState(e.target.value);
        setSelectedDistrict(""); setSelectedZone("");
    };
    const handleDistrictChange = (e) => {
        setSelectedDistrict(e.target.value);
        setSelectedZone("");
    };

    // Helper Functions to Fetch Dropdown Options Dynamically
    const getCountryOptions = () => continentsData[selectedContinent] || generateGenericList(`${selectedContinent} Country`, 20);
    const getStateOptions = () => countriesData[selectedCountry] || generateGenericList(`${selectedCountry} State`, 30);
    const getDistrictOptions = () => statesData[selectedState] || generateGenericList(`${selectedState} District`, 40);
    const getZoneOptions = () => districtsData[selectedDistrict] || generateGenericList(`${selectedDistrict} Zone`, 10);


    useEffect(() => {
        fetchPlaces(null);
        setSelectedIds([]);
    }, []);

    const fetchPlaces = async (parentId) => {
        try {
            let url = parentId ? `locations/places/${parentId}/children/` : "locations/places/roots/";
            const res = await api.get(url);
            setPlaces(Array.isArray(res.data) ? res.data : []);
            setSelectedIds([]);
            setCurrentPage(1); // ✅ Reset pagination to page 1 on fetch
        } catch (err) {
            setPlaces([]);
        }
    };

    const handleEnter = (place) => {
        setBreadcrumbs([...breadcrumbs, place]);
        fetchPlaces(place.id);
    };

    const handleBack = () => {
        const newBreadcrumbs = [...breadcrumbs];
        newBreadcrumbs.pop();
        setBreadcrumbs(newBreadcrumbs);
        const parentId = newBreadcrumbs.length > 0 ? newBreadcrumbs[newBreadcrumbs.length - 1].id : null;
        fetchPlaces(parentId);
    };

    const addPlace = async (e) => {
        e.preventDefault();
        if (!newPlace.name) return toast.error("Please enter a location/syllabus name");

        if (!agreedToTerms) return toast.error("You must agree to the Terms and Conditions!");

        setLoadingId('addPlace');
        try {
            const parentId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null;

            const payload = { ...newPlace, parent: parentId };
            Object.keys(payload).forEach(key => {
                if (payload[key] === "" || payload[key] === "None") {
                    delete payload[key];
                }
            });

            await api.post("locations/places/", payload);
            toast.success(`${newPlace.place_type} Added Successfully!`);

            setNewPlace({
                name: "", place_type: "Continent", space_type: "Physical", place_uses_for: "None",
                pin_code: "", zip_code: "", beat_no: "", village_code: "", virtual_id: "",
                google_map_id: "", latitude: "", longitude: "", work_status: "Ministerial Office",
                status: "ACTIVE"
            });
            setAgreedToTerms(false);
            fetchPlaces(parentId);
        } catch (err) {
            let errorMsg = "Error adding location.";
            if (err.response && err.response.data) {
                const data = err.response.data;
                const firstKey = Object.keys(data)[0];
                errorMsg = Array.isArray(data[firstKey]) ? `${firstKey}: ${data[firstKey][0]}` : `${firstKey}: ${data[firstKey]}`;
            }
            toast.error(`Error: ${errorMsg}`);
        }
        setLoadingId(null);
    };

    const deleteItem = async (id) => {
        if (!window.confirm("Delete this item?")) return;
        try {
            await api.delete(`locations/places/${id}/`);
            toast.success("Deleted");
            const parentId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null;
            fetchPlaces(parentId);
        } catch (err) { toast.error("Delete failed"); }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === places.length) setSelectedIds([]);
        else setSelectedIds(places.map(p => p.id));
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.length} locations permanently?`)) return;
        const loadToast = toast.loading(`Deleting ${selectedIds.length} items...`);
        try {
            await Promise.all(selectedIds.map(id => api.delete(`locations/places/${id}/`)));
            toast.success(`Successfully deleted ${selectedIds.length} items!`, { id: loadToast });
            const parentId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null;
            fetchPlaces(parentId);
        } catch (err) {
            toast.error("Some items failed to delete.", { id: loadToast });
        }
    };

    const handleBulkStatus = async (newStatus) => {
        const loadToast = toast.loading(`Updating status...`);
        try {
            await Promise.all(selectedIds.map(id => api.patch(`locations/places/${id}/`, { status: newStatus })));
            toast.success(`Status updated!`, { id: loadToast });
            const parentId = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].id : null;
            fetchPlaces(parentId);
        } catch (err) {
            let errorMsg = "Status update failed.";
            if (err.response && err.response.data) {
                const data = err.response.data;
                const firstKey = Object.keys(data)[0];
                errorMsg = Array.isArray(data[firstKey]) ? `${firstKey}: ${data[firstKey][0]}` : `${firstKey}: ${data[firstKey]}`;
            }
            toast.error(`Error: ${errorMsg}`, { id: loadToast });
        }
    };

    const currentLevelName = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : "Global";

    // ✅ NEW: Pagination Math (Strictly 6 items per page)
    const recordsPerPage = 6;
    const totalPages = Math.ceil(places.length / recordsPerPage);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = places.slice(indexOfFirstRecord, indexOfLastRecord);

    return (
        <div style={{ display: "flex", background: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
            <SidebarModern />
            <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', background: '#1e293b', color: '#fff' } }} />

            <div className="locations-main-view hide-scrollbar">
                <div style={{ position: 'fixed', top: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                <div className="locations-header">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            {breadcrumbs.length > 0 && (
                                <button onClick={handleBack} style={{ background: 'white', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}><ArrowLeft size={18} color="#4f46e5" /></button>
                            )}
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px' }}>{currentLevelName} Directory</span>
                        </div>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px', margin: 0 }}>
                            Place Master <span style={{ fontSize: '2rem', verticalAlign: 'middle' }}>🌍</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1.05rem', fontWeight: '500', marginTop: '5px' }}>Advanced Global Hierarchy & Space Control.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <GradientStat label="Sub-Regions" value={places.length} icon={<Layers size={18} />} color="linear-gradient(135deg, #6366f1, #4f46e5)" />
                    </div>
                </div>

                <div className="locations-content-grid">

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        <GlassCard style={{ padding: '25px', borderLeft: '5px solid #6366f1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ padding: '10px', borderRadius: '12px', background: '#eef2ff', color: '#4f46e5' }}><Plus size={20} /></div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#1e293b' }}>Add in {currentLevelName}</h3>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Super Admin Place Configuration</p>
                                </div>
                            </div>

                            <form onSubmit={addPlace} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                                <div className="form-row">
                                    <input placeholder="Location / Item Name" value={newPlace.name} onChange={e => setNewPlace({ ...newPlace, name: e.target.value })} style={inputStyle} />
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <select value={newPlace.place_type} onChange={e => setNewPlace({ ...newPlace, place_type: e.target.value })} style={{ ...inputStyle, appearance: 'none' }}>
                                            <optgroup label="Location Hierarchy">
                                                <option value="Global">Global</option>
                                                <option value="Continent">Continent</option>
                                                <option value="Country">Country</option>
                                                <option value="State">State</option>
                                                <option value="District">District</option>
                                                <option value="Zone">Zone</option>
                                                <option value="School">School</option>
                                            </optgroup>
                                            <optgroup label="Syllabus Hierarchy">
                                                <option value="Class">Class</option>
                                                <option value="Subject">Subject</option>
                                                <option value="Unit">Unit</option>
                                                <option value="Chapter">Chapter</option>
                                                <option value="Topic">Topic</option>
                                            </optgroup>
                                        </select>
                                        <ChevronDown size={18} className="select-icon" />
                                    </div>
                                </div>

                                {/* --- TRUE CONDITIONAL CASCADING DROPDOWNS CHAIN --- */}

                                {/* Row 1: Continent and Country */}
                                {currentDepth >= 1 && (
                                    <div className="form-row">
                                        {/* 1. Continent Dropdown appears first */}
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <select value={selectedContinent} onChange={handleContinentChange} style={{ ...inputStyle, appearance: 'none', border: '2px solid #818cf8', background: '#eef2ff' }}>
                                                <option value="">-- Select Continent --</option>
                                                {Object.keys(continentsData).map(cont => <option key={cont} value={cont}>{cont}</option>)}
                                            </select>
                                            <ChevronDown size={18} className="select-icon" />
                                        </div>

                                        {/* 2. Country Dropdown appears ONLY when Continent is selected */}
                                        {currentDepth >= 2 && selectedContinent && (
                                            <div style={{ position: 'relative', flex: 1 }}>
                                                <select value={selectedCountry} onChange={handleCountryChange} style={{ ...inputStyle, appearance: 'none', border: '2px solid #34d399', background: '#ecfdf5' }}>
                                                    <option value="">-- Select Country --</option>
                                                    {getCountryOptions().map(country => <option key={country} value={country}>{country}</option>)}
                                                </select>
                                                <ChevronDown size={18} className="select-icon" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Row 2: State and District */}
                                {currentDepth >= 3 && selectedCountry && (
                                    <div className="form-row">
                                        {/* 3. State Dropdown appears ONLY when Country is selected */}
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <select value={selectedState} onChange={handleStateChange} style={{ ...inputStyle, appearance: 'none', border: '2px solid #fbbf24', background: '#fffbeb' }}>
                                                <option value="">-- Select State --</option>
                                                {getStateOptions().map(state => <option key={state} value={state}>{state}</option>)}
                                            </select>
                                            <ChevronDown size={18} className="select-icon" />
                                        </div>

                                        {/* 4. District Dropdown appears ONLY when State is selected */}
                                        {currentDepth >= 4 && selectedState && (
                                            <div style={{ position: 'relative', flex: 1 }}>
                                                <select value={selectedDistrict} onChange={handleDistrictChange} style={{ ...inputStyle, appearance: 'none', border: '2px solid #f472b6', background: '#fdf2f8' }}>
                                                    <option value="">-- Select District --</option>
                                                    {getDistrictOptions().map(district => <option key={district} value={district}>{district}</option>)}
                                                </select>
                                                <ChevronDown size={18} className="select-icon" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Row 3: Zone */}
                                {currentDepth >= 5 && selectedDistrict && (
                                    <div className="form-row">
                                        {/* 5. Zone Dropdown appears ONLY when District is selected */}
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)} style={{ ...inputStyle, appearance: 'none', border: '2px solid #a78bfa', background: '#f5f3ff' }}>
                                                <option value="">-- Select Zone --</option>
                                                {getZoneOptions().map(zone => <option key={zone} value={zone}>{zone}</option>)}
                                            </select>
                                            <ChevronDown size={18} className="select-icon" />
                                        </div>
                                        <div style={{ flex: 1 }}></div> {/* Empty space to keep width 50% */}
                                    </div>
                                )}


                                <div className="form-row">
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <select value={newPlace.space_type} onChange={e => setNewPlace({ ...newPlace, space_type: e.target.value })} style={{ ...inputStyle, appearance: 'none', color: '#4f46e5' }}>
                                            <option value="Physical">Physical Space</option>
                                            <option value="Virtual">Virtual Space</option>
                                        </select>
                                        <ChevronDown size={18} className="select-icon" />
                                    </div>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <select value={newPlace.place_uses_for} onChange={e => setNewPlace({ ...newPlace, place_uses_for: e.target.value })} style={{ ...inputStyle, appearance: 'none' }}>
                                            <option value="None">-- Uses For --</option>
                                            <option value="Foundation (3-8 Yrs)">Foundation (3-8 Yrs)</option>
                                            <option value="Preparatory (8-11 Yrs)">Preparatory (8-11 Yrs)</option>
                                            <option value="Middle (11-14 Yrs)">Middle (11-14 Yrs)</option>
                                            <option value="Secondary (14-18 Yrs)">Secondary (14-18 Yrs)</option>
                                            <option value="Higher Classes">Higher Classes</option>
                                            <option value="PHD Plus">PHD Plus</option>
                                            <option value="Professional">Professional</option>
                                            <option value="Technical">Technical</option>
                                            <option value="Vocational">Vocational</option>
                                            <option value="Academic Professional">Academic Professional</option>
                                            <option value="Academic and Technical">Academic & Technical</option>
                                            <option value="Others">Others</option>
                                        </select>
                                        <ChevronDown size={18} className="select-icon" />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <input placeholder="PIN Code" value={newPlace.pin_code} onChange={e => setNewPlace({ ...newPlace, pin_code: e.target.value })} style={inputStyle} />
                                    <input placeholder="ZIP Code" value={newPlace.zip_code} onChange={e => setNewPlace({ ...newPlace, zip_code: e.target.value })} style={inputStyle} />
                                </div>

                                <div className="form-row">
                                    <input placeholder="Beat No." value={newPlace.beat_no} onChange={e => setNewPlace({ ...newPlace, beat_no: e.target.value })} style={inputStyle} />
                                    <input placeholder="Village Code" value={newPlace.village_code} onChange={e => setNewPlace({ ...newPlace, village_code: e.target.value })} style={inputStyle} />
                                </div>

                                <div className="form-row">
                                    <input placeholder="Virtual ID" value={newPlace.virtual_id} onChange={e => setNewPlace({ ...newPlace, virtual_id: e.target.value })} style={inputStyle} />
                                    <input placeholder="Google Map Virtual ID" value={newPlace.google_map_id} onChange={e => setNewPlace({ ...newPlace, google_map_id: e.target.value })} style={inputStyle} />
                                </div>

                                <div className="form-row">
                                    <input placeholder="Latitude" value={newPlace.latitude} onChange={e => setNewPlace({ ...newPlace, latitude: e.target.value })} style={inputStyle} />
                                    <input placeholder="Longitude" value={newPlace.longitude} onChange={e => setNewPlace({ ...newPlace, longitude: e.target.value })} style={inputStyle} />
                                </div>

                                <div className="form-row">
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <select value={newPlace.work_status} onChange={e => setNewPlace({ ...newPlace, work_status: e.target.value })} style={{ ...inputStyle, appearance: 'none' }}>
                                            <option value="Ministerial Office">Ministerial Office</option>
                                            <option value="Working Fields">Working Fields</option>
                                            <option value="Both">Both (Office + Field)</option>
                                            <option value="None">None</option>
                                        </select>
                                        <ChevronDown size={18} className="select-icon" />
                                    </div>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <select value={newPlace.status} onChange={e => setNewPlace({ ...newPlace, status: e.target.value })} style={{ ...inputStyle, appearance: 'none' }}>
                                            <option value="ACTIVE">Active / Show</option>
                                            <option value="INACTIVE">Inactive / Hide</option>
                                        </select>
                                        <ChevronDown size={18} className="select-icon" />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '10px', padding: '10px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <input
                                        type="checkbox"
                                        id="termsCheck"
                                        checked={agreedToTerms}
                                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                                        style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#6366f1', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="termsCheck" style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', cursor: 'pointer' }}>
                                        I AM AGREE WITH ALL TERMS AND CONDITIONS OF THIS WEBSITE 1 PLACE 2 SERVICES. 3 USERS. I AM AGREED WITH ALL OF THEM.
                                    </label>
                                </div>

                                <motion.button whileTap={{ scale: 0.98 }} type="submit" style={{ ...btnPrimary, width: '100%', marginTop: '5px' }}>
                                    {loadingId === 'addPlace' ? <Sparkles size={20} className="spin" /> : <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Save size={18} /> Save Master Place</span>}
                                </motion.button>
                            </form>
                        </GlassCard>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingLeft: '5px', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <LayoutList size={22} color="#64748b" />
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#334155', margin: 0 }}>Explore Hierarchy</h3>
                            </div>

                            {places.length > 0 && (
                                <button
                                    onClick={handleSelectAll}
                                    style={{ background: 'white', border: '1px solid #cbd5e1', padding: '8px 15px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    {selectedIds.length === places.length ? <CheckSquare size={16} color="#6366f1" /> : <span style={{ width: '14px', height: '14px', border: '2px solid #cbd5e1', borderRadius: '4px' }}></span>}
                                    {selectedIds.length === places.length ? "Deselect All" : "Select All"}
                                </button>
                            )}
                        </div>

                        <AnimatePresence>
                            {selectedIds.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    style={{ background: '#1e293b', padding: '12px 20px', borderRadius: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', flexWrap: 'wrap', gap: '10px' }}
                                >
                                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{selectedIds.length} Selected</span>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        <button onClick={() => handleBulkStatus('ACTIVE')} style={bulkBtnStyle} title="Activate"><Check size={16} /> Activate</button>
                                        <button onClick={() => handleBulkStatus('INACTIVE')} style={bulkBtnStyle} title="Hide / Deactivate"><EyeOff size={16} /> Hide</button>
                                        <button onClick={handleBulkDelete} style={{ ...bulkBtnStyle, background: '#ef4444', border: 'none' }} title="Delete Selected"><Trash2 size={16} color="white" /> Delete</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '24px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06)', border: '1px solid rgba(255, 255, 255, 0.6)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '16px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '50px' }}>
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={places.length > 0 && selectedIds.length === places.length}
                                                style={{ cursor: 'pointer', accentColor: '#6366f1' }}
                                            />
                                        </th>
                                        <th style={{ padding: '16px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '60px' }}>S.No.</th>
                                        <th style={{ padding: '16px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>Name</th>
                                        <th style={{ padding: '16px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>Type & Details</th>
                                        <th style={{ padding: '16px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>Status</th>
                                        <th style={{ padding: '16px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem', width: '180px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {currentRecords.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                                                    <MapPin size={48} strokeWidth={1.5} style={{ marginBottom: '15px', opacity: 0.5, display: 'inline-block' }} />
                                                    <p style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>Empty Region.</p>
                                                    <p style={{ fontSize: '0.9rem', margin: 0 }}>Add sub-locations to this territory.</p>
                                                </td>
                                            </tr>
                                        ) : currentRecords.map((place, index) => (
                                            <motion.tr
                                                key={place.id}
                                                layout
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                style={{
                                                    background: selectedIds.includes(place.id) ? '#eef2ff' : 'transparent',
                                                    borderBottom: '1px solid #f1f5f9',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <td style={{ padding: '16px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(place.id)}
                                                        onChange={() => toggleSelect(place.id)}
                                                        style={{ cursor: 'pointer', accentColor: '#6366f1' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '16px', fontWeight: '800', color: '#475569', fontSize: '0.9rem' }}>
                                                    {indexOfFirstRecord + index + 1}. {/* ✅ Updated so sequence continues on page 2 */}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: place.children_count > 0 ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : '#f1f5f9', color: place.children_count > 0 ? 'white' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', cursor: 'pointer' }} onClick={() => handleEnter(place)}>
                                                            {place.place_type === 'Country' ? '🇮🇳' : <MapIcon size={16} />}
                                                        </div>
                                                        <div style={{ cursor: 'pointer' }} onClick={() => handleEnter(place)}>
                                                            <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1rem' }}>{place.name}</div>
                                                            {place.virtual_id && (
                                                                <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: '#fef3c7', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>VID: {place.virtual_id}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{place.place_type}</span>
                                                            {place.space_type && <span style={{ background: '#eef2ff', color: '#4f46e5', padding: '2px 6px', borderRadius: '4px' }}>{place.space_type}</span>}
                                                        </div>
                                                        {place.place_uses_for && place.place_uses_for !== "None" && <span>• {place.place_uses_for}</span>}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    {place.status && (
                                                        <span style={{ color: place.status?.toUpperCase() === 'ACTIVE' ? '#10b981' : '#ef4444', fontWeight: '700', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '8px', background: place.status?.toUpperCase() === 'ACTIVE' ? '#ecfdf5' : '#fef2f2' }}>
                                                            {place.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => handleEnter(place)}
                                                            style={{ padding: '6px 12px', background: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                                                        >
                                                            Explore
                                                        </button>
                                                        <button
                                                            onClick={() => deleteItem(place.id)}
                                                            style={{ padding: '6px 12px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>

                            {/* ✅ NEW: Pagination Controls UI */}
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px 20px', gap: '15px', borderTop: '1px solid #f1f5f9', background: 'white' }}>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', color: currentPage === 1 ? '#94a3b8' : '#334155', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', transition: '0.2s' }}
                                    >
                                        <ChevronLeft size={16} /> Prev
                                    </button>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f8fafc' : 'white', color: currentPage === totalPages ? '#94a3b8' : '#334155', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', transition: '0.2s' }}
                                    >
                                        Next <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }

        .locations-main-view { 
            flex: 1; 
            margin-left: 280px; 
            padding: 35px; 
            height: 100vh; 
            overflow-y: auto; 
            position: relative; 
            box-sizing: border-box; 
            transition: all 0.3s ease; 
            min-width: 0; 
        }
        
        .locations-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px; flex-wrap: wrap; gap: 20px; }
        
        .locations-content-grid { 
            display: grid; 
            grid-template-columns: 400px minmax(0, 1fr); 
            gap: 35px; 
            padding-bottom: 20px; 
            align-items: start; 
        }
        
        .form-row { display: flex; gap: 12px; width: 100%; }
        .form-row > input, .form-row > div { flex: 1; min-width: 0; box-sizing: border-box; }
        .select-icon { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }

        /* Tablet/Medium Desktop */
        @media (max-width: 1200px) {
            .locations-content-grid { grid-template-columns: 320px minmax(0, 1fr); gap: 20px; }
        }

        /* Mobile / Tablet Portrait */
        @media (max-width: 850px) {
            .locations-main-view { 
                margin-left: 0 !important; 
                padding: 15px !important; 
                padding-top: 90px !important; 
                width: 100% !important; 
            }
            .locations-header { flex-direction: column; align-items: flex-start; gap: 20px; }
            .locations-content-grid { grid-template-columns: 1fr; gap: 25px; }
            
            /* Render form ABOVE the table on mobile */
            .locations-content-grid > div:first-child { order: -1; }
            
            /* FIXED FOR SQUISHED SIDE-BY-SIDE FIELDS ON MOBILE */
            .form-row { flex-direction: column; gap: 12px; }
            .form-row > input, .form-row > div { width: 100%; }
            .form-row > div:empty { display: none; } /* Hides the empty space on odd fields so it looks clean */
        }
      `}</style>
        </div>
    );
}

// --- STYLES ---
const inputStyle = {
    width: '100%', padding: '12px 15px', borderRadius: '12px',
    border: '2px solid #f1f5f9', outline: 'none', background: '#f8fafc',
    fontSize: '0.85rem', color: '#1e293b', fontWeight: '600', transition: 'all 0.2s', boxSizing: 'border-box'
};

const btnPrimary = {
    height: '48px', border: 'none', borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)', fontWeight: 'bold', fontSize: '0.95rem'
};

const bulkBtnStyle = {
    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
    color: 'white', padding: '6px 12px', borderRadius: '8px',
    fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s'
};