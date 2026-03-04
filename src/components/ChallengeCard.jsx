import React, { useState, useEffect, useRef } from 'react';
import { useChallenges } from '../context/ChallengeContext';

const ChallengeCardComponent = ({ challenge, usuarioAtivo, darkMode }) => {
  const { marcarPonto, atualizarTitulo } = useChallenges();
  const [showMenu, setShowMenu] = useState(false);
  const [showGrade, setShowGrade] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Trava para evitar cliques duplos

  const [novoTitulo, setNovoTitulo] = useState(challenge.titulo);
  const [novaDescricao, setNovaDescricao] = useState(challenge.descricao || "");

  const [erroSutil, setErroSutil] = useState("");
  const menuRef = useRef(null);

  // Controle do Modal de Confirmação Manual
  const [confirmacaoManual, setConfirmacaoManual] = useState({ aberto: false, dia: null });

  useEffect(() => {
    setNovoTitulo(challenge.titulo);
    setNovaDescricao(challenge.descricao || "");
  }, [challenge.titulo, challenge.descricao]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const hojeStr = hoje.toLocaleDateString('pt-BR');
  const diaAtual = hoje.getDate();
  const isDiario = challenge.tipo === 'diario';
  const dataAgendada = challenge.data_agendada;
  const historico = challenge.historico_pontos || [];
  const partesData = dataAgendada.split('/');
  const diasFeitos = historico.filter(p => p.usuario === usuarioAtivo).map(p => parseInt(p.data.split('/')[0]));
  const jaFizStatusPrincipal = isDiario ? diasFeitos.length > 0 : diasFeitos.includes(diaAtual);

  const obterIntervalo = () => {
    if (challenge.tipo === 'semanal') {
      const intervalos = { 'SEM 1': [1, 7], 'SEM 2': [8, 14], 'SEM 3': [15, 21], 'SEM 4': [22, 28], 'EXTRA': [29, 31] };
      return intervalos[dataAgendada] || [1, 7];
    }
    return [1, 31];
  };

  const [inicioG, fimG] = obterIntervalo();
  const podeMarcarHoje = isDiario ? dataAgendada === hojeStr : (diaAtual >= inicioG && diaAtual <= fimG);

  const handleSalvarTudo = async () => {
    const tituloTrim = novoTitulo.trim();
    const descTrim = novaDescricao.trim();
    if (tituloTrim && (tituloTrim !== challenge.titulo || descTrim !== challenge.descricao)) {
      try {
        await atualizarTitulo(challenge.id, tituloTrim, descTrim);
      } catch (err) {
        console.error("Erro ao atualizar desafio:", err);
      }
    }
    setIsEditing(false);
  };

  // FUNÇÃO DE CHECK-IN COM TRAVA E VIBRAÇÃO
  const executarCheckIn = async (dia) => {
    if (isLoading) return;

    // Feedback tátil (vibração curta)
    if (navigator.vibrate) navigator.vibrate(50);

    setIsLoading(true);
    try {
      const dataFormatada = `${String(dia).padStart(2, '0')}/03/2026`;
      await marcarPonto(challenge.id, usuarioAtivo, dataFormatada);

      // Fecha o modal de confirmação manual, caso estivesse aberto
      setConfirmacaoManual({ aberto: false, dia: null });
    } catch (err) {
      setErroSutil("ERRO AO SALVAR");
      setTimeout(() => setErroSutil(""), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCliqueDia = (dia) => {
    if (dia > diaAtual) {
      setErroSutil(`BLOQUEADO: ${dia}`);
      setTimeout(() => setErroSutil(""), 2000);
      return;
    }
    if (diasFeitos.includes(dia)) return;

    // Se o dia clicado for hoje, marca direto.
    // Se for qualquer dia passado, abre a confirmação.
    if (dia === diaAtual) {
      executarCheckIn(dia);
    } else {
      setConfirmacaoManual({ aberto: true, dia: dia });
    }
  };

  const listaDias = [];
  for (let i = inicioG; i <= fimG; i++) listaDias.push(i);

  const estiloBotaoSaida = `w-full py-5 text-[11px] font-black uppercase tracking-widest rounded-[2rem] transition-all flex items-center justify-center gap-2 select-none touch-manipulation ${
    darkMode ? 'text-slate-400 active:text-[#FF1E56] active:bg-slate-800' : 'text-slate-950 active:text-[#FF1E56] active:bg-rose-50'
  }`;

  return (
    <div className={`p-8 rounded-[3.5rem] border transition-all duration-300 relative flex flex-col justify-between min-h-[320px] ${
      darkMode ? 'bg-slate-950 border-slate-800 shadow-2xl shadow-black/20' : 'bg-white border-slate-100 shadow-xl shadow-slate-100/40'
    }`}>

      {/* MODAL DE CONFIRMAÇÃO MANUAL (Só aparece se clicar num dia passado) */}
      {confirmacaoManual.aberto && (
        <div onClick={() => setConfirmacaoManual({ aberto: false, dia: null })} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div onClick={(e) => e.stopPropagation()} className={`${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'} rounded-[3rem] p-10 w-full max-w-[340px] shadow-2xl text-center flex flex-col items-center animate-in zoom-in duration-300`}>
            <h4 className={`${darkMode ? 'text-white' : 'text-slate-950'} text-2xl font-black uppercase mb-6 tracking-tighter`}>Marcar manualmente <span className="text-[#FF1E56]">?</span></h4>
            <div className={`mb-10 rounded-[2rem] py-4 px-6 w-full text-[12px] font-black uppercase leading-tight ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-900'}`}>
              Confirmar ponto - <span className="text-[#FF1E56]">DIA {confirmacaoManual.dia}</span>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <button onClick={() => executarCheckIn(confirmacaoManual.dia)} className={`w-full py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] active:scale-[0.96] transition-all shadow-xl ${darkMode ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'}`}>marcar</button>
              <button onClick={() => setConfirmacaoManual({ aberto: false, dia: null })} className={estiloBotaoSaida}>Sair</button>
            </div>
          </div>
        </div>
      )}

      {/* ÁREA SUPERIOR */}
      <div className="absolute top-4 right-4 z-10" ref={menuRef}>
        {showGrade || isEditing ? (
          <button
            onClick={() => { setShowGrade(false); setIsEditing(false); }}
            className={`w-14 h-14 flex items-center justify-center rounded-full transition-all active:scale-90 ${darkMode ? 'active:bg-slate-800' : 'active:bg-slate-100'}`}
          >
            <div className="relative w-5 h-5">
              <div className={`absolute w-full h-1 top-1/2 left-0 -rotate-45 rounded-full ${darkMode ? 'bg-white' : 'bg-slate-950'}`}></div>
              <div className="absolute w-full h-1 top-1/2 left-0 rotate-45 rounded-full bg-[#FF1E56]"></div>
            </div>
          </button>
        ) : (
          <>
            <button onClick={() => setShowMenu(!showMenu)} className={`w-14 h-14 flex items-center justify-center rounded-full transition-colors ${darkMode ? 'active:bg-slate-800' : 'active:bg-slate-100'}`}>
              <div className="flex gap-1.5">
                <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-white' : 'bg-slate-900'}`}></div>
                <div className="w-2 h-2 rounded-full bg-[#FF1E56]"></div>
              </div>
            </button>
            {showMenu && (
              <div className={`absolute right-0 mt-2 w-56 rounded-[2.5rem] shadow-2xl border-4 p-2 z-20 animate-in slide-in-from-top-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
                <button onClick={() => { setShowGrade(true); setShowMenu(false); }} className={`w-full text-left px-6 py-5 text-[11px] font-black uppercase rounded-[1.8rem] transition-all ${darkMode ? 'text-white active:bg-slate-800' : 'text-slate-900 active:bg-rose-50'}`}>Manual</button>
                <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className={`w-full text-left px-6 py-5 text-[11px] font-black uppercase rounded-[1.8rem] transition-all ${darkMode ? 'text-white active:bg-slate-800' : 'text-slate-900 active:bg-rose-50'}`}>Editar</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* CONTEÚDO */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest ${darkMode ? 'bg-slate-900 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>{challenge.tipo}</span>
          {erroSutil && <span className="text-[11px] font-black text-[#FF1E56] animate-pulse">{erroSutil}</span>}
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            <input
              autoFocus value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
              className={`text-2xl font-black bg-transparent border-b-4 outline-none w-full pb-1 uppercase tracking-tighter focus:border-[#FF1E56] transition-colors ${darkMode ? 'text-white border-slate-800' : 'text-slate-950 border-slate-900'}`}
            />
            <textarea
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
              rows="2"
              className={`text-[11px] font-extrabold border-l-4 border-[#FF1E56] outline-none w-full p-3 uppercase tracking-tight transition-colors rounded-r-xl resize-none ${darkMode ? 'bg-slate-900 text-slate-300 focus:bg-slate-800' : 'bg-slate-50 text-slate-950 focus:bg-rose-50'}`}
            />
          </div>
        ) : showGrade ? (
          <div className="grid grid-cols-5 gap-3 mt-2 animate-in fade-in">
            {(isDiario ? [parseInt(partesData[0])] : listaDias).map(dia => (
              <button key={dia} onClick={() => handleCliqueDia(dia)}
                disabled={isLoading}
                className={`aspect-square rounded-2xl text-[12px] font-black border-2 transition-all active:scale-90
                  ${diasFeitos.includes(dia) ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : dia > diaAtual ? 'opacity-10' : dia === diaAtual ? 'border-[#FF1E56] text-[#FF1E56] bg-rose-50' : darkMode ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-50 border-slate-50 text-slate-300'}`}
              >
                {dia}
              </button>
            ))}
          </div>
        ) : (
          <>
            <h3 className={`text-3xl font-black leading-[1.1] uppercase tracking-tighter break-words ${darkMode ? 'text-white' : 'text-slate-950'}`}>
              {challenge.titulo}<span className="text-[#FF1E56]">.</span>
            </h3>
            {challenge.descricao && (
              <div className={`mt-5 p-4 border-l-4 border-[#FF1E56] rounded-r-2xl rounded-l-md animate-in slide-in-from-left-2 duration-300 ${darkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                <p className={`text-[11px] font-extrabold uppercase tracking-tight leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-950'}`}>
                  {challenge.descricao}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* RODAPÉ */}
      <div className="mt-10 flex flex-col gap-3">
        {isEditing ? (
          <>
            <button onClick={handleSalvarTudo} className={`w-full py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] active:scale-[0.96] transition-all shadow-xl ${darkMode ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'}`}>
              Salvar Alterações
            </button>
            <button onClick={() => { setIsEditing(false); setNovoTitulo(challenge.titulo); setNovaDescricao(challenge.descricao || ""); }} className={estiloBotaoSaida}>
              Cancelar
            </button>
          </>
        ) : showGrade ? (
          <button onClick={() => setShowGrade(false)} className={estiloBotaoSaida}>
            Sair
          </button>
        ) : (
          <button
            onClick={() => executarCheckIn(diaAtual)}
            disabled={jaFizStatusPrincipal || !podeMarcarHoje || isLoading}
            className={`w-full py-6 rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl
              ${jaFizStatusPrincipal
                ? (darkMode ? 'bg-emerald-500/20 text-emerald-500' : 'bg-emerald-50 text-emerald-500')
                : !podeMarcarHoje
                ? (darkMode ? 'bg-slate-900 text-slate-700' : 'bg-slate-50 text-slate-200')
                : (darkMode ? 'bg-white text-slate-950' : 'bg-slate-950 text-white active:bg-black')}
              ${isLoading ? 'opacity-70 scale-95' : ''}`}
          >
            {isLoading ? 'Salvando...' : jaFizStatusPrincipal ? 'feito✨' : 'Check In'}
          </button>
        )}
      </div>
    </div>
  );
};

export const ChallengeCard = React.memo(ChallengeCardComponent);