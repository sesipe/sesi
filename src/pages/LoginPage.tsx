import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Pre-processing identifier: append domain if it's just a school name
    let email = identifier;
    if (!identifier.includes('@')) {
      email = `${identifier}@sistemafiepe.org.br`;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // App.tsx handles redirecting once auth state changes
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Credenciais inválidas. Verifique seu usuário e senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-sesi-blue p-10 text-center text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <GraduationCap className="w-24 h-24" />
            </div>
            <div className="w-12 h-12 bg-white rounded flex items-center justify-center mx-auto mb-4 text-sesi-blue font-black text-2xl shadow-lg">S</div>
            <h1 className="text-xl font-black uppercase tracking-tight">SESI PERNAMBUCO</h1>
            <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-80">Portal do Gestor</p>
          </div>

          <div className="p-10 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-100 text-sesi-red px-4 py-3 rounded text-[11px] font-bold flex items-center gap-3 uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário / ID Corporativo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="ADMIN OU UNIDADE"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-900 focus:ring-1 focus:ring-sesi-blue outline-none transition-all placeholder:text-slate-300 uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Autenticação de Segurança</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-900 focus:ring-1 focus:ring-sesi-blue outline-none transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sesi-blue text-white font-black py-4 rounded text-xs uppercase tracking-widest hover:bg-blue-900 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Validar Acesso"}
              </button>
            </form>
            
            <div className="text-center pt-2">
              <a href="/" className="text-[10px] font-black text-slate-400 hover:text-sesi-blue uppercase tracking-widest transition-all">Voltar ao Site Institucional</a>
            </div>
          </div>
        </div>
        
        <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-8">
           SESI Pernambuco – Gerência Executiva de Educação
        </p>
      </motion.div>
    </div>
  );
}
