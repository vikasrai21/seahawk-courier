// src/App.jsx — Root app with routing and auth
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toasts }     from './components/ui/index.jsx';
import { useToast }   from './hooks/useToast';
import AppLayout      from './components/layout/AppLayout.jsx';

// ── Pages ────────────────────────────────────────────────
import LoginPage           from './pages/LoginPage.jsx';
import DashboardPage       from './pages/DashboardPage.jsx';
import OperationsDashboard from './pages/OperationsDashboard.jsx';
import NewEntryPage        from './pages/NewEntryPage.jsx';
import ImportPage          from './pages/ImportPage.jsx';
import AllShipmentsPage    from './pages/AllShipmentsPage.jsx';
import PendingPage         from './pages/PendingPage.jsx';
import TrackPage           from './pages/TrackPage.jsx';
import DailySheetPage      from './pages/DailySheetPage.jsx';
import MonthlyReportPage   from './pages/MonthlyReportPage.jsx';
import ClientsPage         from './pages/ClientsPage.jsx';
import ContractsPage       from './pages/ContractsPage.jsx';
import InvoicesPage        from './pages/InvoicesPage.jsx';
import ReconciliationPage  from './pages/ReconciliationPage.jsx';
import RateCalculatorPage  from './pages/RateCalculatorPage.jsx';
import BulkComparePage     from './pages/BulkComparePage.jsx';
import RateCardPage        from './pages/RateCardPage.jsx';
import QuoteHistoryPage    from './pages/QuoteHistoryPage.jsx';
import WhatsAppPage        from './pages/WhatsAppPage.jsx';
import SyncPage            from './pages/SyncPage.jsx';
import UsersPage           from './pages/UsersPage.jsx';
import AuditPage           from './pages/AuditPage.jsx';
import RateManagementPage  from './pages/RateManagementPage.jsx';
import ProfilePage         from './pages/ProfilePage.jsx';

/* ── Protected route wrapper ────────────────────────────── */
function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div className="min-h-screen bg-navy-800 flex items-center justify-center flex-col gap-4">
      <img src="/images/logo.png" alt="" className="h-14 brightness-0 invert opacity-80"
        onError={e => e.target.style.display='none'}/>
      <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin"/>
      <span className="text-white/50 text-sm">Loading...</span>
    </div>
  );

  if (!user) return <Navigate to="/login" state={{ from: location }} replace/>;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace/>;
  return children;
}

/* ── Main layout wrapper ─────────────────────────────────── */
function PortalLayout({ page: Page, adminOnly = false, toast }) {
  return (
    <Protected adminOnly={adminOnly}>
      <AppLayout>
        <div className="p-5 md:p-6">
          <Page toast={toast}/>
        </div>
      </AppLayout>
    </Protected>
  );
}

/* ── Root app ────────────────────────────────────────────── */
function AppRoutes() {
  const { toasts, dismiss, toast, success, error } = useToast();
  const t = { toast, success, error };

  return (
    <>
      <Toasts toasts={toasts} dismiss={dismiss}/>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage/>}/>

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace/>}/>

        {/* Portal pages */}
        <Route path="/dashboard"      element={<PortalLayout page={DashboardPage}       toast={t}/>}/>
        <Route path="/ops"            element={<PortalLayout page={OperationsDashboard}  toast={t}/>}/>
        <Route path="/entry"          element={<PortalLayout page={NewEntryPage}         toast={t}/>}/>
        <Route path="/import"         element={<PortalLayout page={ImportPage}           toast={t}/>}/>
        <Route path="/all"            element={<PortalLayout page={AllShipmentsPage}     toast={t}/>}/>
        <Route path="/pending"        element={<PortalLayout page={PendingPage}          toast={t}/>}/>
        <Route path="/track"          element={<PortalLayout page={TrackPage}            toast={t}/>}/>
        <Route path="/daily"          element={<PortalLayout page={DailySheetPage}       toast={t}/>}/>
        <Route path="/monthly"        element={<PortalLayout page={MonthlyReportPage}    toast={t}/>}/>
        <Route path="/clients"        element={<PortalLayout page={ClientsPage}          toast={t}/>}/>
        <Route path="/contracts"      element={<PortalLayout page={ContractsPage}        toast={t}/>}/>
        <Route path="/invoices"       element={<PortalLayout page={InvoicesPage}         toast={t}/>}/>
        <Route path="/reconciliation" element={<PortalLayout page={ReconciliationPage}   toast={t}/>}/>
        <Route path="/rates"          element={<PortalLayout page={RateCalculatorPage}   toast={t}/>}/>
        <Route path="/bulk"           element={<PortalLayout page={BulkComparePage}      toast={t}/>}/>
        <Route path="/rate-card"      element={<PortalLayout page={RateCardPage}         toast={t}/>}/>
        <Route path="/quotes"         element={<PortalLayout page={QuoteHistoryPage}     toast={t}/>}/>
        <Route path="/whatsapp"       element={<PortalLayout page={WhatsAppPage}         toast={t}/>}/>
        <Route path="/sync"           element={<PortalLayout page={SyncPage}             toast={t}/>}/>
        <Route path="/profile"        element={<PortalLayout page={ProfilePage}          toast={t}/>}/>

        {/* Admin only */}
        <Route path="/users"     element={<PortalLayout page={UsersPage}          adminOnly toast={t}/>}/>
        <Route path="/audit"     element={<PortalLayout page={AuditPage}          adminOnly toast={t}/>}/>
        <Route path="/rate-mgmt" element={<PortalLayout page={RateManagementPage} adminOnly toast={t}/>}/>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/portal">
      <AuthProvider>
        <AppRoutes/>
      </AuthProvider>
    </BrowserRouter>
  );
}
