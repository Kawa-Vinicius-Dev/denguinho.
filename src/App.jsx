import { useContext, useState } from 'react';
import { ChallengeContext } from './context/ChallengeContext';
import { ChallengeCard } from './components/ChallengeCard';
import { obterStatusDesafio } from './models/Challenge';

function App() {
  const { challenges, adicionarDesafio, pontosKawa, pontosParceira } = useContext(ChallengeContext);
  const [text, setText] = useState('');
  const [type, setType] = useState('diario');
  const [user, setUser] = useState('Kawa'); // Estado para saber quem está logado
  const [activeTab, setActiveTab] = useState('active');

  const handleAdd = () => {
    if (!text.trim()) return;
    adicionarDesafio(text, type, user);
    setText('');
    setActiveTab('active');
  };

  const filteredChallenges = challenges.filter(ch => {
    const status = obterStatusDesafio(ch);
    return status === activeTab;
  }).reverse();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <header className="max-w-md mx-auto mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Desafio Casal</h1>
          {/* Seletor de Usuário */}
          <div className="flex gap-2 mt-2">
            {['Kawa', 'Parceira'].map(u => (
              <button
                key={u}
                onClick={() => setUser(u)}
                className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-tighter transition-all ${
                  user === u ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400'
                }`}
              >
                Sou {u}
              </button>
            ))}
          </div>
        </div>

        {/* Placar Comparativo */}
        <div className="flex gap-2">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 text-center min-w-[60px]">
            <p className="text-[9px] uppercase text-slate-400 font-bold">Kawa</p>
            <p className="font-black text-blue-500 text-xl">{pontosKawa}</p>
          </div>
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 text-center min-w-[60px]">
            <p className="text-[9px] uppercase text-slate-400 font-bold">Ela</p>
            <p className="font-black text-rose-500 text-xl">{pontosParceira}</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        <div className="bg-white p-5 rounded-3xl shadow-xl mb-8 border border-slate-100">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Novo desafio de ${user}...`}
            className="w-full p-3 bg-slate-50 border-none rounded-xl mb-4 outline-none focus:ring-2 focus:ring-rose-400"
          />
          <div className="flex gap-2 mb-4">
            {['diario', 'semanal', 'mensal'].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-xl capitalize text-xs font-bold transition-all ${
                  type === t ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button onClick={handleAdd} className="w-full bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 active:scale-95 transition-all">
            Lançar Desafio
          </button>
        </div>

        <div className="flex border-b border-slate-200 mb-6">
          {['active', 'completed', 'expired'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 pb-3 text-sm font-bold capitalize ${activeTab === tab ? 'border-b-2 border-rose-500 text-rose-500' : 'text-slate-400'}`}>
              {tab === 'active' ? '🔥 Ativos' : tab === 'completed' ? '✅ Feitos' : '❌ Perdi'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredChallenges.map(ch => (
            <ChallengeCard key={ch.id} challenge={ch} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;