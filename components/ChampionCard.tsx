import React from 'react';
import { Champion, Difficulty } from '../types';
import { Check, Lock, HelpCircle } from 'lucide-react';

interface ChampionCardProps {
    champion: Champion;
    isGuessed: boolean;
    isGiveUp: boolean;
    difficulty: Difficulty;
}

export const ChampionCard: React.FC<ChampionCardProps> = ({ champion, isGuessed, isGiveUp, difficulty }) => {
    const isRevealed = isGuessed || isGiveUp;

    return (
        <div 
            className={`
                relative p-3 rounded-lg border transition-all duration-500 h-24 flex flex-col items-center justify-center text-center shadow-lg
                ${isGuessed 
                    ? 'bg-sky-900/40 border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]' 
                    : isGiveUp 
                        ? 'bg-red-900/20 border-red-900 text-red-300 grayscale' 
                        : 'bg-slate-900/80 border-slate-800'
                }
            `}
        >
            {isRevealed ? (
                <>
                    <div className="font-bold text-sm sm:text-base leading-tight text-slate-100 truncate w-full px-1">
                        {champion.name}
                    </div>
                    {isGuessed && (
                        <div className="absolute top-1 right-1 text-sky-400">
                            <Check size={12} />
                        </div>
                    )}
                    {isGiveUp && !isGuessed && (
                         <div className="absolute top-1 right-1 text-red-500 opacity-50">
                            <Lock size={12} />
                         </div>
                    )}
                </>
            ) : (
                <div className="text-slate-600 font-mono text-2xl select-none flex items-center justify-center w-full h-full">
                    {difficulty === Difficulty.NORMAL ? (
                         <span className="font-bold opacity-30">{champion.name.charAt(0)}</span>
                    ) : (
                        <HelpCircle size={20} className="opacity-20" />
                    )}
                </div>
            )}
        </div>
    );
};