import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, doc, getDocs, orderBy, query, updateDoc, where, Timestamp, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Lead, LeadStatus, UserProfile } from '../types';
import AdminLayout from '../components/AdminLayout';
import { 
  Users, Search, Filter, Download, MoreVertical, 
  MessageCircle, Mail, Phone, Calendar, School, 
  ChevronRight, X, Check, Loader2, Info, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const STATUS_OPTIONS: LeadStatus[] = ['Novo', 'Contatado', 'Matriculado', 'Desistente'];

export default function LeadsList({ user }: { user: UserProfile }) {
  const { id: schoolIdParam } = useParams<{ id: string }>();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [updatingLead, setUpdatingLead] = useState<Lead | null>(null);
  const [newStatus, setNewStatus] = useState<LeadStatus>('Novo');
  const [obs, setObs] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let q;
      const targetSchoolId = user.role === 'admin' ? schoolIdParam : user.schoolId;

      if (targetSchoolId) {
        q = query(collection(db, 'leads'), where('schoolId', '==', targetSchoolId), orderBy('createdAt', 'desc'));
      } else {
        q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const d = doc.data() as any;
        return { 
          id: doc.id, 
          ...d, 
          createdAt: d.createdAt instanceof Timestamp ? d.createdAt.toDate() : new Date(d.createdAt) 
        } as Lead;
      });
      setLeads(data);
    } catch (err) {
      console.error("Error fetching leads list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [schoolIdParam, user]);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.responsibleName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingLead) return;
    setIsSubmitting(true);

    try {
      const leadRef = doc(db, 'leads', updatingLead.id);
      await updateDoc(leadRef, {
        status: newStatus,
        observations: obs,
        updatedAt: Timestamp.now()
      });

      // Add to history
      await addDoc(collection(db, 'leads', updatingLead.id, 'history'), {
        leadId: updatingLead.id,
        oldStatus: updatingLead.status,
        newStatus: newStatus,
        changedBy: user.uid,
        changedByEmail: user.email,
        timestamp: Timestamp.now(),
        observation: obs
      });

      await fetchLeads();
      setUpdatingLead(null);
      setObs('');
    } catch (err) {
      console.error("Error updating lead status:", err);
      alert("Erro ao atualizar status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Responsável", "Parentesco", "Email", "WhatsApp", "Escola", "Curso", "Série", "Status", "Data"];
    const rows = filteredLeads.map(l => [
      l.id, l.responsibleName, l.relationship, l.email, l.whatsapp, l.schoolName, l.course, l.series, l.status, l.createdAt.toLocaleDateString()
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_sesipe_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-sesi-blue tracking-tight uppercase">GERENCIAMENTO DE LEADS</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Interessados captados via plataforma</p>
          </div>
          <button 
            onClick={exportToCSV}
            className="px-6 py-3 bg-white text-slate-700 text-xs font-black rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-all uppercase tracking-widest flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Exportar Base
          </button>
        </header>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:ring-1 focus:ring-sesi-blue outline-none transition-all font-medium"
            />
          </div>
          <div className="md:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700 uppercase tracking-wider outline-none focus:ring-1 focus:ring-sesi-blue"
            >
              <option value="todos">FILTRAR POR STATUS</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Interessado</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Escola / Curso</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acionista</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-8">
                        <div className="h-4 bg-slate-100 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Nenhum registro encontrado.</td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <motion.tr 
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 text-sm uppercase">{lead.responsibleName}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-sesi-blue bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                              {lead.relationship}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                               {lead.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-700 text-xs uppercase tracking-tight">
                            {lead.schoolName.replace('SESI ', '')}
                          </div>
                          <p className="text-[10px] font-medium text-slate-400 uppercase italic">{lead.course} • {lead.series}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                          lead.status === 'Novo' && "bg-amber-50 text-amber-600 border-amber-200",
                          lead.status === 'Contatado' && "bg-blue-50 text-blue-600 border-blue-200",
                          lead.status === 'Matriculado' && "bg-emerald-50 text-emerald-600 border-emerald-200",
                          lead.status === 'Desistente' && "bg-slate-50 text-slate-500 border-slate-200",
                        )}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => {
                            setUpdatingLead(lead);
                            setNewStatus(lead.status);
                            setObs(lead.observations || '');
                          }}
                          className="px-3 py-1.5 text-slate-400 hover:text-sesi-blue hover:bg-blue-50 rounded text-[10px] font-black uppercase tracking-wider transition-all border border-transparent hover:border-blue-100"
                        >
                          Gerenciar
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {updatingLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUpdatingLead(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-xl shadow-2xl relative overflow-hidden border border-slate-200"
            >
              <div className="bg-sesi-blue p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight">GESTÃO DO INTERESSADO</h2>
                  <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Inscrito em {updatingLead.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => setUpdatingLead(null)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsável</p>
                    <p className="text-sm font-black text-slate-900 uppercase">{updatingLead.responsibleName}</p>
                    <p className="text-[11px] font-medium text-slate-500">{updatingLead.whatsapp}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objetivo</p>
                    <p className="text-[11px] font-bold text-sesi-blue uppercase">{updatingLead.schoolName.replace('SESI ', '')}</p>
                    <p className="text-[10px] font-medium text-slate-500 uppercase">{updatingLead.series}</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateStatus} className="space-y-5">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alterar Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      {STATUS_OPTIONS.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewStatus(s)}
                          className={cn(
                            "py-2 px-3 rounded text-[10px] font-black transition-all border uppercase tracking-wider",
                            newStatus === s 
                              ? "bg-sesi-blue text-white border-sesi-blue shadow-md" 
                              : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumo de Atendimento</p>
                    <textarea 
                      value={obs}
                      onChange={(e) => setObs(e.target.value)}
                      placeholder="Descreva o andamento do contato..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs min-h-[80px] outline-none focus:ring-1 focus:ring-sesi-blue font-medium"
                    />
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-sesi-red text-white py-3.5 rounded-lg font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Salvar Ocorrência</>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
