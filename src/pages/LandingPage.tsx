import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { School } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, MapPin, GraduationCap, Phone, User, Mail, Send, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

const COURSES = [
  "Educação Infantil",
  "Ensino Fundamental I (1º ao 5º ano)",
  "Ensino Fundamental II (6º ao 9º ano)",
  "Ensino Médio",
  "Novo Ensino Médio",
  "EJA (Educação de Jovens e Adultos)"
];

const SERIES_MAP: Record<string, string[]> = {
  "Educação Infantil": ["Infantil 3", "Infantil 4", "Infantil 5"],
  "Ensino Fundamental I (1º ao 5º ano)": ["1º ano", "2º ano", "3º ano", "4º ano", "5º ano"],
  "Ensino Fundamental II (6º ao 9º ano)": ["6º ano", "7º ano", "8º ano", "9º ano"],
  "Ensino Médio": ["1ª série", "2ª série", "3ª série"],
  "Novo Ensino Médio": ["1ª série itinerário", "2ª série itinerário", "3ª série itinerário"],
  "EJA (Educação de Jovens e Adultos)": ["Fase VI", "Fase VII", "Ensino Médio EJA"]
};

export default function LandingPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    responsibleName: '',
    relationship: '',
    email: '',
    whatsapp: '',
    schoolId: '',
    course: '',
    series: ''
  });

  useEffect(() => {
    async function fetchSchools() {
      try {
        const q = query(collection(db, 'schools'), where('status', '==', 'active'));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School));
        setSchools(list);
      } catch (e) {
        console.error("Error fetching schools:", e);
      } finally {
        setLoadingSchools(false);
      }
    }
    fetchSchools();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const selectedSchool = schools.find(s => s.id === formData.schoolId);
      
      await addDoc(collection(db, 'leads'), {
        ...formData,
        schoolName: selectedSchool?.name || '',
        status: 'Novo',
        observations: '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error("Error submitting lead:", e);
      alert("Ocorreu um erro ao enviar seu interesse. Por favor, tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6"
        >
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-sans">Cadastro Realizado!</h2>
          <p className="text-slate-600">
            Recebemos seu interesse em matricular o estudante no <strong>SESI Pernambuco</strong>. 
            Nossa equipe da unidade selecionada entrará em contato em breve via WhatsApp ou E-mail.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Realizar outro cadastro
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-sesi-blue selection:text-white">
      {/* Top Banner */}
      <div className="bg-sesi-blue text-white py-2 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-center">
        Educação que Transforma • SESI Pernambuco • Matrículas Abertas
      </div>

      {/* Navigation */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-sesi-blue rounded flex items-center justify-center text-white font-black text-xl">S</div>
             <div>
                <h1 className="text-lg font-black text-sesi-blue leading-none">SESI PE</h1>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escolas da Indústria</span>
             </div>
          </div>
          <a href="/login" className="px-4 py-2 border border-slate-200 rounded text-xs font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-wider">Acesso Restrito</a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white pt-16 pb-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="inline-block px-3 py-1 bg-red-50 text-sesi-red text-[11px] font-black uppercase tracking-widest rounded">
              Vagas Limitadas / Ano Letivo 2026
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-sesi-blue leading-[1.05] tracking-tight">
              O futuro do seu filho começa <span className="text-sesi-red">aqui.</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
              Oferecemos uma metodologia inovadora que une teoria e prática, preparando estudantes para os desafios da vida e do mercado de trabalho.
            </p>
            <div className="flex gap-4 pt-4">
               <button onClick={() => document.getElementById('enroll-form')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-sesi-blue text-white rounded font-black uppercase tracking-widest text-xs hover:bg-blue-900 transition-all shadow-xl shadow-blue-100">
                  Cadastrar Interesse
               </button>
            </div>
          </motion.div>
          
          <div className="hidden md:grid grid-cols-2 gap-4">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center p-8 text-sesi-blue"
             >
                <GraduationCap className="w-16 h-16 opacity-20" />
             </motion.div>
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.1 }}
               className="aspect-square bg-sesi-red rounded-2xl flex flex-col justify-end p-6 text-white"
             >
                <div className="font-black text-3xl leading-none">12</div>
                <div className="text-[10px] font-black uppercase tracking-widest mt-1">Unidades em PE</div>
             </motion.div>
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.2 }}
               className="aspect-square bg-sesi-blue rounded-2xl flex flex-col justify-end p-6 text-white col-span-2"
             >
                <div className="font-black text-4xl leading-none">ROBÓTICA</div>
                <div className="text-[10px] font-black uppercase tracking-widest mt-1">Metodologia STEAM</div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="enroll-form" className="bg-slate-50 py-24 px-6 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
             <h3 className="text-3xl font-black text-sesi-blue uppercase tracking-tight">Formulário de Interesse</h3>
             <p className="text-slate-500 font-medium">Preencha os campos abaixo e entraremos em contato.</p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       Selecione a Unidade
                    </label>
                    <select
                      required
                      value={formData.schoolId}
                      onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded px-4 py-3 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-sesi-blue outline-none transition-all"
                    >
                      <option value="">Escolha uma escola...</option>
                      {loadingSchools ? (
                        <option disabled>Carregando unidades...</option>
                      ) : (
                        schools.map(school => (
                          <option key={school.id} value={school.id}>{school.name.toUpperCase()} - {school.city.toUpperCase()}</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       Qual o Curso?
                    </label>
                    <select
                      required
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value, series: '' })}
                      className="w-full bg-slate-50 border border-slate-100 rounded px-4 py-3 text-sm font-bold text-slate-700 focus:ring-1 focus:ring-sesi-blue outline-none transition-all"
                    >
                      <option value="">Selecione o nível...</option>
                      {COURSES.map(course => (
                        <option key={course} value={course}>{course.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {formData.course && (
                    <motion.div 
                      key={formData.course}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Qual a Série?
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {SERIES_MAP[formData.course]?.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setFormData({ ...formData, series: s })}
                            className={cn(
                              "px-3 py-2 rounded text-[10px] font-black border transition-all uppercase tracking-wider",
                              formData.series === s 
                                ? "bg-sesi-blue text-white border-sesi-blue shadow-lg" 
                                : "bg-white text-slate-500 border-slate-200 hover:border-sesi-blue hover:text-sesi-blue"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="border-t border-slate-100 pt-10 grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seu Nome Completo</label>
                    <input
                      required
                      type="text"
                      placeholder="RESPONSÁVEL PELA MATRÍCULA"
                      value={formData.responsibleName}
                      onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded px-4 py-3 text-sm font-bold text-slate-900 focus:ring-1 focus:ring-sesi-blue outline-none transition-all uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grau de Parentesco</label>
                    <input
                      required
                      type="text"
                      placeholder="EX: PAI, MÃE, RESPONSÁVEL"
                      value={formData.relationship}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded px-4 py-3 text-sm font-bold text-slate-900 focus:ring-1 focus:ring-sesi-blue outline-none transition-all uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail para Contato</label>
                    <input
                      required
                      type="email"
                      placeholder="ESCREVA@SEUEMAIL.COM"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded px-4 py-3 text-sm font-bold text-slate-900 focus:ring-1 focus:ring-sesi-blue outline-none transition-all uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número do WhatsApp</label>
                    <input
                      required
                      type="tel"
                      placeholder="(81) 9...."
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded px-4 py-3 text-sm font-bold text-slate-900 focus:ring-1 focus:ring-sesi-blue outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !formData.series}
                  className={cn(
                    "w-full py-5 rounded text-xs font-black flex items-center justify-center gap-3 transition-all uppercase tracking-[0.2em] shadow-2xl",
                    submitting || !formData.series
                      ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                      : "bg-sesi-red text-white hover:bg-red-700 shadow-red-100 active:scale-[0.98]"
                  )}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Processando...
                    </>
                  ) : (
                    <>
                      Confirmar Dados e Enviar Cadastro
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-sesi-blue text-white py-12 px-6">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-sesi-blue font-black text-xl">S</div>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60">© {new Date().getFullYear()} SESI PERNAMBUCO<br/>DIRETORIA DE EDUCAÇÃO</p>
            </div>
            <div className="flex gap-8">
               <a href="#" className="text-[10px] font-black uppercase tracking-widest hover:text-sesi-red transition-all">Privacidade</a>
               <a href="#" className="text-[10px] font-black uppercase tracking-widest hover:text-sesi-red transition-all">Termos</a>
               <a href="#" className="text-[10px] font-black uppercase tracking-widest hover:text-sesi-red transition-all">Suporte</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
