import { ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { UserProfile } from '../types';
import { 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  School, 
  LayoutDashboard, 
  Menu, 
  X, 
  GraduationCap
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
  user: UserProfile;
}

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const menuItems = [
    ...(user.role === 'admin' ? [
      { name: 'Visão Geral', icon: LayoutDashboard, path: '/admin' },
      { name: 'Todos os Leads', icon: Users, path: '/admin/leads' },
    ] : [
      { name: 'Minha Escola', icon: BarChart3, path: `/school/${user.schoolId}` },
      { name: 'Leads da Unidade', icon: Users, path: `/school/${user.schoolId}/leads` },
    ])
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-sesi-blue text-white shrink-0 border-r border-slate-200">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-sesi-blue">
              S
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">SESI PE</h1>
              <span className="text-[10px] font-normal opacity-80 uppercase tracking-wider block">Gestão de Leads</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.path 
                  ? "bg-white/10 border-l-4 border-white text-white" 
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="w-8 h-8 rounded-full bg-slate-300 flex-shrink-0 flex items-center justify-center text-sesi-blue font-bold text-xs uppercase">
              {user.email[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user.email}</p>
              <p className="text-[10px] text-white/60">{user.role === 'admin' ? 'Administrador Geral' : 'Gestor de Escola'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-2 py-3 w-full text-slate-400 text-xs font-bold hover:text-red-400 transition-all uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden bg-sesi-blue text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-white" />
          <h2 className="font-black text-lg tracking-tight">SESI PE</h2>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900 p-6 space-y-6 flex flex-col">
          <div className="flex justify-end">
            <button onClick={() => setMobileMenuOpen(false)}><X className="w-8 h-8 text-white" /></button>
          </div>
          <nav className="flex-1 space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-4 text-xl font-bold p-4 rounded-2xl",
                  location.pathname === item.path ? "bg-blue-600 text-white" : "text-slate-400"
                )}
              >
                <item.icon className="w-6 h-6" /> {item.name}
              </Link>
            ))}
          </nav>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 text-xl font-bold p-4 text-red-500"
          >
            <LogOut className="w-6 h-6" /> Sair
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-16">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
