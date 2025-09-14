import React, { useEffect, useState, useMemo } from "react";

const JURISDICTIONS = ["Alabama", "California", "Texas", "Ontario"];

const LS_KEY = "ifta_calculator_v1";

function defaultRow(jurisdiction = "") {
  return { id: Math.random().toString(36).slice(2, 9), jurisdiction, miles: "", gallons: "", taxRate: "" };
}

export default function App() {
  const [rows, setRows] = useState([defaultRow("")]);

  const numeric = (v) => { if (!v) return 0; const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

  const totals = useMemo(() => {
    const totalMiles = rows.reduce((s, r) => s + numeric(r.miles), 0);
    const totalGallons = rows.reduce((s, r) => s + numeric(r.gallons), 0);
    const fleetMPG = totalGallons ? totalMiles / totalGallons : 0;
    const computed = rows.map(r => {
      const miles = numeric(r.miles), gallons = numeric(r.gallons), tax = numeric(r.taxRate);
      const taxable = fleetMPG ? miles / fleetMPG : 0;
      const net = (taxable - gallons) * tax;
      return { ...r, taxable, net };
    });
    const totalTaxable = computed.reduce((s, r) => s + r.taxable, 0);
    const totalNet = computed.reduce((s, r) => s + r.net, 0);
    return { totalMiles, totalGallons, fleetMPG, computed, totalTaxable, totalNet };
  }, [rows]);

  function updateRow(id, field, val) { setRows(rs => rs.map(r => r.id === id ? { ...r, [field]: val } : r)); }
  function addRow() { setRows(rs => [...rs, defaultRow("")]); }
  function removeRow(id) { setRows(rs => rs.filter(r => r.id !== id)); }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">IFTA Calculator</h1>
      <button onClick={addRow} className="px-3 py-1 bg-blue-600 text-white rounded mb-3">Add Row</button>
      <table className="min-w-full bg-white border">
        <thead><tr><th>Jurisdiction</th><th>Miles</th><th>Gallons</th><th>Tax Rate</th><th>Taxable</th><th>Net Tax</th><th></th></tr></thead>
        <tbody>
          {totals.computed.map(row => (
            <tr key={row.id}>
              <td><input value={row.jurisdiction} onChange={e => updateRow(row.id, "jurisdiction", e.target.value)} /></td>
              <td><input type="number" value={row.miles} onChange={e => updateRow(row.id, "miles", e.target.value)} /></td>
              <td><input type="number" value={row.gallons} onChange={e => updateRow(row.id, "gallons", e.target.value)} /></td>
              <td><input type="number" value={row.taxRate} onChange={e => updateRow(row.id, "taxRate", e.target.value)} /></td>
              <td>{row.taxable.toFixed(2)}</td>
              <td>{row.net.toFixed(2)}</td>
              <td><button onClick={() => removeRow(row.id)} className="text-red-600">X</button></td>
            </tr>
          ))}
          <tr className="font-bold">
            <td>Totals</td>
            <td>{totals.totalMiles}</td>
            <td>{totals.totalGallons}</td>
            <td>-</td>
            <td>{totals.totalTaxable.toFixed(2)}</td>
            <td>{totals.totalNet.toFixed(2)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <p className="mt-3">Fleet MPG: {totals.fleetMPG.toFixed(2)}</p>
    </div>
  );
}
