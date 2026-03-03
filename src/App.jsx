import { useState, useEffect } from 'react';
import { ChallengeProvider, useChallenges } from './context/ChallengeContext';
import { ChallengeCard } from './components/ChallengeCard';
import { supabase } from './services/supabase';

function MainContent() {
  const { challenges, loading, fetchChallenges } = useChallenges();
  const [tab, setTab] = useState('diario');
  const [showModal, setShowModal] = useState(false);

  const [usuarioAtivo, setUsuarioAtivo] = useState(localStorage.getItem('user_denguinho') || null);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novoTipo, setNovoTipo] = useState('diario');
  const [dataAgendada, setDataAgendada] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const [totalKawa, setTotalKawa] = useState(0);
  const [totalEla, setTotalEla] = useState(0);

  const buscarPlacarEterno = async () => {
    const { data, error } = await supabase.from('placar_eterno').select('usuario');
    if (!error && data) {
      setTotalKawa(data.filter(p => p.usuario === 'Kawã').length);
      setTotalEla(data.filter(p => p.usuario === 'Rilary').length);
    }
  };

  useEffect(() => {
    buscarPlacarEterno();
    const canal = supabase
      .channel('blindagem-placar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'placar_eterno' }, () => {
        buscarPlacarEterno();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => {
        fetchChallenges();
      })
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, []);

  const fazerLogin = (nome) => {
    localStorage.setItem('user_denguinho', nome);
    setUsuarioAtivo(nome);
  };

  const fazerLogout = () => {
    localStorage.removeItem('user_denguinho');
    setUsuarioAtivo(null);
  };

  const criarDesafio = async () => {
    if (!novoTitulo.trim() || !dataAgendada) {
      alert("Preencha o título e selecione o período!");
      return;
    }

    const desafioExistente = challenges.find(c => c.tipo === novoTipo && c.data_agendada === dataAgendada);

    if (desafioExistente) {
      const confirmar = window.confirm(`Já existe um desafio para este período (${dataAgendada}). Deseja substituir pelo novo?`);
      if (!confirmar) return;

      const { error } = await supabase.from('challenges')
        .update({ titulo: novoTitulo, descricao: novaDescricao, criado_por: usuarioAtivo })
        .eq('id', desafioExistente.id);

      if (!error) { setNovoTitulo(''); setNovaDescricao(''); setDataAgendada(''); setShowModal(false); }
    } else {
      const { error } = await supabase.from('challenges').insert([{
        titulo: novoTitulo, descricao: novaDescricao, tipo: novoTipo, data_agendada: dataAgendada, criado_por: usuarioAtivo
      }]);
      if (!error) { setNovoTitulo(''); setNovaDescricao(''); setDataAgendada(''); setShowModal(false); }
    }
  };

  const getMensagemResenha = () => {
    if (totalKawa === 0 && totalEla === 0) return "BORAAAAA!!!";
    if (totalKawa === totalEla) return "EMPATE TÉCNICO! QUEM VAI DESEMPATAR?";
    if (totalKawa > totalEla) return "FALA DELEEE, ACORDA PRA VIDA RILARY!";
    return "O COMANDO É DA MAIORAL, SEGURA ELA KAWÃ!";
  };

  const checarSeExiste = (data, tipo) => {
    return challenges.some(c => c.tipo === tipo && c.data_agendada === data);
  };

  if (!usuarioAtivo) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center p-6 transition-colors ${darkMode ? 'bg-slate-950 text-white' : 'bg-[#F8FAFC]'}`}>
        <h1 className="text-6xl font-black italic mb-2 tracking-tighter text-center uppercase">DENGUINHO<span className="text-rose-500">.</span></h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12">Quem está acessando?</p>
        <div className="w-full max-w-xs space-y-6">
          {['Kawã', 'Rilary'].map(nome => (
            <button key={nome} onClick={() => fazerLogin(nome)} className={`w-full py-10 rounded-[3rem] shadow-xl border-2 border-transparent transition-all text-3xl font-black active:scale-95 uppercase ${darkMode ? 'bg-slate-900 text-white shadow-none' : 'bg-white text-slate-800 shadow-slate-200/50'}`}>{nome}</button>
          ))}
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className="mt-16 text-3xl grayscale opacity-50 hover:opacity-100 transition-opacity">{darkMode ? '☀️' : '🌙'}</button>
      </div>
    );
  }

  if (loading) return <div className="p-10 text-center font-black h-screen flex items-center justify-center bg-slate-50 text-slate-400 uppercase tracking-widest">Aguarde...</div>;

  return (
    <div className={`min-h-screen p-4 pb-28 font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>

      <header className="max-w-md mx-auto flex justify-between items-center py-4">
         <h1 className="text-3xl font-black italic tracking-tighter uppercase">DENGUINHO<span className="text-rose-500">.</span></h1>
         <div className="flex items-center gap-3">
            <button onClick={() => setDarkMode(!darkMode)} className="text-2xl active:scale-90 transition-transform">{darkMode ? '☀️' : '🌙'}</button>
            <div className={`flex items-center gap-3 pl-4 pr-1 py-1 rounded-full border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
              <span className="text-[10px] font-black uppercase text-rose-500 tracking-tight">{usuarioAtivo}</span>
              <button onClick={fazerLogout} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-all active:scale-90 hover:bg-rose-50 overflow-hidden">
                <span className="text-slate-600 text-2xl font-black leading-none relative -top-[3px] -ml-[1px] transform scale-105">←</span>
              </button>
            </div>
         </div>
      </header>

      <section className="max-w-md mx-auto mb-3 grid grid-cols-2 gap-3">
        <div className={`p-4 rounded-[2rem] border transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest text-center">Kawã</p>
          <p className="text-2xl font-black text-rose-500 text-center leading-none">{totalKawa}</p>
        </div>
        <div className={`p-4 rounded-[2rem] border transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest text-center">Rilary</p>
          <p className="text-2xl font-black text-rose-500 text-center leading-none">{totalEla}</p>
        </div>
      </section>

      <div className="max-w-md mx-auto mb-6 text-center">
        <p className="text-[10px] font-black italic text-slate-400 uppercase tracking-tighter animate-bounce">{getMensagemResenha()}</p>
      </div>

      <nav className="max-w-md mx-auto flex gap-2 mb-6">
        {['diario', 'semanal', 'mensal'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? (darkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white') : (darkMode ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400 shadow-sm border border-slate-100')}`}>{t}</button>
        ))}
      </nav>

     <main className="max-w-md mx-auto space-y-4">
       {(() => {
         // LÓGICA DE EXIBIÇÃO CORRIGIDA: Mostra todos do tipo selecionado e os ordena perfeitamente.
         const desafiosExibicao = challenges
           .filter(c => c.tipo === tab)
           .sort((a, b) => {
             // Garante que SEM 1 vem antes de SEM 2, e EXTRA por último
             if (tab === 'semanal') {
               const ordemSemanas = { 'SEM 1': 1, 'SEM 2': 2, 'SEM 3': 3, 'SEM 4': 4, 'EXTRA': 5 };
               return (ordemSemanas[a.data_agendada] || 99) - (ordemSemanas[b.data_agendada] || 99);
             }
             // Para os diários, ordena pela data (ex: 01/03 antes do 02/03)
             return a.data_agendada.localeCompare(b.data_agendada);
           });

         if (desafiosExibicao.length === 0) {
           return (
             <div className="p-8 rounded-[2.5rem] border-2 border-dashed text-center opacity-50">
               <p className="text-xs uppercase font-black tracking-widest">Ainda não há metas aqui</p>
             </div>
           );
         }

         return desafiosExibicao.map(ch => (
           <ChallengeCard key={ch.id} challenge={ch} usuarioAtivo={usuarioAtivo} darkMode={darkMode} />
         ));
       })()}
     </main>

      <div className="fixed bottom-8 right-8 z-50">
        <button onClick={() => setShowModal(true)} className="relative w-16 h-16 bg-slate-900 dark:bg-rose-500 rounded-2xl shadow-2xl flex items-center justify-center transition-all active:scale-90 active:translate-y-1 group border-b-4 border-slate-950 dark:border-rose-700">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute w-full h-[3px] bg-white rounded-full"></div>
            <div className="absolute h-full w-[3px] bg-white rounded-full"></div>
          </div>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className={`w-full max-w-md rounded-t-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
            <h2 className="text-2xl font-black mb-6 italic uppercase tracking-tighter">Novo Desafio:</h2>

            <input className={`w-full p-4 rounded-2xl mb-3 outline-none font-bold border-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`} placeholder="O que vamos fazer?" value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} />

            <textarea className={`w-full p-4 rounded-2xl mb-6 outline-none font-medium border-2 resize-none h-24 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`} placeholder="Algum detalhe extra?" value={novaDescricao} onChange={e => setNovaDescricao(e.target.value)} />

            <div className="flex gap-2 mb-6">
              {['diario', 'semanal', 'mensal'].map(t => (
                <button key={t} onClick={() => { setNovoTipo(t); setDataAgendada(''); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${novoTipo === t ? 'bg-rose-500 text-white' : (darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400')}`}>{t}</button>
              ))}
            </div>

            <div className="mb-8">
              <p className="text-[10px] font-black uppercase mb-3 text-slate-400">Quando?</p>
              <div className="flex flex-wrap gap-2">

                {novoTipo === 'diario' && [...Array(31)].map((_, i) => {
                  const d = `${String(i + 1).padStart(2, '0')}/03/2026`;
                  const temDesafio = checarSeExiste(d, 'diario');

                  let classesBtn = `w-[13.5%] aspect-square rounded-xl text-[10px] font-black flex items-center justify-center transition-all border-2 `;
                  if (dataAgendada === d) classesBtn += 'bg-rose-500 border-rose-500 text-white';
                  else if (temDesafio) classesBtn += darkMode ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600';
                  else classesBtn += darkMode ? 'bg-slate-800 border-transparent text-slate-400' : 'bg-slate-50 border-transparent text-slate-400';

                  return <button key={i} onClick={() => setDataAgendada(d)} className={classesBtn}>{i + 1}</button>;
                })}

                {novoTipo === 'semanal' && ['SEM 1', 'SEM 2', 'SEM 3', 'SEM 4', 'EXTRA'].map(s => {
                  const temDesafio = checarSeExiste(s, 'semanal');

                  let classesBtn = `flex-1 min-w-[30%] py-4 rounded-xl text-[10px] font-black transition-all border-2 `;
                  if (dataAgendada === s) classesBtn += 'bg-rose-500 border-rose-500 text-white';
                  else if (temDesafio) classesBtn += darkMode ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600';
                  else classesBtn += darkMode ? 'bg-slate-800 border-transparent text-slate-400' : 'bg-slate-100 border-transparent text-slate-400';

                  return <button key={s} onClick={() => setDataAgendada(s)} className={classesBtn}>{s}</button>;
                })}

                {novoTipo === 'mensal' && ['MARÇO'].map(m => {
                  const temDesafio = checarSeExiste(m, 'mensal');

                  let classesBtn = `flex-1 py-4 rounded-xl text-[10px] font-black transition-all border-2 `;
                  if (dataAgendada === m) classesBtn += 'bg-rose-500 border-rose-500 text-white';
                  else if (temDesafio) classesBtn += darkMode ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600';
                  else classesBtn += darkMode ? 'bg-slate-800 border-transparent text-slate-400' : 'bg-slate-100 border-transparent text-slate-400';

                  return <button key={m} onClick={() => setDataAgendada(m)} className={classesBtn}>{m}</button>;
                })}

              </div>
            </div>

            <div className="flex gap-4">
               <button onClick={() => setShowModal(false)} className="flex-1 py-4 font-black text-xs text-slate-400 uppercase">Sair</button>
               <button onClick={criarDesafio} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-rose-500/20">Criar Meta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() { return <ChallengeProvider><MainContent /></ChallengeProvider>; }