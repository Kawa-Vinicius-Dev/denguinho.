import { createContext, useState, useEffect } from 'react';
import { criarDesafio } from '../models/Challenge'; // Nome corrigido aqui

export const ChallengeContext = createContext();

export const ChallengeProvider = ({ children }) => {
  const [challenges, setChallenges] = useState(() => {
    const saved = localStorage.getItem('@DesafioCasal:challenges');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('@DesafioCasal:challenges', JSON.stringify(challenges));
  }, [challenges]);

  const adicionarDesafio = (titulo, tipo, criadoPor) => {
    const novo = criarDesafio(titulo, tipo, criadoPor);
    setChallenges((prev) => [...prev, novo]);
  };

  const completarDesafio = (id) => {
    setChallenges((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, concluido: true } : ch))
    );
  };

  // Placar Individual
  const pontosKawa = challenges.filter(ch => ch.concluido && ch.criadoPor === 'Kawa').length;
  const pontosParceira = challenges.filter(ch => ch.concluido && ch.criadoPor === 'Parceira').length;

  return (
    <ChallengeContext.Provider value={{
      challenges,
      adicionarDesafio,
      completarDesafio,
      pontosKawa,
      pontosParceira
    }}>
      {children}
    </ChallengeContext.Provider>
  );
};