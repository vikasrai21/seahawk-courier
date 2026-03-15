import { useState } from 'react';
import { PageLoader, EmptyState, Modal, Alert, Spinner } from '../components/ui/index.jsx';
import { useFetch } from '../hooks/useFetch';
import api from '../services/api';

const blank = () => ({ code:'', company:'', contact:'', phone:'', whatsapp:'', email:'', gst:'', address:'', notes:'' });

export default function ClientsPage({ toast }) {
  const { data, loading, refetch } = useFetch('/clients');
  const clients = data || [];
  const [modal, setModal]   = useState(false);
  const [form,  setForm]    = useState(blank());
  const [saving, setSaving] = useState(false);
  const [err,   setErr]     = useState('');
  const [search, setSearch] = useState('');

  const open = (c) => { setForm(c ? {...c} : blank()); setErr(''); setModal(true); };
  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.code.trim() || !form.company.trim()) { setErr('Code and Company are required'); return; }
    setSaving(true); setErr('');
    try {
      await api.post('/clients', { ...form, code: form.code.toUpperCase().trim() });
      await refetch();
      setModal(false);
      toast?.success?.('Client saved ✓');
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const filtered = clients.filter(c =>
    !search || c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-sub">{clients.length} registered clients</p>
        </div>
        <div className="flex gap-2">
          <input className="input w-52" placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)}/>
          <button onClick={() => open(null)} className="btn btn-orange btn-sm">➕ Add Client</button>
        </div>
      </div>
      {loading ? <PageLoader/> : (
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Code</th><th>Company</th><th>Contact</th><th>Phone</th><th>WhatsApp</th><th>Email</th><th>GST</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(c => (
                <tr key={c.id}>
                  <td><span className="font-mono font-bold text-navy-700">{c.code}</span></td>
                  <td className="font-semibold">{c.company}</td>
                  <td>{c.contact||'—'}</td>
                  <td>{c.phone||'—'}</td>
                  <td>{c.whatsapp ? <a href={`https://wa.me/${c.whatsapp.replace(/\D/g,'')}`} target="_blank" className="text-green-600 hover:underline">{c.whatsapp}</a> : '—'}</td>
                  <td>{c.email||'—'}</td>
                  <td className="text-xs font-mono">{c.gst||'—'}</td>
                  <td><button onClick={() => open(c)} className="btn btn-secondary btn-sm">✏️ Edit</button></td>
                </tr>
              )) : <tr><td colSpan={8}><EmptyState icon="👥" title="No clients found"/></td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <Modal title={form.id ? `Edit — ${form.code}` : 'Add New Client'} onClose={() => setModal(false)} size="lg"
          footer={<><button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-orange" onClick={save} disabled={saving}>{saving ? <><Spinner size="sm"/>Saving...</> : 'Save Client'}</button></>}>
          {err && <Alert type="error">{err}</Alert>}
          <div className="grid grid-cols-2 gap-3">
            {[['code','Client Code *','text',!!form.id],['company','Company Name *','text',false],['contact','Contact Person','text',false],['phone','Phone','tel',false],['whatsapp','WhatsApp','tel',false],['email','Email','email',false],['gst','GST Number','text',false],['address','Address','text',false]].map(([k,lbl,type,ro]) => (
              <div key={k}>
                <label className="label">{lbl}</label>
                <input className="input" type={type} value={form[k]||''} readOnly={ro}
                  onChange={e => set(k, k==='code'?e.target.value.toUpperCase():e.target.value)}/>
              </div>
            ))}
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea className="textarea" value={form.notes||''} onChange={e => set('notes', e.target.value)}/>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
