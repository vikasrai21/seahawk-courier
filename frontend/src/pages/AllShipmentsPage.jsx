import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLoader, StatusBadge, EmptyState, ConfirmDialog, Pagination, Modal } from '../components/ui/index.jsx';
import { useFetch } from '../hooks/useFetch';
import api from '../services/api';

const STATUSES = ['Booked','InTransit','OutForDelivery','Delivered','Delayed','RTO','Cancelled'];
const COURIERS = ['BlueDart','DTDC','FedEx','DHL','Delhivery','Trackon','GEC','LTL','B2B','Other'];
const fmt = n => '₹' + Number(n||0).toLocaleString('en-IN');

export default function AllShipmentsPage({ toast }) {
  const [filters, setFilters] = useState({ q:'', status:'', courier:'', date_from:'', date_to:'', client:'' });
  const [page, setPage]       = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editRow,  setEditRow]  = useState(null);
  const [saving,   setSaving]   = useState(false);

  const buildUrl = useCallback(() => {
    const p = new URLSearchParams({ page, limit: 100 });
    Object.entries(filters).forEach(([k, v]) => { if (v.trim()) p.set(k, v.trim()); });
    return `/shipments?${p}`;
  }, [filters, page]);

  const { data: result, loading, refetch } = useFetch(buildUrl());
  const shipments = result?.data || result || [];
  const pagination = result?.pagination;

  const sf = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/shipments/${toDelete.id}`);
      toast?.success?.(`Deleted ${toDelete.awb}`);
      setToDelete(null);
      refetch();
    } catch (e) { toast?.error?.(e.message); }
    finally { setDeleting(false); }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await api.put(`/shipments/${editRow.id}`, editRow);
      toast?.success?.('Updated');
      setEditRow(null);
      refetch();
    } catch (e) { toast?.error?.(e.message); }
    finally { setSaving(false); }
  };

  const total = shipments.reduce((a, s) => a + (s.amount||0), 0);
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="max-w-full">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="page-title">All Shipments</h1>
          <p className="page-sub">{shipments.length} records · {fmt(total)} total</p>
        </div>
        <Link to="/entry" className="btn btn-orange btn-sm">➕ New Entry</Link>
      </div>

      {/* Filters */}
      <div className="card mb-4 flex flex-wrap gap-3">
        <input className="input flex-1 min-w-[180px]" placeholder="🔍 Search AWB, consignee, destination..." value={filters.q} onChange={e => sf('q', e.target.value)}/>
        <select className="select w-auto" value={filters.status} onChange={e => sf('status', e.target.value)}>
          <option value="">All Statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="select w-auto" value={filters.courier} onChange={e => sf('courier', e.target.value)}>
          <option value="">All Carriers</option>{COURIERS.map(c => <option key={c}>{c}</option>)}
        </select>
        <input className="input w-auto" type="date" value={filters.date_from} onChange={e => sf('date_from', e.target.value)} title="From date"/>
        <input className="input w-auto" type="date" value={filters.date_to}   onChange={e => sf('date_to',   e.target.value)} title="To date"/>
        {hasFilters && <button className="btn btn-secondary btn-sm" onClick={() => { setFilters({ q:'', status:'', courier:'', date_from:'', date_to:'', client:'' }); setPage(1); }}>✕ Clear</button>}
        <button className="btn btn-secondary btn-sm" onClick={refetch}>🔄</button>
      </div>

      {loading ? <PageLoader/> : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr><th>Date</th><th>AWB</th><th>Client</th><th>Consignee</th><th>Destination</th><th>Carrier</th><th>Wt (g)</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {shipments.length > 0 ? shipments.map(s => (
                <tr key={s.id}>
                  <td className="text-gray-500">{s.date}</td>
                  <td><span className="font-mono font-bold text-xs text-navy-700">{s.awb}</span></td>
                  <td>{s.clientCode}</td>
                  <td>{s.consignee || '—'}</td>
                  <td>{s.destination || '—'}</td>
                  <td>{s.courier || '—'}</td>
                  <td>{s.weight ? s.weight.toLocaleString() : '—'}</td>
                  <td className="font-semibold">{fmt(s.amount)}</td>
                  <td><StatusBadge status={s.status}/></td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setEditRow({...s})} className="btn btn-secondary btn-sm !px-2">✏️</button>
                      <button onClick={() => setToDelete(s)} className="btn btn-danger btn-sm !px-2">🗑️</button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={10}><EmptyState icon="📦" title="No shipments found" subtitle={hasFilters ? 'Try clearing your filters' : 'Add your first shipment'}/></td></tr>}
            </tbody>
          </table>
          {pagination && <Pagination page={page} pages={pagination.pages} total={pagination.total} limit={100} onChange={setPage}/>}
        </div>
      )}

      {/* Delete confirm */}
      {toDelete && (
        <ConfirmDialog
          title="Delete Shipment"
          message={`Are you sure you want to delete AWB ${toDelete.awb}? This action cannot be undone.`}
          confirmText="Delete"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}

      {/* Edit modal */}
      {editRow && (
        <Modal title={`Edit Shipment — ${editRow.awb}`} onClose={() => setEditRow(null)} size="lg"
          footer={<><button className="btn btn-secondary" onClick={() => setEditRow(null)}>Cancel</button><button className="btn btn-orange" onClick={handleSaveEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button></>}>
          <div className="grid grid-cols-2 gap-3">
            {[['consignee','Consignee','text'],['destination','Destination','text'],['courier','Carrier (select)','select'],['weight','Weight (g)','number'],['amount','Amount (₹)','number'],['status','Status','select'],['remarks','Remarks','text']].map(([k, lbl, type]) => (
              <div key={k} className={k==='remarks'?'col-span-2':''}>
                <label className="label">{lbl}</label>
                {type === 'select' && k === 'status'
                  ? <select className="select" value={editRow[k]||''} onChange={e => setEditRow(r => ({...r,[k]:e.target.value}))}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
                  : type === 'select' && k === 'courier'
                  ? <select className="select" value={editRow[k]||''} onChange={e => setEditRow(r => ({...r,[k]:e.target.value}))}><option value="">—</option>{COURIERS.map(c=><option key={c}>{c}</option>)}</select>
                  : <input className="input" type={type} value={editRow[k]||''} onChange={e => setEditRow(r => ({...r,[k]:e.target.value}))}/>
                }
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
