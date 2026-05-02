import { Link } from 'react-router-dom';
import { OctagonAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="bg-red-100 p-6 rounded-full">
        <OctagonAlert className="w-16 h-16 text-red-600" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">404</h1>
        <p className="text-xl font-bold text-slate-600 uppercase tracking-widest text-sm">Página Não Encontrada</p>
      </div>
      <p className="text-slate-500 max-w-sm">A página que você está procurando não existe ou foi movida.</p>
      <Link 
        to="/" 
        className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}
