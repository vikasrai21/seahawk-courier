import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from '../components/ui/index.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/dashboard';

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }}/>
      {/* Glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none"/>

      <div className="w-full max-w-sm relative z-10">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Top orange bar */}
          <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-400"/>

          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <img src="/images/logo.png" alt="Sea Hawk Courier"
                className="h-16 object-contain mx-auto mb-4"
                onError={e => { e.target.style.display='none'; }}/>
              <h1 className="text-xl font-bold text-gray-900">Client Portal</h1>
              <p className="text-sm text-gray-400 mt-1">Sea Hawk Courier & Cargo</p>
            </div>

            {error && <Alert type="error">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required autoFocus autoComplete="email"
                />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="btn btn-primary w-full justify-center py-2.5 text-sm mt-2">
                {loading ? <><Spinner size="sm" className="mr-2"/>Signing in...</> : 'Sign In →'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">Portal access is by invitation only.</p>
              <a href="/#cta-band" className="text-xs text-orange-500 hover:text-orange-600 font-semibold mt-1 block">
                Contact us to open an account →
              </a>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors">
            ← Back to seahawkcourier.in
          </a>
        </div>
      </div>
    </div>
  );
}
