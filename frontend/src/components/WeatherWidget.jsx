import React from "react";
import { CloudSun, MapPin } from "lucide-react";

export default function WeatherWidget() {
  return (
    <div style={{background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "white", padding: "20px", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)", marginBottom: "25px"}}>
        <div style={{display: "flex", alignItems: "center", gap: "15px"}}>
            <CloudSun size={40} strokeWidth={1.5} />
            <div>
                <h2 style={{margin: 0, fontSize: "1.8rem", fontWeight: "800"}}>24Â°C</h2>
                <p style={{margin: 0, opacity: 0.9, fontSize: "0.9rem"}}>Partly Cloudy</p>
            </div>
        </div>
        <div style={{textAlign: "right"}}>
            <div style={{display: "flex", alignItems: "center", gap: "5px", opacity: 0.8, fontSize: "0.85rem", justifyContent: "flex-end"}}>
                <MapPin size={14} /> New Delhi, IN
            </div>
            <div style={{fontSize: "0.75rem", opacity: 0.6, marginTop: "4px"}}>H: 28Â° L: 19Â°</div>
        </div>
    </div>
  );
}