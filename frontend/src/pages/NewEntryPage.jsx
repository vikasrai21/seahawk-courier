import { useEffect, useRef, useState } from 'react';
import { Spinner, StatusBadge, EmptyState } from '../components/ui/index.jsx';
import { useFetch } from '../hooks/useFetch';
import api from '../services/api';

const today = () => new Date().toISOString().split('T')[0];
const COURIERS = ['BlueDart','DTDC','FedEx','DHL','Delhivery','Trackon','GEC','LTL','B2B','Other'];
const STATUSES = ['Booked','InTransit','OutForDelivery','Delivered','Delayed','RTO','Cancelled'];
const SERVICES = ['Standard','Express','Priority','Economy','Same Day','Overnight'];

const blank = () => ({ date: today(), clientCode:'', awb:'', consignee:'', destination:'', courier:'', department:'', weight:'', amount:'', service:'Standard', status:'Booked', remarks:'' });

export default function NewEntryPage({ toast }) {
  const [form, setForm] = useState(blank());
  const [saving, setSaving] = useState(false);
  const [recent, setRecent] = useState([]);
  const awbRef = useRef();

  const { data: clientsData } = useFetch('/clients');
  const clients = clientsData || [];

  const loadRecent = async () => {
    try {
      const r = await api.get('/shipments?limit=8&page=1');
      setRecent(r?.data || r || []);
    } catch { /* silent */ }
  };

  useEffect(() => { loadRecent(); }, []);
  useEffect(() => { awbRef.current?.focus(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async (e) => {
    e?.preventDefault();
    if (!form.awb.trim()) { awbRef.current?.focus(); toast?.error?.('AWB is required'); return; }
    if (!form.clientCode) { toast?.error?.('Client is required'); return; }
    setSaving(true);
    try {
      const r = await api.post('/shipments', { ...form, weight: parseFloat(form.weight)||0, amount: parseFloat(form.amount)||0 });
      const saved = r?.data || r;
      setForm(f => ({ ...blank(), date: f.date, clientCode: f.clientCode, courier: f.courier }));
      await loadRecent();
      toast?.success?.(`✓ Saved: ${saved.awb}`);
      setTimeout(() => awbRef.current?.focus(), 80);
    } catch (err) {
      toast?.error?.(err?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save(); } };

  const FG = ({ label, children, full = false }) => (
    <div className={full ? 'col-span-2' : ''}>
      <label className="label">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="page-title">New Entry</h1>
          <p className="page-sub">⌨️ Press <kbd className="kbd">Enter</kbd> to save · Tab between fields</p>
        </div>
        <button onClick={save} disabled={saving} className="btn btn-orange">
          {saving ? <><Spinner size="sm"/>Saving...</> : '💾 Save Shipment'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Form */}
        <form onSubmit={save} className="card xl:col-span-3" onKeyDown={handleKey}>
          <div className="grid grid-cols-2 gap-3">
            <FG label="Date *"><input type="date" className="input" value={form.date} onChange={e => set('date', e.target.value)}/></FG>
            <FG label="Client *">
              <select className="select" value={form.clientCode} onChange={e => set('clientCode', e.target.value)}>
                <option value="">— Select Client —</option>
                {clients.map(c => <option key={c.id} value={c.code}>{c.code} — {c.company}</option>)}
              </select>
            </FG>
            <FG label="AWB / Docket *" full>
              <input ref={awbRef} className="input font-mono" placeholder="Enter AWB number" value={form.awb}
                onChange={e => set('awb', e.target.value)} autoComplete="off"/>
            </FG>
            <FG label="Consignee Name">
              <input className="input" placeholder="Recipient name" value={form.consignee} onChange={e => set('consignee', e.target.value)}/>
            </FG>
            <FG label="Destination City / Country">
              <input className="input" placeholder="e.g. Mumbai, India or Dubai, UAE" value={form.destination} onChange={e => set('destination', e.target.value)}/>
            </FG>
            <FG label="Carrier">
              <select className="select" value={form.courier} onChange={e => set('courier', e.target.value)}>
                <option value="">— Select —</option>
                {COURIERS.map(c => <option key={c}>{c}</option>)}
              </select>
            </FG>
            <FG label="Department / Reference">
              <input className="input" placeholder="e.g. HR, Finance, INV-001" value={form.department} onChange={e => set('department', e.target.value)}/>
            </FG>
            <FG label="Weight (grams)">
              <input className="input" type="number" placeholder="500" min="0" step="1" value={form.weight} onChange={e => set('weight', e.target.value)}/>
            </FG>
            <FG label="Amount (₹)">
              <input className="input" type="number" placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)}/>
            </FG>
            <FG label="Service Type">
              <select className="select" value={form.service} onChange={e => set('service', e.target.value)}>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </FG>
            <FG label="Status">
              <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </FG>
            <FG label="Remarks" full>
              <input className="input" placeholder="Optional notes or reference" value={form.remarks} onChange={e => set('remarks', e.target.value)}/>
            </FG>
          </div>
          <button type="submit" disabled={saving} className="btn btn-orange w-full justify-center mt-4">
            {saving ? <><Spinner size="sm"/>Saving...</> : '💾 Save Shipment'}
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">Press Enter to save and start the next entry</p>
        </form>

        {/* Recent entries */}
        <div className="card xl:col-span-2">
          <h3 className="section-title">Recent Entries</h3>
          {recent.length > 0 ? (
            <div className="space-y-2">
              {recent.map(s => (
                <div key={s.id} className="p-2.5 rounded-lg bg-gray-50 hover:bg-navy-50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-mono text-xs font-bold text-gray-800">{s.awb}</span>
                    <StatusBadge status={s.status}/>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{s.consignee || '—'} · {s.destination || '—'}</div>
                  <div className="text-xs text-gray-400">{s.clientCode} · {s.courier} · ₹{s.amount}</div>
                </div>
              ))}
            </div>
          ) : <EmptyState icon="📦" title="No entries yet" subtitle="Saved shipments will appear here"/>}
        </div>
      </div>
    </div>
  );
}
