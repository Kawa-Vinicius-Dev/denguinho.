import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';

const ChallengeContext = createContext();

export const ChallengeProvider = ({ children }) => {
  const [challenges, setChallenges] = useState([]);
  const [totalKawa, setTotalKawa] = useState(0);
  const [totalEla, setTotalEla] = useState(0);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      const formatados = data.map(ch => ({
        ...ch,
        tipo: ch.tipo ? ch.tipo.toLowerCase().trim() : 'diario'
      }));

      setChallenges(formatados);
    } catch (err) {
      console.error('Erro ao buscar desafios:', err.message);
    }
  };

  const fetchPlacar = async () => {
    try {
      const { data, error } = await supabase
        .from('placar_eterno')
        .select('usuario');

      if (error) throw error;

      if (data) {
        setTotalKawa(data.filter(p => p.usuario === 'Kawã').length);
        setTotalEla(data.filter(p => p.usuario === 'Rilary').length);
      }
    } catch (err) {
      console.error('Erro ao buscar placar:', err.message);
    }
  };

  // --- NOVA FUNÇÃO DE SALVAMENTO (TÍTULO + DESCRIÇÃO) ---
  const atualizarTitulo = async (id, novoTitulo, novaDescricao) => {
    try {
      // 1. Atualização Otimista (muda na tela na hora)
      setChallenges(prev => prev.map(ch =>
        ch.id === id ? { ...ch, titulo: novoTitulo, descricao: novaDescricao } : ch
      ));

      // 2. Gravação no Supabase
      const { error } = await supabase
        .from('challenges')
        .update({
          titulo: novoTitulo,
          descricao: novaDescricao
        })
        .eq('id', id);

      if (error) throw error;

      console.log("Desafio atualizado com sucesso!");

    } catch (err) {
      console.error('Erro ao salvar no banco:', err.message);
      // Se der erro, recarrega os dados originais para não ficar errado na tela
      fetchChallenges();
    }
  };

  const marcarPonto = async (id, usuario, dataStr) => {
    const ch = challenges.find(c => c.id === id);
    if (!ch) return;

    if (ch.historico_pontos?.some(p => p.data === dataStr && p.usuario === usuario)) {
      return;
    }

    const novoHistorico = [...(ch.historico_pontos || []), { data: dataStr, usuario }];

    setChallenges(prev => prev.map(c =>
      c.id === id ? { ...c, historico_pontos: novoHistorico } : c
    ));

    if (usuario === 'Kawã') {
      setTotalKawa(prev => prev + 1);
    } else {
      setTotalEla(prev => prev + 1);
    }

    const { error } = await supabase.rpc('marcar_ponto_safe', {
      challenge_id_param: id,
      user_param: usuario,
      data_param: dataStr
    });

    if (error) {
      console.error("Erro ao salvar ponto:", error.message);
      fetchChallenges();
      fetchPlacar();
    }
  };

  useEffect(() => {
    fetchChallenges();
    fetchPlacar();

    const canal = supabase
      .channel('denguinho-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => {
        fetchChallenges();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'placar_eterno' }, () => {
        fetchPlacar();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  return (
    <ChallengeContext.Provider
      value={{
        challenges,
        marcarPonto,
        atualizarTitulo, // <--- OBRIGATÓRIO EXPORTAR AQUI
        totalKawa,
        totalEla,
        fetchChallenges
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
};

export const useChallenges = () => useContext(ChallengeContext);