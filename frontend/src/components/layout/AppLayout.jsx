// src/components/layout/AppLayout.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  {
    group: null,
    items: [
      { to: '/dashboard',  icon: '📊', label: 'Dashboard'      },
      { to: '/ops',        icon: '🎯', label: 'Operations'      },
    ],
  },
  {
    group: 'Shipments',
    items: [
      { to: '/entry',    icon: '➕', label: 'New Entry',      kbd: 'N' },
      { to: '/import',   icon: '📥', label: 'Import Excel'        },
      { to: '/all',      icon: '📦', label: 'All Shipments'       },
      { to: '/pending',  icon: '⏳', label: 'Pending',       badge: 'pending' },
      { to: '/track',    icon: '🔍', label: 'Track Shipment'      },
      { to: '/daily',    icon: '📋', label: 'Daily Sheet'         },
      { to: '/monthly',  icon: '📈', label: 'Monthly Report'      },
    ],
  },
  {
    group: 'Clients & Finance',
    items: [
      { to: '/clients',        icon: '👥', label: 'Clients'       },
      { to: '/contracts',      icon: '📜', label: 'Contracts'     },
      { to: '/invoices',       icon: '🧾', label: 'Invoices'      },
      { to: '/reconciliation', icon: '🔄', label: 'Reconciliation'},
    ],
  },
  {
    group: 'Rates & Quotes',
    items: [
      { to: '/rates',     icon: '💰', label: 'Rate Calculator' },
      { to: '/bulk',      icon: '⚖️',  label: 'Bulk Compare'   },
      { to: '/rate-card', icon: '💳', label: 'Rate Card'       },
      { to: '/quotes',    icon: '📄', label: 'Quote History'   },
      { to: '/whatsapp',  icon: '📱', label: 'WhatsApp Rates', badge: 'new' },
    ],
  },
  {
    group: 'Data',
    items: [
      { to: '/sync', icon: '💾', label: 'Export & Backup' },
    ],
  },
];

const ADMIN_NAV = {
  group: 'Admin',
  items: [
    { to: '/users',    icon: '👤', label: 'Users'            },
    { to: '/audit',    icon: '🛡️', label: 'Audit Logs'       },
    { to: '/rate-mgmt',icon: '⚙️', label: 'Rate Management'  },
  ],
};

export default function AppLayout({ children, pendingCount = 0 }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobOpen, setMobOpen] = useState(false);

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');

  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

  const allGroups = isAdmin ? [...NAV, ADMIN_NAV] : NAV;

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10 flex-shrink-0">
        <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setMobOpen(false)}>
          <img src="/images/logo.png" alt="Sea Hawk" className="h-9 object-contain brightness-0 invert"
            onError={e => { e.target.style.display='none'; }}/>
          <div>
            <div className="text-white text-sm font-bold leading-none">Sea Hawk</div>
            <div className="text-white/35 text-[9px] font-bold uppercase tracking-[2px] mt-0.5">Courier Portal</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {allGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-3' : ''}>
            {group.group && (
              <div className="px-3 pt-2 pb-1 text-[9px] font-[800] uppercase tracking-[2.5px] text-white/28">
                {group.group}
              </div>
            )}
            {group.items.map(item => {
              const active = isActive(item.to);
              const badgeCount = item.badge === 'pending' ? pendingCount : 0;
              return (
                <Link key={item.to} to={item.to} onClick={() => setMobOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all relative
                    ${active ? 'bg-white/15 text-white shadow-sm' : 'text-white/55 hover:text-white/90 hover:bg-white/8'}`}>
                  {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-400 rounded-r"/>}
                  <span className="text-sm w-4 text-center flex-shrink-0">{item.icon}</span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className="text-[9px] font-[800] px-1.5 py-0.5 rounded-full bg-orange-500 text-white ml-auto">{badgeCount}</span>
                  )}
                  {item.badge === 'new' && (
                    <span className="text-[9px] font-[800] px-1.5 py-0.5 rounded-full bg-green-500/30 text-green-300 ml-auto">NEW</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-white/8 p-2">
        <Link to="/profile" onClick={() => setMobOpen(false)}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all mb-0.5
            ${isActive('/profile') ? 'bg-white/12 text-white' : 'text-white/55 hover:text-white/85 hover:bg-white/8'}`}>
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-[800] flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-[700] truncate text-white/85">{user?.name}</div>
            <div className="text-[9px] text-white/35 uppercase tracking-wider">{user?.role}</div>
          </div>
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] font-[600] text-white/30 hover:text-red-300 hover:bg-red-500/10 transition-all">
          <span className="text-sm w-4 text-center">🚪</span>Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {mobOpen && <div className="fixed inset-0 bg-black/40 z-[300] md:hidden" onClick={() => setMobOpen(false)}/>}

      {/* Sidebar — desktop */}
      <aside className="hidden md:flex w-[210px] flex-shrink-0 bg-navy-800 flex-col h-full overflow-hidden">
        <SidebarContent/>
      </aside>

      {/* Sidebar — mobile slide-in */}
      <aside className={`fixed top-0 left-0 h-full w-[210px] bg-navy-800 flex flex-col z-[400] md:hidden transform transition-transform duration-300 ${mobOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent/>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 shadow-sm flex items-center px-4 gap-3 flex-shrink-0 z-10">
          <button onClick={() => setMobOpen(true)} className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div className="flex-1"/>
          <a href="/" target="_blank" className="text-xs text-gray-400 hover:text-orange-500 font-semibold transition-colors hidden sm:block">
            ← Website
          </a>
          <div className="w-px h-5 bg-gray-200"/>
          <div className="text-xs text-gray-500 hidden sm:block">{new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
