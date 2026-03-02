import React, { useContext } from 'react';
import { ChallengeContext } from '../context/ChallengeContext';
import { obterStatusDesafio } from '../models/Challenge';

export const ChallengeCard = ({ challenge }) => {
  const { completarDesafio } = useContext(ChallengeContext);
  const status = obterStatusDesafio(challenge);

  const typeStyles = {
    diario: 'border-blue-500 bg-blue-50',
    semanal: 'border-purple-500 bg-purple-50',
    mensal: 'border-pink-500 bg-pink-50'
  };

  return (
    <div className={`p-4 border-l-4 rounded-r-lg shadow-sm mb-3 ${typeStyles[challenge.tipo]}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-gray-800">{challenge.titulo}</h3>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
            {challenge.tipo} • Por {challenge.criadoPor}
          </p>
        </div>

        {status === 'active' && (
          <button
            onClick={() => completarDesafio(challenge.id)}
            className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-green-600 transition"
          >
            Concluir
          </button>
        )}

        {status === 'completed' && <span className="text-green-600 font-bold">✅</span>}
        {status === 'expired' && <span className="text-red-500 font-bold">❌ Expirou</span>}
      </div>
    </div>
  );
};