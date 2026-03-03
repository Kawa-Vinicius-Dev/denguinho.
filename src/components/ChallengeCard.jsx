import { useChallenges } from '../context/ChallengeContext';

export const ChallengeCard = ({ challenge, usuarioAtivo, darkMode }) => {
  const { marcarPonto } = useChallenges();
  const hojeStr = new Date().toLocaleDateString('pt-BR');
  const diaAtual = new Date().getDate(); // Pega o número do dia (1 a 31)

  const historico = challenge.historico_pontos || [];
  const jaFiz = historico.some(p => p.data === hojeStr && p.usuario === usuarioAtivo);

  const isDiario = challenge.tipo === 'diario';
  const dataAgendada = challenge.data_agendada;

  // --- LÓGICA DE TRAVA (SEM ALTERAR A ESTRUTURA) ---
  let podeMarcar = false;
  let mensagemBloqueio = "";

  if (isDiario) {
    podeMarcar = dataAgendada === hojeStr;
    mensagemBloqueio = `LIBERA NO DIA ${dataAgendada?.split('/')[0]}`;
  } else if (challenge.tipo === 'semanal') {
    // Travas de Semanas e Extra
    if (dataAgendada === 'SEM 1') {
        podeMarcar = diaAtual >= 1 && diaAtual <= 7;
        mensagemBloqueio = "SEMANA 1 ENCERRADA";
    }
    else if (dataAgendada === 'SEM 2') {
        podeMarcar = diaAtual >= 8 && diaAtual <= 14;
        mensagemBloqueio = diaAtual < 8 ? "LIBERA DIA 08" : "SEMANA 2 ENCERRADA";
    }
    else if (dataAgendada === 'SEM 3') {
        podeMarcar = diaAtual >= 15 && diaAtual <= 21;
        mensagemBloqueio = diaAtual < 15 ? "LIBERA DIA 15" : "SEMANA 3 ENCERRADA";
    }
    else if (dataAgendada === 'SEM 4') {
        podeMarcar = diaAtual >= 22 && diaAtual <= 28;
        mensagemBloqueio = diaAtual < 22 ? "LIBERA DIA 22" : "SEMANA 4 ENCERRADA";
    }
    else if (dataAgendada === 'EXTRA') {
        podeMarcar = diaAtual >= 29;
        mensagemBloqueio = "LIBERA DIA 29";
    }
  } else if (challenge.tipo === 'mensal') {
    podeMarcar = true; // Mensal libera o mês todo
  }

  const cardBg = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-transparent';
  const textColor = darkMode ? 'text-white' : 'text-slate-800';

  return (
    <div className={`p-6 rounded-[2rem] border-2 transition-all duration-300 ${cardBg} ${dataAgendada === hojeStr && !darkMode ? 'border-rose-200 shadow-lg' : 'shadow-sm'}`}>
      <div className="flex justify-between items-start mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${dataAgendada === hojeStr ? 'bg-rose-500 text-white' : (darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400')}`}>
              {challenge.tipo === 'diario' && `DIÁRIO MARÇO - DIA ${dataAgendada?.split('/')[0]}`}
              {challenge.tipo === 'semanal' && (dataAgendada === 'EXTRA' ? 'SEMANAL MARÇO - EXTRAS' : `SEMANAL MARÇO - ${dataAgendada}`)}
              {challenge.tipo === 'mensal' && 'MENSAL MARÇO'}
            </span>
            {dataAgendada === hojeStr && <span className="text-[8px] font-black text-rose-500 animate-pulse">● HOJE</span>}
          </div>

          <h3 className={`text-xl font-black leading-tight ${jaFiz ? 'opacity-30 line-through' : textColor}`}>
            {challenge.titulo}
          </h3>

          {challenge.descricao && <p className={`text-xs mt-2 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{challenge.descricao}</p>}
        </div>
      </div>

      <button
        onClick={() => marcarPonto(challenge.id, usuarioAtivo, hojeStr)}
        disabled={jaFiz || !podeMarcar}
        className={`w-full py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] transition-all
          ${jaFiz
            ? (darkMode ? 'bg-green-900/30 text-green-400 border-2 border-green-900/50' : 'bg-green-50 text-green-500 border-2 border-green-100')
            : podeMarcar
              ? `border-2 border-rose-500 text-rose-500 shadow-[4px_4px_0px_0px_#e11d48] active:shadow-none active:translate-x-1 active:translate-y-1 ${darkMode ? 'bg-slate-900' : 'bg-white'}`
              : (darkMode ? 'bg-slate-800 text-slate-600 border-2 border-transparent cursor-not-allowed' : 'bg-slate-50 text-slate-300 border-2 border-transparent cursor-not-allowed')
          }`}
      >
        {jaFiz ? 'CONCLUÍDO ✨' : podeMarcar ? 'CONCLUIR AGORA' : mensagemBloqueio}
      </button>
    </div>
  );
};