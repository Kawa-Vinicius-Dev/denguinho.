import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';

const ChallengeContext = createContext();

export const ChallengeProvider = ({ children }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      // Padroniza os tipos para minúsculo para as abas funcionarem
      const formatados = data.map(ch => ({
        ...ch,
        tipo: ch.tipo ? ch.tipo.toLowerCase().trim() : 'diario'
      }));

      setChallenges(formatados);
    } catch (err) {
      console.error('Erro ao buscar:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const marcarPonto = async (id, usuario, dataStr) => {
    const ch = challenges.find(c => c.id === id);
    const novoHistorico = [...(ch.historico_pontos || []), { data: dataStr, usuario }];

    // ATUALIZAÇÃO OTIMISTA: Muda na tela antes de ir pro banco (evita piscar)
    setChallenges(prev => prev.map(c =>
      c.id === id ? { ...c, historico_pontos: novoHistorico } : c
    ));

    // 1. Atualiza o histórico do desafio específico
    const { error: erroChallenge } = await supabase
      .from('challenges')
      .update({ historico_pontos: novoHistorico })
      .eq('id', id);

    if (erroChallenge) {
      console.error("Erro ao salvar ponto no desafio:", erroChallenge);
      fetchChallenges(); // Se der erro, volta ao estado real do banco
      return;
    }

    // 2. AQUI ESTAVA O ERRO! Precisamos inserir no placar_eterno para os números subirem
    const { error: erroPlacar } = await supabase
      .from('placar_eterno')
      .insert([{ usuario: usuario, challenge_id: id }]);

    if (erroPlacar) {
      console.error("Erro ao atualizar o placar geral:", erroPlacar);
    }
  };

  useEffect(() => { fetchChallenges(); }, []);

  return (
    <ChallengeContext.Provider value={{ challenges, loading, fetchChallenges, marcarPonto }}>
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallenges = () => useContext(ChallengeContext);

export class Challenge {
  constructor(id, titulo, descricao, tipo, criadoPor) {
    this.id = id || crypto.randomUUID();
    this.titulo = titulo;
    this.descricao = descricao || "";
    this.tipo = tipo; // 'diario', 'semanal', 'mensal'
    this.criadoPor = criadoPor;
    this.historicoPontos = []; // Armazena objetos { data: "02/03/2026", usuario: "Kawa" }
    this.criadoEm = new Date().toISOString();
  }

  // Método para verificar se alguém já pontuou hoje
  static jaPontuouHoje(challenge, usuario) {
    const hoje = new Date().toLocaleDateString();
    return challenge.historicoPontos.some(p => p.data === hoje && p.usuario === usuario);
  }

  // Método para contar pontos totais de um usuário neste desafio
  static contarPontos(challenge, usuario) {
    return challenge.historicoPontos.filter(p => p.usuario === usuario).length;
  }
}