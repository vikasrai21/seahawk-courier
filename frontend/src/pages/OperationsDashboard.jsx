import { useEffect, useState } from 'react';
import { PageLoader, StatCard } from '../components/ui/index.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../services/api';

const fmt = n => '₹' + Number(n||0).toLocaleString('en-IN');

export default function OperationsDashboard({ toast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const r = await api.get('/ops/dashboard'); setData(r?.data||r); }
      catch (e) { toast?.error?.(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <PageLoader text="Loading operations data..."/>;
  const ov = data?.overview || {};

  return (
    <div className="max-w-7xl space-y-6">
      <h1 className="page-title">Operations Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="📦" label="Month Shipments" value={ov.monthShipments||0} bgColor="bg-white"/>
        <StatCard icon="💰" label="Month Revenue"   value={fmt(ov.monthRevenue)} bgColor="bg-orange-50"/>
        <StatCard icon="✅" label="Delivered"        value={ov.deliveredCount||0} bgColor="bg-green-50"/>
        <StatCard icon="🎯" label="Delivery Rate"   value={`${ov.deliveryRate||0}%`} bgColor="bg-green-50"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="section-title">Daily Trend — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data?.dailyTrend||[]}>
              <XAxis dataKey="date" tick={{fontSize:10}} tickFormatter={d=>d?.slice(5)}/>
              <YAxis tick={{fontSize:10}}/>
              <Tooltip/>
              <Line type="monotone" dataKey="count" stroke="#0b1f3a" strokeWidth={2} dot={false} name="Shipments"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="section-title">Revenue by Carrier</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.courierBreakdown||[]}>
              <XAxis dataKey="courier" tick={{fontSize:9}}/>
              <YAxis tick={{fontSize:9}}/>
              <Tooltip formatter={v=>fmt(v)}/>
              <Bar dataKey="revenue" fill="#e8580a" radius={[3,3,0,0]} name="Revenue"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
