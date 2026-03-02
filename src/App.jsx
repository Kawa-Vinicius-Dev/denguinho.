import { useContext, useState } from 'react';
import { ChallengeContext } from './context/ChallengeContext';
import { ChallengeCard } from './components/ChallengeCard';
import { getChallengeStatus } from './models/Challenge';

function App() {
  const { challenges, addChallenge, totalPoints } = useContext(ChallengeContext);
  const [text, setText] = useState('');
  const [type, setType] = useState('daily');
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed', 'expired'

  const handleAdd = () => {
    if (!text.trim()) return;
    addChallenge(text, type);
    setText('');
    setActiveTab('active'); // Volta para a aba de ativos ao criar um novo
  };

  // Lógica de Filtro Centralizada
  const filteredChallenges = challenges.filter(ch => {
    const status = getChallengeStatus(ch);
    return status === activeTab;
  }).reverse();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <header className="max-w-md mx-auto mb-6 flex justify-between items-end">
        <div>
          <p className="text-sm text-slate-500 font-medium">Bem-vindos de volta!</p>
          <h1 className="text-3xl font-extrabold text-slate-800">Desafio Casal</h1>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Pontos</p>
          <p className="font-black text-rose-500 text-2xl">{totalPoints}</p>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {/* Card de Input Moderno */}
        <div className="bg-white p-5 rounded-3xl shadow-xl shadow-slate-200/50 mb-8 border border-slate-100">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Qual o próximo desafio?"
            className="w-full p-3 bg-slate-50 border-none rounded-xl mb-4 outline-none focus:ring-2 focus:ring-rose-400 transition-all"
          />
          <div className="flex gap-2 mb-4">
            {['daily', 'weekly', 'monthly'].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-xl capitalize text-xs font-bold transition-all ${
                  type === t ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {t === 'daily' ? 'Dia' : t === 'weekly' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
          <button
            onClick={handleAdd}
            className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all active:scale-95"
          >
            Lançar Desafio
          </button>
        </div>

        {/* Sistema de Abas (Tabs) */}
        <div className="flex border-b border-slate-200 mb-6">
          {['active', 'completed', 'expired'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-3 text-sm font-bold capitalize transition-all ${
                activeTab === tab
                ? 'border-b-2 border-rose-500 text-rose-500'
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'active' ? '🔥 Ativos' : tab === 'completed' ? '✅ Feitos' : '❌ Perdi'}
            </button>
          ))}
        </div>

        {/* Lista Filtrada */}
        <div className="space-y-3">
          {filteredChallenges.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-400 text-sm italic font-medium">Nada por aqui ainda...</p>
            </div>
          ) : (
            filteredChallenges.map(ch => (
              <ChallengeCard key={ch.id} challenge={ch} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;