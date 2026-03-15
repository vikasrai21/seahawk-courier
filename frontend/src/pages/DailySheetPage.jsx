import { useEffect, useState } from 'react';
import { PageLoader, StatusBadge, StatCard } from '../components/ui/index.jsx';
import api from '../services/api';

const today = () => new Date().toISOString().split('T')[0];
const fmt = n => '₹' + Number(n||0).toLocaleString('en-IN');

export default function DailySheetPage({ toast }) {
  const [date, setDate] = useState(today());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async (d) => {
    setLoading(true);
    try { const r = await api.get(`/shipments?date_from=${d}&date_to=${d}&limit=500`); setData(r?.data||r||[]); }
    catch (e) { toast?.error?.(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(date); }, [date]);

  const totalAmt = data.reduce((a,s)=>a+(s.amount||0),0);
  const totalWt  = data.reduce((a,s)=>a+(s.weight||0),0);
  const delivered = data.filter(s=>s.status==='Delivered').length;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div><h1 className="page-title">Daily Sheet</h1></div>
        <div className="flex gap-2 items-center">
          <input type="date" className="input w-auto" value={date} onChange={e => setDate(e.target.value)}/>
          <button onClick={() => load(date)} className="btn btn-secondary btn-sm">🔄</button>
          <button onClick={() => window.print()} className="btn btn-secondary btn-sm">🖨️ Print</button>
        </div>
      </div>
      {data.length > 0 && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatCard icon="📦" label="Total Shipments" value={data.length} bgColor="bg-navy-50"/>
          <StatCard icon="✅" label="Delivered"       value={delivered}  bgColor="bg-green-50"/>
          <StatCard icon="💰" label="Total Revenue"   value={fmt(totalAmt)} bgColor="bg-orange-50"/>
          <StatCard icon="⚖️" label="Total Weight"    value={`${(totalWt/1000).toFixed(2)} kg`} bgColor="bg-white"/>
        </div>
      )}
      {loading ? <PageLoader/> : (
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>AWB</th><th>Client</th><th>Dept.</th><th>Consignee</th><th>Destination</th><th>Carrier</th><th>Weight</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {data.length > 0 ? data.map(s => (
                <tr key={s.id}>
                  <td><span className="font-mono font-bold text-xs text-navy-700">{s.awb}</span></td>
                  <td>{s.clientCode}</td><td>{s.department||'—'}</td>
                  <td>{s.consignee||'—'}</td><td>{s.destination||'—'}</td>
                  <td>{s.courier||'—'}</td>
                  <td>{s.weight?(s.weight/1000).toFixed(3)+' kg':'—'}</td>
                  <td className="font-semibold">{fmt(s.amount)}</td>
                  <td><StatusBadge status={s.status}/></td>
                </tr>
              )) : <tr><td colSpan={9} className="text-center py-10 text-gray-400">No shipments on {date}</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
