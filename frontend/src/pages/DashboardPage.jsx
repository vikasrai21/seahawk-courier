import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatCard, PageLoader, StatusBadge, EmptyState } from '../components/ui/index.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../services/api';

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const greet = () => { const h = new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening'; };
const COLORS = ['#0b1f3a','#e8580a','#0c7a52','#1a3d6e','#b45309','#7c3aed'];

export default function DashboardPage({ toast }) {
  const { user } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/ops/dashboard');
      setData(r.data || r);
    } catch (e) {
      toast?.error?.(e.message || 'Failed to load dashboard');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <PageLoader text="Loading dashboard..."/>;

  const ov = data?.overview || {};

  const stats = [
    { icon:'📦', label:'Shipments Today',  value: ov.todayShipments  || 0, bgColor:'bg-white' },
    { icon:'📅', label:'This Week',        value: ov.weekShipments   || 0, bgColor:'bg-white' },
    { icon:'📊', label:'This Month',       value: ov.monthShipments  || 0, bgColor:'bg-white' },
    { icon:'💰', label:"Today's Revenue",  value: fmt(ov.todayRevenue), bgColor:'bg-orange-50' },
    { icon:'💵', label:'Month Revenue',    value: fmt(ov.monthRevenue), bgColor:'bg-orange-50' },
    { icon:'⏳', label:'Pending',          value: ov.pendingCount    || 0, bgColor:'bg-amber-50' },
    { icon:'✅', label:'Delivered (Month)',value: ov.deliveredCount  || 0, bgColor:'bg-green-50' },
    { icon:'🎯', label:'Delivery Rate',    value: `${ov.deliveryRate || 0}%`, bgColor:'bg-green-50' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greet()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">{today}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn btn-secondary btn-sm">🔄 Refresh</button>
          <Link to="/entry" className="btn btn-orange btn-sm">➕ New Entry</Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {stats.map(s => <StatCard key={s.label} {...s}/>)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Carrier breakdown */}
        <div className="card">
          <h3 className="section-title">Shipments by Carrier — This Month</h3>
          {(data?.topCouriers||[]).length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.topCouriers} margin={{ top:4, right:4, left:-10, bottom:0 }}>
                <XAxis dataKey="courier" tick={{ fontSize:10 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:10 }} axisLine={false} tickLine={false}/>
                <Tooltip formatter={(v, n) => n === 'count' ? [v, 'Shipments'] : [fmt(v), 'Revenue']}
                  contentStyle={{ borderRadius:8, border:'1px solid #e5e7eb', fontSize:11 }}/>
                <Bar dataKey="count" radius={[4,4,0,0]} name="count">
                  {(data.topCouriers||[]).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState icon="📊" title="No shipments this month"/>}
        </div>

        {/* Top clients */}
        <div className="card">
          <h3 className="section-title">Top Clients by Revenue — This Month</h3>
          {(data?.topClients||[]).length > 0 ? (
            <div className="space-y-2.5 mt-2">
              {data.topClients.map((c, i) => (
                <div key={c.code} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}>{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-800 truncate">{c.company}</div>
                    <div className="text-[10px] text-gray-400">{c.count} shipments</div>
                  </div>
                  <div className="text-xs font-bold text-gray-900 flex-shrink-0">{fmt(c.revenue)}</div>
                </div>
              ))}
            </div>
          ) : <EmptyState icon="👥" title="No client data"/>}
        </div>
      </div>

      {/* Recent Activity + Daily Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent shipments */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title !mb-0">Recent Activity</h3>
            <Link to="/all" className="text-xs text-orange-500 font-semibold hover:text-orange-600">View all →</Link>
          </div>
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>AWB</th><th>Client</th><th>Destination</th><th>Carrier</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {(data?.recentShipments||[]).length > 0
                  ? data.recentShipments.map(s => (
                    <tr key={s.id}>
                      <td className="font-mono font-bold text-xs">{s.awb}</td>
                      <td>{s.clientCode}</td>
                      <td>{s.destination}</td>
                      <td>{s.courier}</td>
                      <td className="font-semibold">{fmt(s.amount)}</td>
                      <td><StatusBadge status={s.status}/></td>
                    </tr>
                  ))
                  : <tr><td colSpan={6} className="text-center py-8 text-gray-400">No recent activity</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <h3 className="section-title">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { to:'/entry',   icon:'➕', label:'New Entry'     },
              { to:'/daily',   icon:'📋', label:'Daily Sheet'   },
              { to:'/pending', icon:'⏳', label:'Pending'       },
              { to:'/track',   icon:'🔍', label:'Track'         },
              { to:'/rates',   icon:'💰', label:'Rate Calc'     },
              { to:'/invoices',icon:'🧾', label:'Invoices'      },
              { to:'/import',  icon:'📥', label:'Import'        },
              { to:'/clients', icon:'👥', label:'Clients'       },
            ].map(a => (
              <Link key={a.to} to={a.to}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 hover:bg-navy-50 hover:border-navy-200 border border-transparent transition-all text-center">
                <span className="text-xl">{a.icon}</span>
                <span className="text-xs font-semibold text-gray-600">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
