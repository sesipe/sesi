import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lead, School, UserProfile } from '../types';
import AdminLayout from '../components/AdminLayout';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Users, GraduationCap, MapPin, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'motion/react';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export default function AdminDashboard({ user }: { user: UserProfile }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [leadsSnap, schoolsSnap] = await Promise.all([
          getDocs(query(collection(db, 'leads'), orderBy('createdAt', 'desc'))),
          getDocs(collection(db, 'schools'))
        ]);
        
        setLeads(leadsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead)));
        setSchools(schoolsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as School)));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Analytics processing
  const leadsBySchool = schools.map(school => ({
    name: school.name,
    total: leads.filter(l => l.schoolId === school.id).length
  })).sort((a, b) => b.total - a.total);

  const leadsByStatus = [
    { name: 'Novo', value: leads.filter(l => l.status === 'Novo').length },
    { name: 'Contatado', value: leads.filter(l => l.status === 'Contatado').length },
    { name: 'Matriculado', value: leads.filter(l => l.status === 'Matriculado').length },
    { name: 'Desistente', value: leads.filter(l => l.status === 'Desistente').length },
  ].filter(s => s.value > 0);

  const stats = [
    { label: 'Total de Leads', value: leads.length, icon: Users, color: 'bg-blue-600' },
    { label: 'Matriculados', value: leads.filter(l => l.status === 'Matriculado').length, icon: GraduationCap, color: 'bg-green-600' },
    { label: 'Novos Interessados', value: leads.filter(l => l.status === 'Novo').length, icon: Clock, color: 'bg-yellow-600' },
    { label: 'Escadas Ativas', value: schools.length, icon: MapPin, color: 'bg-indigo-600' },
  ];

  if (loading) {
    return (
      <AdminLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout user={user}>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-sesi-blue">DASHBOARD INSTITUCIONAL</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Consolidado de todas as {schools.length} unidades SESI PE</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors uppercase tracking-wider">Exportar Relatório</button>
          <button className="px-4 py-2 bg-sesi-red hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors uppercase tracking-wider">Configurações</button>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* Metric: Total Leads */}
        <div className="col-span-12 md:col-span-3 bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Leads</span>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-4xl font-black text-sesi-blue">{leads.length}</h3>
            <span className="text-emerald-500 text-[10px] font-black pb-1 uppercase">+12% mês</span>
          </div>
        </div>

        {/* Metric: Matriculados */}
        <div className="col-span-12 md:col-span-3 bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matriculados</span>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-4xl font-black text-slate-800">{leads.filter(l => l.status === 'Matriculado').length}</h3>
            <span className="text-slate-400 text-[10px] font-black pb-1 uppercase">
              {leads.length ? ((leads.filter(l => l.status === 'Matriculado').length / leads.length) * 100).toFixed(1) : 0}% conv.
            </span>
          </div>
        </div>

        {/* Chart: Leads por Unidade */}
        <div className="col-span-12 md:col-span-6 row-span-2 bg-white p-6 rounded-xl border border-slate-200 flex flex-col shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Demanda por Unidade</h4>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-2">
            {leadsBySchool.slice(0, 8).map(school => (
              <div key={school.name} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 uppercase">
                  <span>{school.name}</span>
                  <span>{school.total}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(school.total / (leadsBySchool[0]?.total || 1)) * 100}%` }}
                    className="h-full bg-sesi-blue"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leads List Preview */}
        <div className="col-span-12 md:col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Últimas Inscrições</h4>
            <a href="/admin/leads" className="text-[10px] font-black text-sesi-blue hover:underline uppercase tracking-wider">Ver tudo</a>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase text-slate-400 font-black border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Candidato</th>
                  <th className="px-5 py-2">Unidade</th>
                  <th className="px-5 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {leads.slice(0, 6).map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-bold text-slate-800">{lead.responsibleName}</td>
                    <td className="px-5 py-3 font-medium text-slate-500">{lead.schoolName.replace('SESI ', '')}</td>
                    <td className="px-5 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                        lead.status === 'Novo' && "bg-amber-100 text-amber-700",
                        lead.status === 'Contatado' && "bg-blue-100 text-blue-700",
                        lead.status === 'Matriculado' && "bg-emerald-100 text-emerald-700",
                        lead.status === 'Desistente' && "bg-slate-100 text-slate-600",
                      )}>
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Metric: Funnel */}
        <div className="col-span-12 md:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Funil de Matrícula</h4>
          <div className="flex flex-col gap-3">
            {leadsByStatus.map((status, i) => (
              <div key={status.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="text-[11px] font-bold text-slate-600 flex-1 uppercase">{status.name}</span>
                <span className="text-[11px] font-black text-slate-900">{status.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 h-10 w-full flex rounded-lg overflow-hidden border border-slate-100">
            {leadsByStatus.map((status, i) => (
              <div 
                key={status.name}
                className="h-full" 
                style={{ 
                  backgroundColor: COLORS[i % COLORS.length], 
                  width: `${(status.value / leads.length) * 100}%` 
                }}
              />
            ))}
          </div>
        </div>

        {/* Alert/Info Box */}
        <div className="col-span-12 md:col-span-4 bg-sesi-blue text-white p-5 rounded-xl flex flex-col justify-between shadow-lg shadow-sesi-blue/10">
          <Clock className="w-6 h-6 opacity-50" />
          <div className="mt-4">
            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Atenção Administrativa</p>
            <p className="text-sm font-bold leading-snug">
              Existem {leads.filter(l => l.status === 'Novo').length} leads aguardando contato inicial nas unidades.
            </p>
          </div>
          <a href="/admin/leads" className="text-xs font-black underline decoration-white/30 hover:decoration-white mt-4 uppercase tracking-wider">Ver pendências</a>
        </div>

      </div>
    </AdminLayout>
  );
}
