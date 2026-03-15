import { useState } from 'react';
import { PageLoader, EmptyState, Modal, Alert, StatusBadge, Spinner } from '../components/ui/index.jsx';
import { useFetch } from '../hooks/useFetch';
import api from '../services/api';

const today = () => new Date().toISOString().split('T')[0];
const firstOfMonth = () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; };
const fmt = n => '₹' + Number(n||0).toLocaleString('en-IN');

export default function InvoicesPage({ toast }) {
  const { data, loading, refetch } = useFetch('/invoices');
  const { data: clientsData } = useFetch('/clients');
  const invoices = data || [];
  const clients  = clientsData || [];

  const [modal,  setModal]  = useState(false);
  const [form,   setForm]   = useState({ clientCode:'', fromDate: firstOfMonth(), toDate: today(), gstPercent:'18', notes:'' });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const create = async () => {
    if (!form.clientCode) { setErr('Select a client'); return; }
    setSaving(true); setErr('');
    try {
      const r = await api.post('/invoices', form);
      const inv = r?.data || r;
      await refetch();
      setModal(false);
      toast?.success?.(`Invoice ${inv.invoiceNo} created ✓`);
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/invoices/${id}/status`, { status });
      await refetch();
      toast?.success?.(`Marked as ${status}`);
    } catch (e) { toast?.error?.(e.message); }
  };

  const STATUS_ACTIONS = {
    DRAFT: { label:'📤 Mark Sent', next:'SENT', cls:'btn-navy' },
    SENT:  { label:'✅ Mark Paid', next:'PAID', cls:'btn-success' },
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-sub">{invoices.length} invoices total</p>
        </div>
        <button onClick={() => setModal(true)} className="btn btn-orange btn-sm">➕ Create Invoice</button>
      </div>
      {loading ? <PageLoader/> : (
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Invoice No.</th><th>Client</th><th>Period</th><th>Items</th><th>Subtotal</th><th>GST</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {invoices.length > 0 ? invoices.map(inv => (
                <tr key={inv.id}>
                  <td><span className="font-mono font-bold text-navy-700">{inv.invoiceNo}</span></td>
                  <td>{inv.client?.company || inv.clientCode}</td>
                  <td className="text-xs text-gray-500">{inv.fromDate} → {inv.toDate}</td>
                  <td>{inv._count?.items ?? inv.items?.length ?? 0}</td>
                  <td>{fmt(inv.subtotal)}</td>
                  <td>{inv.gstPercent}%</td>
                  <td className="font-bold">{fmt(inv.total)}</td>
                  <td><StatusBadge status={inv.status}/></td>
                  <td>
                    {STATUS_ACTIONS[inv.status] && (
                      <button onClick={() => updateStatus(inv.id, STATUS_ACTIONS[inv.status].next)}
                        className={`btn ${STATUS_ACTIONS[inv.status].cls} btn-sm`}>
                        {STATUS_ACTIONS[inv.status].label}
                      </button>
                    )}
                  </td>
                </tr>
              )) : <tr><td colSpan={9}><EmptyState icon="🧾" title="No invoices yet" subtitle="Create your first invoice to get started"/></td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <Modal title="Create Invoice" onClose={() => setModal(false)} size="md"
          footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-orange" onClick={create} disabled={saving}>{saving ? <><Spinner size="sm"/>Creating...</> : 'Create Invoice'}</button></>}>
          {err && <Alert type="error">{err}</Alert>}
          <div className="space-y-3">
            <div><label className="label">Client *</label>
              <select className="select" value={form.clientCode} onChange={e => set('clientCode', e.target.value)}>
                <option value="">— Select Client —</option>
                {clients.map(c => <option key={c.id} value={c.code}>{c.code} — {c.company}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">From Date</label><input type="date" className="input" value={form.fromDate} onChange={e => set('fromDate', e.target.value)}/></div>
              <div><label className="label">To Date</label><input type="date" className="input" value={form.toDate} onChange={e => set('toDate', e.target.value)}/></div>
              <div><label className="label">GST %</label><input type="number" className="input" value={form.gstPercent} onChange={e => set('gstPercent', e.target.value)}/></div>
              <div><label className="label">Notes</label><input className="input" value={form.notes} onChange={e => set('notes', e.target.value)}/></div>
            </div>
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">This will create an invoice for all <strong>unbilled shipments</strong> for the selected client within the date range.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
