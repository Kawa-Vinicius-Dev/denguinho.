import { useState, useEffect } from 'react';
import { ChallengeProvider, useChallenges } from './context/ChallengeContext';
import { ChallengeCard } from './components/ChallengeCard';
import { supabase } from './services/supabase';

function MainContent() {
    // 1. CSS ajustado para Mobile (Snap Scroll + Barra Invisível)
    useEffect(() => {
      const style = document.createElement('style');
      style.textContent = `
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x mandatory;
        }
        .snap-item {
          scroll-snap-align: center;
          flex-shrink: 0 !important;
        }
      `;
      document.head.append(style);
      return () => style.remove();
    }, []);

  const { challenges, fetchChallenges, totalKawa, totalEla } = useChallenges();
  const [tab, setTab] = useState('diario');
  const [showModal, setShowModal] = useState(false);

  const [usuarioAtivo, setUsuarioAtivo] = useState(localStorage.getItem('user_denguinho') || null);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novoTipo, setNovoTipo] = useState('diario');
  const [dataAgendada, setDataAgendada] = useState('');
  const [darkMode, setDarkMode] = useState(false);

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

      try {
        if (desafioExistente) {
          // SEGURANÇA ADICIONADA: Só prossegue se o usuário confirmar
          const confirmar = window.confirm(`Já existe um desafio para ${dataAgendada}. Deseja substituir o desafio atual?`);

          if (!confirmar) return; // Se clicar em cancelar, a função para aqui.

          await supabase.from('challenges')
            .update({
              titulo: novoTitulo,
              descricao: novaDescricao,
              criado_por: usuarioAtivo
            })
            .eq('id', desafioExistente.id);
        } else {
          await supabase.from('challenges').insert([{
            titulo: novoTitulo,
            descricao: novaDescricao,
            tipo: novoTipo,
            data_agendada: dataAgendada,
            criado_por: usuarioAtivo
          }]);
        }

        setNovoTitulo('');
        setNovaDescricao('');
        setDataAgendada('');
        setShowModal(false);
        await fetchChallenges();
      } catch (err) {
        alert("Erro ao salvar desafio. Tente novamente.");
        console.error(err);
      }
    };

  const getMensagemResenha = () => {
    if (totalKawa === 0 && totalEla === 0) return "BORAAAAA!!!";
    if (totalKawa === totalEla) return "EMPATE TÉCNICO! QUEM VAI DESEMPATAR?";
    if (totalKawa > totalEla) return "FALA DELEEE, ACORDA PRA VIDA RILARY!";
    return "O COMANDO É DA MAIORAL, SEGURA ELA KAWÃ!";
  };

  if (!usuarioAtivo) {
    return (
      <div className={`h-[100dvh] flex flex-col items-center justify-center p-8 transition-colors duration-700 ${darkMode ? 'bg-slate-950 text-white' : 'bg-[#F8FAFC]'}`}>
        <div className="animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center w-full max-w-sm">
          <h1 className="text-6xl font-[1000] italic mb-1 tracking-tighter text-center uppercase select-none drop-shadow-xl">
            DENGUINHO<span className="text-rose-500">.</span>
          </h1>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] mb-14 opacity-70">Privativo & Exclusivo</p>
          <div className="w-full space-y-4">
            {['Kawã', 'Rilary'].map(nome => (
              <button
                key={nome}
                onClick={() => fazerLogin(nome)}
                className={`w-full py-8 rounded-[2.2rem] transition-all duration-300 text-3xl font-black uppercase active:scale-90 active:opacity-80 shadow-2xl ${darkMode ? 'bg-slate-900 text-white shadow-black/40' : 'bg-white text-slate-800 shadow-slate-200/60'}`}
              >
                {nome}
              </button>
            ))}
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="mt-16 text-4xl hover:scale-110 active:scale-75 transition-all p-4 duration-500 select-none">{darkMode ? '☀️' : '🌙'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-32 font-sans transition-colors duration-500 selection:bg-rose-200 ${darkMode ? 'bg-slate-950 text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>

      <header className={`max-w-md mx-auto flex justify-between items-center px-6 py-5 sticky top-0 z-50 backdrop-blur-xl border-b transition-colors ${darkMode ? 'bg-slate-950/80 border-slate-900' : 'bg-[#F8FAFC]/80 border-slate-100'}`}>
         <h1 className="text-2xl font-[1000] italic tracking-tighter uppercase select-none">DENGUINHO<span className="text-rose-500">.</span></h1>
         <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="text-xl active:scale-75 transition-all duration-500">{darkMode ? '☀️' : '🌙'}</button>
            <div className={`flex items-center gap-2 pl-3 pr-1 py-1 rounded-full border ${darkMode ? 'bg-slate-900 border-slate-800 shadow-inner' : 'bg-white border-slate-100 shadow-sm'}`}>
              <span className="text-[10px] font-black uppercase text-rose-500 tracking-tight">{usuarioAtivo}</span>
              <button onClick={fazerLogout} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-75 transition-all">
                <span className="text-slate-600 text-xl font-black relative -top-[1px]">←</span>
              </button>
            </div>
         </div>
      </header>

      <div className="max-w-md mx-auto px-4 mt-6">
        <section className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-5 rounded-[2.2rem] border transition-all ${darkMode ? 'bg-slate-900/50 border-slate-800 shadow-black/20' : 'bg-white border-slate-50 shadow-xl shadow-slate-200/30'}`}>
            <p className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-[0.2em] text-center">Kawã</p>
            <p className="text-4xl font-[1000] text-rose-500 text-center leading-none">{totalKawa}</p>
          </div>
          <div className={`p-5 rounded-[2.2rem] border transition-all ${darkMode ? 'bg-slate-900/50 border-slate-800 shadow-black/20' : 'bg-white border-slate-50 shadow-xl shadow-slate-200/30'}`}>
            <p className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-[0.2em] text-center">Rilary</p>
            <p className="text-4xl font-[1000] text-rose-500 text-center leading-none">{totalEla}</p>
          </div>
        </section>

        <div className="mb-8 text-center">
          <p className="text-[10px] font-bold italic text-slate-500 uppercase tracking-widest px-6 opacity-80 animate-pulse">{getMensagemResenha()}</p>
        </div>

        <nav className={`flex p-1.5 rounded-[1.5rem] mb-10 sticky top-[80px] z-40 backdrop-blur-md shadow-sm border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
          {['diario', 'semanal', 'mensal'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 ${
                tab === t ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        <main className="space-y-8">
         {(() => {
           const desafiosExibicao = challenges
             .filter(c => c.tipo === tab)
             .sort((a, b) => {
               if (tab === 'semanal') {
                 const ordemSemanas = { 'SEM 1': 1, 'SEM 2': 2, 'SEM 3': 3, 'SEM 4': 4, 'EXTRA': 5 };
                 return (ordemSemanas[a.data_agendada] || 99) - (ordemSemanas[b.data_agendada] || 99);
               }
               return a.data_agendada.localeCompare(b.data_agendada);
             });

           if (desafiosExibicao.length === 0) {
             return (
               <div className="py-20 flex flex-col items-center justify-center opacity-30 select-none">
                 <span className="text-5xl mb-4 grayscale">🏆</span>
                 <p className="text-[11px] uppercase font-black tracking-[0.3em]">Nada agendado</p>
               </div>
             );
           }

           return desafiosExibicao.map(ch => {
             let dataDisplay = ch.data_agendada;
             if (ch.tipo === 'diario') {
               const diaNumero = parseInt(ch.data_agendada.split('/')[0], 10);
               dataDisplay = `DIA ${diaNumero}`;
             }
             return (
               <div key={ch.id} className="relative group animate-in slide-in-from-bottom-6 duration-500">
                 <div className={`absolute -top-3.5 left-5 z-10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-[4px] shadow-sm transition-colors duration-500 ${darkMode ? 'bg-rose-600 text-white border-slate-950' : 'bg-rose-500 text-white border-[#F8FAFC]'}`}>
                   {dataDisplay}
                 </div>
                 <ChallengeCard challenge={ch} usuarioAtivo={usuarioAtivo} darkMode={darkMode} />
               </div>
             );
           });
         })()}
        </main>
      </div>

      <div className="fixed bottom-8 right-6 z-40">
        <button
          onClick={() => { setNovoTipo(tab); setDataAgendada(''); setShowModal(true); }}
          className={`w-16 h-16 rounded-[1.5rem] shadow-2xl flex items-center justify-center transition-all active:scale-90 active:rotate-45 border-b-4 hover:shadow-rose-500/40 ${darkMode ? 'bg-rose-500 border-rose-700' : 'bg-slate-900 border-slate-950 shadow-slate-900/30'}`}
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-white stroke-[4] stroke-linecap-round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-end justify-center animate-in fade-in duration-300">
          <div onClick={() => setShowModal(false)} className="absolute inset-0" />
          <div className={`relative w-full max-w-md rounded-t-[3rem] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom-full duration-500 flex flex-col max-h-[94vh] overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className={`w-14 h-1.5 rounded-full mx-auto mb-8 flex-shrink-0 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />

            <div className="overflow-y-auto overflow-x-hidden pr-2 -mr-2 no-scrollbar">
              <h2 className="text-3xl font-[1000] italic uppercase tracking-tighter mb-8 leading-none">Novo<br/>Desafio<span className="text-rose-500">.</span></h2>

              <div className="space-y-4 mb-8">
                <input
                  className={`w-full p-5 rounded-2xl outline-none font-bold text-lg border-2 focus:border-rose-500 transition-all ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}
                  placeholder="Título do desafio"
                  value={novoTitulo}
                  onChange={e => setNovoTitulo(e.target.value)}
                />
                <textarea
                  className={`w-full p-5 rounded-2xl outline-none font-medium text-base border-2 resize-none h-28 focus:border-rose-500 transition-all ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}
                  placeholder="Descrição..."
                  value={novaDescricao}
                  onChange={e => setNovaDescricao(e.target.value)}
                />
              </div>

              <div className={`flex p-1.5 rounded-2xl mb-4 ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
                {['diario', 'semanal', 'mensal'].map(t => (
                  <button key={t} onClick={() => { setNovoTipo(t); setDataAgendada(''); }} className={`flex-1 py-3.5 rounded-xl text-[10px] font-[1000] uppercase tracking-widest transition-all ${novoTipo === t ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-400'}`}>{t}</button>
                ))}
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex justify-between items-end ml-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Para quando?</p>
                    {dataAgendada && <span className="text-[10px] font-black text-rose-500 animate-in fade-in zoom-in uppercase tracking-tighter">{dataAgendada.split('/')[0]} SELECIONADO</span>}
                </div>

                {/* CARROSSEL DIÁRIO COM py-4 E DESTAQUE VERDE */}
                {novoTipo === 'diario' && (
                  <div className="flex gap-3 overflow-x-auto py-4 no-scrollbar px-1">
                    {[...Array(31)].map((_, i) => {
                      const diaNum = i + 1;
                      const d = `${String(diaNum).padStart(2, '0')}/03/2026`;
                      const isSelected = dataAgendada === d;
                      const jaExiste = challenges.some(c => c.tipo === 'diario' && c.data_agendada === d);

                      return (
                        <button
                          key={i}
                          onClick={() => setDataAgendada(d)}
                          className={`snap-item w-16 h-24 rounded-[2.2rem] flex flex-col items-center justify-center gap-2 transition-all duration-300 border-2 active:scale-75
                            ${isSelected
                              ? 'bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-500/40 scale-110 z-10'
                              : jaExiste
                                ? (darkMode ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' : 'bg-emerald-50 border-emerald-200 text-emerald-600')
                                : (darkMode ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400')
                            }`}
                        >
                          <span className="text-[9px] font-bold uppercase opacity-60">Mar</span>
                          <span className="text-xl font-[1000] tracking-tighter">{diaNum}</span>
                        </button>
                      );
                    })}
                    <div className="flex-shrink-0 w-8 h-1" />
                  </div>
                )}

                {/* CARROSSEL SEMANAL COM py-4 E DESTAQUE VERDE */}
                {novoTipo === 'semanal' && (
                  <div className="flex gap-3 overflow-x-auto py-4 no-scrollbar px-1">
                    {['SEM 1', 'SEM 2', 'SEM 3', 'SEM 4', 'EXTRA'].map(s => {
                      const isSelected = dataAgendada === s;
                      const jaExiste = challenges.some(c => c.tipo === 'semanal' && c.data_agendada === s);

                      return (
                        <button
                          key={s}
                          onClick={() => setDataAgendada(s)}
                          className={`snap-item w-32 py-8 rounded-[2.5rem] flex flex-col items-center border-2 transition-all duration-300 active:scale-95
                            ${isSelected
                              ? 'bg-rose-500 border-rose-500 text-white shadow-xl scale-105 z-10'
                              : jaExiste
                                ? (darkMode ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' : 'bg-emerald-50 border-emerald-200 text-emerald-600')
                                : (darkMode ? 'bg-slate-950 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-100 text-slate-400')
                            }`}
                        >
                          <span className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">Período</span>
                          <span className="text-lg font-black">{s}</span>
                        </button>
                      );
                    })}
                    <div className="flex-shrink-0 w-8 h-1" />
                  </div>
                )}

                {novoTipo === 'mensal' && (
                  <button onClick={() => setDataAgendada('MARÇO')} className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all border-2 active:scale-[0.98] ${dataAgendada === 'MARÇO' ? 'bg-rose-500 border-rose-500 text-white shadow-xl' : (darkMode ? 'bg-slate-950 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-100 text-slate-400')}`}>Mês de Março</button>
                )}
              </div>
            </div>

            <div className="flex gap-4 flex-shrink-0 pt-4 border-t border-slate-100 dark:border-slate-800 bg-transparent">
               <button onClick={() => setShowModal(false)} className="flex-1 py-5 font-black text-[11px] text-slate-400 uppercase tracking-[0.2em] active:opacity-50">Sair</button>
               <button onClick={criarDesafio} className="flex-[2.5] py-5 bg-rose-500 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-rose-500/40 active:scale-95 active:shadow-none transition-all">Salvar Desafio</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ChallengeProvider>
      <MainContent />
    </ChallengeProvider>
  );
}