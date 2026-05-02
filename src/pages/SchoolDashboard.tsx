import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lead, UserProfile } from '../types';
import AdminLayout from '../components/AdminLayout';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Users, GraduationCap, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export default function SchoolDashboard({ user }: { user: UserProfile }) {
  const { id: schoolId } = useParams<{ id: string }>();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Security: If not admin, can only see their own school
  if (user.role !== 'admin' && user.schoolId !== schoolId) {
    return <Navigate to={`/school/${user.schoolId}`} />;
  }

  useEffect(() => {
    async function fetchData() {
      if (!schoolId) return;
      try {
        const q = query(
          collection(db, 'leads'), 
          where('schoolId', '==', schoolId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead)));
      } catch (err) {
        console.error("Error fetching school dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [schoolId]);

  // Analytics
  const leadsByCourse = Array.from(new Set(leads.map(l => l.course))).map(course => ({
    name: course,
    total: leads.filter(l => l.course === course).length
  })).sort((a, b) => b.total - a.total);

  const leadsByStatus = [
    { name: 'Novo', value: leads.filter(l => l.status === 'Novo').length },
    { name: 'Contatado', value: leads.filter(l => l.status === 'Contatado').length },
    { name: 'Matriculado', value: leads.filter(l => l.status === 'Matriculado').length },
    { name: 'Desistente', value: leads.filter(l => l.status === 'Desistente').length },
  ].filter(s => s.value > 0);

  const stats = [
    { label: 'Total Unidade', value: leads.length, icon: Users, color: 'bg-blue-600' },
    { label: 'Matriculados', value: leads.filter(l => l.status === 'Matriculado').length, icon: GraduationCap, color: 'bg-green-600' },
    { label: 'Aguardando Contato', value: leads.filter(l => l.status === 'Novo').length, icon: Clock, color: 'bg-yellow-600' },
    { label: 'Conversão', value: leads.length ? `${((leads.filter(l => l.status === 'Matriculado').length / leads.length) * 100).toFixed(1)}%` : '0%', icon: TrendingUp, color: 'bg-indigo-600' },
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

  const schoolName = leads.length > 0 ? leads[0].schoolName : "Unidade SESI";

  return (
    <AdminLayout user={user}>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-sesi-blue uppercase">{schoolName}</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Gestão estratégica da unidade</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors uppercase tracking-wider">Exportar Leads</button>
          <a href={`/school/${schoolId}/leads`} className="px-4 py-2 bg-sesi-red hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors uppercase tracking-wider">Gerenciar Lista</a>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4">
        
        {/* Metric: Total */}
        <div className="col-span-12 md:col-span-3 bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Interessados</span>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-4xl font-black text-sesi-blue">{leads.length}</h3>
          </div>
        </div>

        {/* Metric: Matriculados */}
        <div className="col-span-12 md:col-span-3 bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matriculados</span>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-4xl font-black text-emerald-600">{leads.filter(l => l.status === 'Matriculado').length}</h3>
          </div>
        </div>

        {/* Metric: Conversão */}
        <div className="col-span-12 md:col-span-3 bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxa Conversão</span>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-4xl font-black text-slate-800">
               {leads.length ? ((leads.filter(l => l.status === 'Matriculado').length / leads.length) * 100).toFixed(1) : 0}%
            </h3>
          </div>
        </div>

        {/* Metric: Pendentes */}
        <div className="col-span-12 md:col-span-3 bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm border-l-4 border-l-amber-400">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aguardando Contato</span>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-4xl font-black text-amber-600">{leads.filter(l => l.status === 'Novo').length}</h3>
          </div>
        </div>

        {/* Chart: Demanda por Curso */}
        <div className="col-span-12 md:col-span-8 row-span-2 bg-white p-6 rounded-xl border border-slate-200 flex flex-col shadow-sm">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Interesse por Nível de Ensino</h4>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsByCourse} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                  width={150}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Bar dataKey="total" fill="#004282" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Status Distribution */}
        <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Status da Unidade</h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={leadsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leadsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
             {leadsByStatus.map((status, i) => (
               <div key={status.name} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-slate-500">{status.name}</span>
                  </div>
                  <span className="text-slate-900">{status.value}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="col-span-12 md:col-span-4 bg-slate-900 text-white p-6 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-4">
             <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Dica de Gestão</p>
            <p className="text-sm font-medium leading-relaxed">
              Considere realizar mutirões de chamadas para os {leads.filter(l => l.status === 'Novo').length} leads pendentes para aumentar sua taxa de conversão local.
            </p>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
