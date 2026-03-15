import { useState } from 'react';
import { Spinner, Alert } from '../components/ui/index.jsx';
import api from '../services/api';

const STATES = ['Delhi','Haryana','Punjab','Uttar Pradesh','Rajasthan','Uttarakhand','Himachal Pradesh',
  'Jammu & Kashmir','Ladakh','Bihar','Jharkhand','West Bengal','Assam','Meghalaya','Tripura',
  'Arunachal Pradesh','Manipur','Mizoram','Nagaland','Sikkim','Madhya Pradesh','Chhattisgarh',
  'Maharashtra','Goa','Gujarat','Odisha','Andhra Pradesh','Telangana','Karnataka','Tamil Nadu',
  'Kerala','Pondicherry','Andaman & Nicobar'];

const SHIP_TYPES = [
  { value: 'doc',     label: 'Documents (DOX)' },
  { value: 'surface', label: 'Surface / Parcels' },
  { value: 'air',     label: 'Air Cargo' },
];

const fmt = n => n != null ? '₹' + Number(n).toFixed(2) : '—';
const fmtShort = n => n != null ? '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '—';

const LEVEL_COLORS = { economy: 'bg-blue-50 text-blue-700', premium: 'bg-amber-50 text-amber-700' };

export default function RateCalculatorPage({ toast }) {
  const [form, setForm] = useState({ state:'Delhi', district:'', city:'', weight:'', shipType:'doc', level:'all', odaAmt:'' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const calculate = async () => {
    if (!form.weight || isNaN(parseFloat(form.weight))) { toast?.error?.('Please enter a valid weight'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await api.post('/rates/calculate', {
        state:    form.state,
        district: form.district,
        city:     form.city,
        weight:   parseFloat(form.weight),
        shipType: form.shipType,
        level:    form.level,
        odaAmt:   parseFloat(form.odaAmt)||0,
      });
      setResult(r?.data || r);
    } catch (e) {
      setError(e?.message || 'Calculation failed');
    } finally { setLoading(false); }
  };

  const best = result?.results?.[0];

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="page-title">Rate Calculator</h1>
        <p className="page-sub">Real rates from all 17 courier modes — Trackon, DTDC, Delhivery, BlueDart, GEC, LTL, B2B</p>
      </div>

      {/* Input form */}
      <div className="card mb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <label className="label">State *</label>
            <select className="select" value={form.state} onChange={e => set('state', e.target.value)}>
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">District</label>
            <input className="input" placeholder="e.g. Gurgaon" value={form.district} onChange={e => set('district', e.target.value)}/>
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" placeholder="e.g. Mumbai" value={form.city} onChange={e => set('city', e.target.value)}/>
          </div>
          <div>
            <label className="label">Weight (kg) *</label>
            <input className="input" type="number" placeholder="0.5" min="0.001" step="0.001" value={form.weight} onChange={e => set('weight', e.target.value)}/>
          </div>
          <div>
            <label className="label">Type</label>
            <select className="select" value={form.shipType} onChange={e => set('shipType', e.target.value)}>
              {SHIP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Level</label>
            <select className="select" value={form.level} onChange={e => set('level', e.target.value)}>
              <option value="all">All Levels</option>
              <option value="economy">Economy</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div>
            <label className="label">ODA (₹)</label>
            <input className="input" type="number" placeholder="0" min="0" value={form.odaAmt} onChange={e => set('odaAmt', e.target.value)}/>
          </div>
          <div className="flex items-end col-span-2 md:col-span-1">
            <button onClick={calculate} disabled={loading} className="btn btn-orange w-full justify-center">
              {loading ? <Spinner size="sm"/> : '⚡ Calculate'}
            </button>
          </div>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {result && (
        <>
          {/* Zone info */}
          <div className="card mb-4 flex items-center gap-4 flex-wrap bg-navy-50 border-navy-200">
            <div className="text-sm">
              <span className="font-bold text-navy-700">Seahawk Zone: </span>
              <span className="text-navy-800 font-semibold">{result.zone?.seahawkZone}</span>
            </div>
            <div className="text-sm text-gray-600">
              Delhivery Zone: <strong>{result.zone?.delhivery}</strong>
            </div>
            <div className="text-sm text-gray-600">
              DTDC Zone: <strong>{result.zone?.dtdc}</strong>
            </div>
            <div className="text-sm text-gray-600">
              {result.results?.length} courier modes available
            </div>
          </div>

          {/* Best rate highlight */}
          {best && (
            <div className="card mb-4 border-2 border-green-400 bg-green-50">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="text-2xl">🏆</div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-green-700 mb-0.5">Best Margin</div>
                  <div className="text-lg font-bold text-gray-900">{best.label}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs text-gray-500">Our cost</div>
                  <div className="text-2xl font-bold text-navy-800">{fmtShort(best.breakdown?.total)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Sell price</div>
                  <div className="text-2xl font-bold text-orange-600">{fmtShort(best.proposalSell?.total)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Profit</div>
                  <div className="text-2xl font-bold text-green-700">{fmtShort(best.profit)}</div>
                  <div className="text-xs font-semibold text-green-600">{best.margin}% margin</div>
                </div>
              </div>
            </div>
          )}

          {/* All results table */}
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>#</th><th>Courier / Mode</th><th>Level</th><th>Base</th><th>FSC</th><th>Docket</th><th>GST</th>
                  <th>Our Cost</th><th>Sell Price</th><th>Profit</th><th>Margin</th><th>Rate Age</th>
                </tr>
              </thead>
              <tbody>
                {(result.results||[]).map((r, i) => {
                  const bk = r.breakdown;
                  const marginColor = r.margin >= 20 ? 'text-green-700 font-bold' : r.margin >= 10 ? 'text-amber-600' : 'text-red-500';
                  return (
                    <tr key={r.id} className={i === 0 ? 'bg-green-50' : ''}>
                      <td className="text-gray-400">{i+1}</td>
                      <td className="font-semibold text-navy-800">{r.label}</td>
                      <td><span className={`badge text-xs ${r.level === 'premium' ? 'badge-yellow' : 'badge-blue'}`}>{r.level}</span></td>
                      <td>{fmt(bk?.base)}</td>
                      <td><span className="text-xs">{bk?.fscPct}</span><br/><span className="font-semibold">{fmt(bk?.fsc)}</span></td>
                      <td>{bk?.docket ? fmt(bk.docket) : '—'}</td>
                      <td>{fmt(bk?.gst)}</td>
                      <td className="font-bold text-navy-800">{fmt(bk?.total)}</td>
                      <td className="font-bold text-orange-600">{r.proposalSell ? fmt(r.proposalSell.total) : '—'}</td>
                      <td className="font-bold text-green-700">{r.profit != null ? fmt(r.profit) : '—'}</td>
                      <td className={marginColor}>{r.margin != null ? `${r.margin}%` : '—'}</td>
                      <td className={r.rateAge?.stale ? 'text-red-500 text-xs' : 'text-gray-400 text-xs'}>{r.rateAge?.label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">* All amounts include 18% GST. Cost = what we pay carrier. Sell = what we charge client.</p>
        </>
      )}
    </div>
  );
}
