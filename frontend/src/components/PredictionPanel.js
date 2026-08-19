import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { usePrediction } from '../context/PredictionContext';

/* ── Inline styles matching the reference image ─────────────────── */
const s = {
  page: {
    background: '#c8d0db',
    minHeight: '100%',
    padding: 0,
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
    color: '#1e293b',
  },
  card: {
    background: '#f1f4f8',
    borderRadius: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
    border: '1px solid #e2e8f0',
    marginBottom: 18,
  },
  filterBar: {
    padding: '16px 22px',
  },
  filterTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 14,
  },
  filterRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 14,
    flexWrap: 'wrap',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
    minWidth: 140,
  },
  label: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 500,
  },
  input: {
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 13,
    color: '#1e293b',
    background: '#fff',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    padding: '8px 12px',
    fontSize: 13,
    color: '#1e293b',
    background: '#fff',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  applyBtn: {
    background: '#1e3a5f',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '9px 22px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    letterSpacing: '0.02em',
  },
  resetBtn: {
    background: '#fff',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: 6,
    padding: '9px 18px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
    marginBottom: 18,
  },
  kpiCard: {
    background: '#f1f4f8',
    borderRadius: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
    border: '1px solid #e2e8f0',
    borderTop: '3px solid #1e3a5f',
    padding: '18px 20px 16px',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  kpiValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 5,
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 30,
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1,
  },
  kpiUnit: {
    fontSize: 14,
    fontWeight: 500,
    color: '#334155',
  },
  kpiSub: {
    fontSize: 12,
    color: '#64748b',
    margin: 0,
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 18,
  },
  panelCard: {
    background: '#f1f4f8',
    borderRadius: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
    border: '1px solid #e2e8f0',
    padding: '20px 22px',
  },
  panelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 15,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 18,
  },
  tableHeader: {
    background: '#1e3a5f',
    color: '#ffffff',
    textTransform: 'uppercase',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.07em',
  },
  tableCell: {
    padding: '11px 14px',
    fontSize: 13,
    color: '#334155',
    borderBottom: '1px solid #f1f5f9',
  },
  blueValue: {
    color: '#1d4ed8',
    fontWeight: 600,
  },
  normalBadge: {
    background: '#f0fdf4',
    color: '#16a34a',
    border: '1px solid #bbf7d0',
    borderRadius: 20,
    padding: '2px 10px',
    fontSize: 11,
    fontWeight: 600,
  },
};

const PredictionPanel = () => {
  const { setCurrentFeatures, setLastPrediction } = usePrediction();
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    Relative_Compactness: 0.85,
    Surface_Area: 550,
    Wall_Area: 300,
    Roof_Area: 120,
    Overall_Height: 5.0,
    Orientation: 3,
    Glazing_Area: 0.2,
    Glazing_Distribution: 2,
    Month: 1,
  });
  const [period, setPeriod] = useState({ startDate: today, endDate: today });
  const [buildingType, setBuildingType] = useState('all');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isFullYear = prediction?.Month === 13;
  const dateValid = !period.startDate || !period.endDate || new Date(period.endDate) >= new Date(period.startDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dateValid) {
      toast({ title: 'Invalid Date Range', description: 'End date must be on or after start date', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      const result = await res.json();
      setPrediction(result);
      setCurrentFeatures({ ...form, startDate: period.startDate, endDate: period.endDate });
      setLastPrediction(result);
      toast({ title: 'Prediction Complete', description: 'Energy loads predicted successfully', variant: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to generate prediction', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ Relative_Compactness: 0.85, Surface_Area: 550, Wall_Area: 300, Roof_Area: 120, Overall_Height: 5.0, Orientation: 3, Glazing_Area: 0.2, Glazing_Distribution: 2, Month: 1 });
    setPeriod({ startDate: today, endDate: today });
    setPrediction(null);
  };

  /* chart bar values */
  const hLoad = prediction?.Monthly_Heating_Load ?? 0;
  const cLoad = prediction?.Monthly_Cooling_Load ?? 0;
  const chartMax = Math.max(hLoad, cLoad, 30);
  /* realistic building energy profile:
     night low → morning ramp → 10am peak → lunch dip → 3pm peak → evening drop */
  const HOURLY_PROFILE = [
    0.25, 0.22, 0.20, 0.20, 0.22, 0.35,   // 0–5  night / early morning
    0.52, 0.68, 0.80, 0.88, 0.95, 0.97,   // 6–11 morning ramp + peak
    0.92, 0.85, 0.88, 0.93, 0.90, 0.82,   // 12–17 lunch dip + afternoon peak
    0.72, 0.60, 0.50, 0.42, 0.34, 0.28,   // 18–23 evening wind-down
  ];
  const hourlyBars = prediction
    ? HOURLY_PROFILE.map(f => +((hLoad + cLoad) / 2 * f).toFixed(2))
    : HOURLY_PROFILE.map(f => +(50 * f).toFixed(2));

  const barMax = Math.max(...hourlyBars);

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December','Full Year'];

  return (
    <div style={s.page}>

      {/* ── FILTER BAR ─────────────────────────────────────────────── */}
      <div style={{ ...s.card, ...s.filterBar }}>
        <div style={s.filterTitle}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M7 12h10M11 18h2" stroke="#1e3a5f" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          Filter Building Parameters
        </div>

        <form onSubmit={handleSubmit}>
          {/* Row 1 — primary filters */}
          <div style={s.filterRow}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Building Type</label>
              <select style={s.select} value={buildingType} onChange={e => setBuildingType(e.target.value)}>
                <option value="all">All Buildings</option>
                <option value="industrial">Industrial</option>
                <option value="commercial">Commercial</option>
                <option value="residential">Residential</option>
              </select>
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Building Orientation</label>
              <select style={s.select} value={form.Orientation} onChange={e => setForm({ ...form, Orientation: parseInt(e.target.value) })}>
                <option value={2}>North (2)</option>
                <option value={3}>East (3)</option>
                <option value={4}>South (4)</option>
                <option value={5}>West (5)</option>
              </select>
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Select Month</label>
              <select style={s.select} value={form.Month} onChange={e => setForm({ ...form, Month: parseInt(e.target.value) })}>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <option key={m} value={m}>{MONTHS[m-1]}</option>
                ))}
                <option value={13}>Full Year (Annual)</option>
              </select>
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Start Date</label>
              <input type="date" style={{ ...s.input, borderColor: dateValid ? '#cbd5e1' : '#f87171' }} value={period.startDate} onChange={e => setPeriod({ ...period, startDate: e.target.value })} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>End Date</label>
              <input type="date" style={{ ...s.input, borderColor: dateValid ? '#cbd5e1' : '#f87171' }} value={period.endDate} onChange={e => setPeriod({ ...period, endDate: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} style={{ ...s.applyBtn, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Running…' : 'Apply ✓'}
            </button>
            <button type="button" onClick={handleReset} style={s.resetBtn}>Reset</button>
          </div>

          {/* Row 2 — building params */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginTop: 14 }}>
            {[
              { label: 'Rel. Compactness', key: 'Relative_Compactness', step: '0.01' },
              { label: 'Surface Area (m²)', key: 'Surface_Area' },
              { label: 'Wall Area (m²)', key: 'Wall_Area' },
              { label: 'Roof Area (m²)', key: 'Roof_Area' },
              { label: 'Overall Height (m)', key: 'Overall_Height', step: '0.1' },
              { label: 'Glazing Area', key: 'Glazing_Area', step: '0.01' },
            ].map(({ label, key, step }) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={s.label}>{label}</label>
                <input
                  type="number"
                  step={step}
                  style={s.input}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: step ? parseFloat(e.target.value) : parseInt(e.target.value) })}
                />
              </div>
            ))}
          </div>

          {/* Glazing Distribution */}
          <div style={{ marginTop: 12, maxWidth: 220 }}>
            <label style={s.label}>Glazing Distribution</label>
            <select style={s.select} value={form.Glazing_Distribution} onChange={e => setForm({ ...form, Glazing_Distribution: parseInt(e.target.value) })}>
              <option value={0}>No Glazing (0)</option>
              <option value={1}>North (1)</option>
              <option value={2}>East (2)</option>
              <option value={3}>South (3)</option>
              <option value={4}>West (4)</option>
            </select>
          </div>
        </form>
      </div>

      {/* ── KPI CARDS ────────────────────────────────────────────── */}
      <div style={s.kpiGrid}>
        <div style={s.kpiCard}>
          <div style={s.kpiLabel}>Heating Load</div>
          <div style={s.kpiValueRow}>
            <span style={{ ...s.kpiValue, color: prediction ? '#c2410c' : '#0f172a' }}>
              {prediction ? prediction.Monthly_Heating_Load.toFixed(2) : '—'}
            </span>
            {prediction && <span style={s.kpiUnit}>kWh/m²</span>}
          </div>
          <p style={s.kpiSub}>{prediction ? `Period: ${isFullYear ? 'Full Year' : prediction.Month_Name}` : 'Run prediction to view'}</p>
        </div>

        <div style={s.kpiCard}>
          <div style={s.kpiLabel}>Cooling Load</div>
          <div style={s.kpiValueRow}>
            <span style={{ ...s.kpiValue, color: prediction ? '#0369a1' : '#0f172a' }}>
              {prediction ? prediction.Monthly_Cooling_Load.toFixed(2) : '—'}
            </span>
            {prediction && <span style={s.kpiUnit}>kWh/m²</span>}
          </div>
          <p style={s.kpiSub}>{prediction ? `Total: ${(prediction.Monthly_Heating_Load + prediction.Monthly_Cooling_Load).toFixed(2)} kWh/m²` : 'Run prediction to view'}</p>
        </div>

        <div style={s.kpiCard}>
          <div style={s.kpiLabel}>Compactness &amp; Height</div>
          <div style={s.kpiValueRow}>
            <span style={s.kpiValue}>{form.Relative_Compactness.toFixed(2)}</span>
            <span style={s.kpiUnit}>ratio</span>
          </div>
          <p style={s.kpiSub}>Height: {form.Overall_Height} m &nbsp;|&nbsp; Surface: {form.Surface_Area} m²</p>
        </div>

        <div style={s.kpiCard}>
          <div style={s.kpiLabel}>Glazing &amp; Envelope</div>
          <div style={s.kpiValueRow}>
            <span style={s.kpiValue}>{(form.Glazing_Area * 100).toFixed(0)}%</span>
            <span style={s.kpiUnit}>window ratio</span>
          </div>
          <p style={s.kpiSub}>Wall: {form.Wall_Area} m² &nbsp;|&nbsp; Roof: {form.Roof_Area} m²</p>
        </div>
      </div>

      {/* ── BOTTOM: Chart + Table ─────────────────────────────────── */}
      <div style={s.bottomGrid}>

        {/* Left — Hourly Load Profile Bar Chart */}
        <div style={s.panelCard}>
          <div style={s.panelTitle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 17V7M8 17V11M13 17V5M18 17V9" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {prediction ? `Load Profile — ${prediction.Month_Name}` : 'Load Profile (Hourly Average)'}
          </div>

          {/* Y-axis + bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 180, gap: 2, position: 'relative' }}>
            {/* Y-axis labels */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', paddingRight: 6, textAlign: 'right' }}>
              {[barMax.toFixed(0), (barMax * 0.75).toFixed(0), (barMax * 0.5).toFixed(0), (barMax * 0.25).toFixed(0), '0'].map((v, i) => (
                <span key={i} style={{ fontSize: 9, color: '#94a3b8', lineHeight: 1 }}>{v}</span>
              ))}
            </div>
            {/* Bars */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 2, height: '100%', borderBottom: '1px solid #e2e8f0', borderLeft: '1px solid #e2e8f0', paddingLeft: 2 }}>
              {hourlyBars.map((val, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div
                    title={`Hour ${i}:00 — ${val} kWh`}
                    style={{
                      width: '100%',
                      height: `${(val / barMax) * 100}%`,
                      background: i % 2 === 0 ? '#1e3a5f' : '#2d5a9e',
                      borderRadius: '2px 2px 0 0',
                      transition: 'height 0.6s ease',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* X-axis labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 26, marginTop: 4 }}>
            {[0,6,12,18,23].map(h => (
              <span key={h} style={{ fontSize: 9, color: '#94a3b8' }}>{h}:00</span>
            ))}
          </div>
          {!prediction && (
            <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 8 }}>Run a prediction to update profile</p>
          )}
        </div>

        {/* Right — Historical Readings Table */}
        <div style={s.panelCard}>
          <div style={{ ...s.panelTitle, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#1e3a5f" strokeWidth="1.8"/>
                <path d="M3 9h18M9 21V9" stroke="#1e3a5f" strokeWidth="1.8"/>
              </svg>
              Historical Readings
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Page 1 of 108</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['TIMESTAMP','BUILDING','LOAD (KWH)','TEMP (°C)','OCCUPANTS','STATUS'].map(h => (
                  <th key={h} style={{ ...s.tableCell, color: '#fff', background: '#1e3a5f', fontWeight: 700, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ...(prediction ? [
                  { ts: `${period.startDate} 10:00`, building: ['Industrial','Commercial','Residential'][form.Orientation % 3], load: prediction.Monthly_Heating_Load.toFixed(2), temp: (22 + form.Overall_Height * 0.5).toFixed(1), occ: Math.round(form.Surface_Area / 12), status: 'Predicted' },
                  { ts: `${period.startDate} 14:00`, building: ['Commercial','Residential','Industrial'][form.Orientation % 3], load: prediction.Monthly_Cooling_Load.toFixed(2), temp: (24 + form.Glazing_Area * 5).toFixed(1), occ: Math.round(form.Wall_Area / 6), status: 'Predicted' },
                ] : []),
                { ts: '2026-07-03 12:00', building: 'Industrial',   load: '170.83', temp: '28.4', occ: 49,  status: 'Normal' },
                { ts: '2026-07-03 12:00', building: 'Commercial',   load: '58.42',  temp: '28.4', occ: 56,  status: 'Normal' },
                { ts: '2026-07-03 12:00', building: 'Residential',  load: '7.92',   temp: '28.4', occ: 2,   status: 'Normal' },
                { ts: '2026-07-02 09:00', building: 'Industrial',   load: '162.10', temp: '27.1', occ: 45,  status: 'Normal' },
                { ts: '2026-07-02 09:00', building: 'Commercial',   load: '49.87',  temp: '27.1', occ: 61,  status: 'Normal' },
                { ts: '2026-07-01 06:00', building: 'Residential',  load: '6.54',   temp: '26.8', occ: 3,   status: 'Normal' },
              ].map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                  <td style={s.tableCell}>{row.ts}</td>
                  <td style={s.tableCell}>{row.building}</td>
                  <td style={{ ...s.tableCell, color: '#1d4ed8', fontWeight: 600 }}>{row.load}</td>
                  <td style={s.tableCell}>{row.temp}</td>
                  <td style={s.tableCell}>{row.occ}</td>
                  <td style={s.tableCell}>
                    <span style={{
                      ...s.normalBadge,
                      ...(row.status === 'Predicted' ? { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' } : {})
                    }}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PredictionPanel;
