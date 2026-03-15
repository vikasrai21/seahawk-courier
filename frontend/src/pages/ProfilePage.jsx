import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from '../components/ui/index.jsx';
import api from '../services/api';

export default function ProfilePage({ toast }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pw, setPw] = useState({ current:'', next:'', confirm:'' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const changePw = async () => {
    if (pw.next !== pw.confirm) { setErr('Passwords do not match'); return; }
    if (pw.next.length < 6) { setErr('Minimum 6 characters'); return; }
    setSaving(true); setErr('');
    try {
      await api.put('/auth/change-password', { currentPassword: pw.current, newPassword: pw.next });
      setPw({ current:'', next:'', confirm:'' });
      toast?.success?.('Password updated ✓');
    } catch (e) { setErr(e.message); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="page-title">My Profile</h1>
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-navy-800 text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{user?.name}</div>
            <div className="text-sm text-gray-500">{user?.email}</div>
            <span className={`badge mt-1 ${user?.role==='ADMIN'?'badge-purple':'badge-blue'}`}>{user?.role}</span>
          </div>
        </div>
      </div>
      <div className="card">
        <h3 className="section-title">Change Password</h3>
        {err && <Alert type="error">{err}</Alert>}
        <div className="space-y-3">
          {[['current','Current Password'],['next','New Password'],['confirm','Confirm New Password']].map(([k,l]) => (
            <div key={k}><label className="label">{l}</label>
              <input type="password" className="input" value={pw[k]} onChange={e => setPw(p => ({...p,[k]:e.target.value}))}/>
            </div>
          ))}
          <button onClick={changePw} disabled={saving} className="btn btn-primary">
            {saving ? <><Spinner size="sm"/>Updating...</> : 'Update Password'}
          </button>
        </div>
      </div>
      <div className="card border border-red-100">
        <h3 className="section-title text-red-600">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-3">Sign out from this device.</p>
        <button onClick={handleLogout} className="btn btn-danger btn-sm">Sign Out</button>
      </div>
    </div>
  );
}
