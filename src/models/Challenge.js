// src/models/Challenge.js

export const criarDesafio = (titulo, tipo, criadoPor) => {
  const agora = new Date();
  const expiraEm = new Date();

  if (tipo === 'diario') {
    expiraEm.setDate(agora.getDate() + 1);
  } else if (tipo === 'semanal') {
    expiraEm.setDate(agora.getDate() + 7);
  } else if (tipo === 'mensal') {
    expiraEm.setDate(agora.getDate() + 31);
  }

  return {
    id: crypto.randomUUID(),
    titulo,
    tipo,
    criadoPor, // 'Kawa' ou 'Parceira'
    concluido: false,
    criadoEm: agora.toISOString(),
    expiraEm: expiraEm.toISOString(),
  };
};

export const obterStatusDesafio = (desafio) => {
  if (desafio.concluido) return 'completed';
  const agora = new Date();
  const expiracao = new Date(desafio.expiraEm);
  return agora > expiracao ? 'expired' : 'active';
};