import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PageLoader, StatusBadge, EmptyState } from '../components/ui/index.jsx';
import { useFetch } from '../hooks/useFetch';
import api from '../services/api';

const fmt = n => '₹' + Number(n||0).toLocaleString('en-IN');
const STATUSES = ['Booked','InTransit','OutForDelivery','Delayed','RTO'];

export default function PendingPage({ toast }) {
  const [updating, setUpdating] = useState({});
  const { data: result, loading, refetch } = useFetch('/shipments?status=Booked&limit=200');
  const shipments = result?.data || result || [];

  const markDelivered = async (s) => {
    setUpdating(p => ({ ...p, [s.id]: true }));
    try {
      await api.patch(`/shipments/${s.id}/status`, { status: 'Delivered' });
      toast?.success?.(`✓ ${s.awb} marked Delivered`);
      refetch();
    } catch (e) { toast?.error?.(e.message); }
    finally { setUpdating(p => ({ ...p, [s.id]: false })); }
  };

  const changeStatus = async (s, status) => {
    try {
      await api.patch(`/shipments/${s.id}/status`, { status });
      toast?.success?.(`Updated to ${status}`);
      refetch();
    } catch (e) { toast?.error?.(e.message); }
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Pending Shipments</h1>
          <p className="page-sub">{shipments.length} active · Mark delivered or update status</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refetch} className="btn btn-secondary btn-sm">🔄 Refresh</button>
          <Link to="/entry" className="btn btn-orange btn-sm">➕ New</Link>
        </div>
      </div>
      {loading ? <PageLoader/> : (
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Date</th><th>AWB</th><th>Client</th><th>Consignee</th><th>Destination</th><th>Carrier</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {shipments.length > 0 ? shipments.map(s => (
                <tr key={s.id}>
                  <td className="text-gray-500 text-xs">{s.date}</td>
                  <td><span className="font-mono font-bold text-xs text-navy-700">{s.awb}</span></td>
                  <td>{s.clientCode}</td>
                  <td>{s.consignee || '—'}</td>
                  <td>{s.destination || '—'}</td>
                  <td>{s.courier || '—'}</td>
                  <td className="font-semibold">{fmt(s.amount)}</td>
                  <td>
                    <select className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white" value={s.status} onChange={e => changeStatus(s, e.target.value)}>
                      {STATUSES.map(st => <option key={st}>{st}</option>)}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => markDelivered(s)} disabled={updating[s.id]}
                      className="btn btn-success btn-sm">
                      {updating[s.id] ? '...' : '✅ Delivered'}
                    </button>
                  </td>
                </tr>
              )) : <tr><td colSpan={9}><EmptyState icon="🎉" title="No pending shipments!" subtitle="All caught up"/></td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
