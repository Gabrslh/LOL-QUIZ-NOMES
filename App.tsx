import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Trophy, AlertCircle, Play, BookOpen, Sparkles, Info } from 'lucide-react';
import { CHAMPIONS } from './constants';
import { Champion, Difficulty, GameState } from './types';
import { Button } from './components/Button';
import { ChampionCard } from './components/ChampionCard';
import { getChampionHint } from './services/geminiService';

const INITIAL_STATE: GameState = {
    guessedChampions: new Set(),
    gameStatus: 'menu',
    difficulty: Difficulty.NORMAL,
    startTime: null,
    endTime: null,
    giveUp: false,
};

export default function App() {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const [inputValue, setInputValue] = useState('');
    const [hint, setHint] = useState<{ text: string; visible: boolean; loading: boolean }>({ text: '', visible: false, loading: false });
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Sort champions alphabetically for display
    const sortedChampions = useMemo(() => {
        return [...CHAMPIONS].sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    const startGame = (difficulty: Difficulty) => {
        setGameState({
            ...INITIAL_STATE,
            gameStatus: 'playing',
            difficulty,
            startTime: Date.now(),
        });
        setInputValue('');
        setHint({ text: '', visible: false, loading: false });
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const giveUp = () => {
        setGameState(prev => ({
            ...prev,
            gameStatus: 'finished',
            endTime: Date.now(),
            giveUp: true
        }));
    };

    const checkAnswer = (input: string) => {
        const normalizedInput = input.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (!normalizedInput) return;

        const matchedChamp = CHAMPIONS.find(c => {
            // Check exact ID match (e.g. "kaisa")
            const normalizedId = c.id.toLowerCase();
            // Check name match stripped of special chars (e.g. "Kha'Zix" -> "khazix")
            const normalizedName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            return normalizedId === normalizedInput || normalizedName === normalizedInput;
        });

        if (matchedChamp && !gameState.guessedChampions.has(matchedChamp.id)) {
            const newGuessed = new Set(gameState.guessedChampions);
            newGuessed.add(matchedChamp.id);
            
            setGameState(prev => {
                const isFinished = newGuessed.size === CHAMPIONS.length;
                return {
                    ...prev,
                    guessedChampions: newGuessed,
                    gameStatus: isFinished ? 'finished' : 'playing',
                    endTime: isFinished ? Date.now() : null
                };
            });
            
            setInputValue(''); // Clear input on success
            
            // Scroll to the card? Maybe too jarring. Just playing a sound would be nice but not required.
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        checkAnswer(val);
    };

    const handleGetHint = async () => {
        if (hint.loading) return;
        
        // Find unguessed champions
        const unguessed = CHAMPIONS.filter(c => !gameState.guessedChampions.has(c.id));
        if (unguessed.length === 0) return;

        // Pick random unguessed
        const randomChamp = unguessed[Math.floor(Math.random() * unguessed.length)];

        setHint(prev => ({ ...prev, loading: true, visible: true, text: '' }));
        
        const aiHint = await getChampionHint(randomChamp);
        
        setHint({
            loading: false,
            visible: true,
            text: aiHint
        });
    };

    // Timer logic
    const [elapsedTime, setElapsedTime] = useState(0);
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (gameState.gameStatus === 'playing') {
            interval = setInterval(() => {
                if (gameState.startTime) {
                    setElapsedTime(Math.floor((Date.now() - gameState.startTime) / 1000));
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [gameState.gameStatus, gameState.startTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const percentage = Math.round((gameState.guessedChampions.size / CHAMPIONS.length) * 100);

    // Render Menu
    if (gameState.gameStatus === 'menu') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ryze_0.jpg')] bg-cover bg-center">
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
                <div className="relative z-10 max-w-2xl w-full bg-slate-900/90 border border-amber-500/30 p-8 rounded-2xl shadow-2xl text-center">
                    <div className="mb-6 flex justify-center text-amber-400">
                        <Trophy size={64} />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 mb-4 tracking-tighter" style={{fontFamily: 'Beaufort for LOL, serif'}}>
                        CHAMPION QUIZ
                    </h1>
                    <p className="text-slate-300 mb-8 text-lg">
                        Prove que você conhece todos os {CHAMPIONS.length} campeões da Liga.
                    </p>

                    <div className="grid gap-4 w-full max-w-md mx-auto">
                        <Button onClick={() => startGame(Difficulty.NORMAL)} variant="primary">
                            Modo Normal <span className="text-xs opacity-70 ml-2">(Com Iniciais)</span>
                        </Button>
                        <Button onClick={() => startGame(Difficulty.HARD)} variant="secondary">
                            Modo Difícil <span className="text-xs opacity-70 ml-2">(Sem Dicas)</span>
                        </Button>
                    </div>

                     <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
                        <Info size={14} />
                        <span>Powered by Google Gemini</span>
                    </div>
                </div>
            </div>
        );
    }

    // Render Game
    return (
        <div className="min-h-screen flex flex-col h-screen">
            {/* Header / Stats Bar */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 shadow-md z-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="text-amber-400 font-bold text-xl">
                            {gameState.guessedChampions.size} <span className="text-slate-500 text-sm">/ {CHAMPIONS.length}</span>
                        </div>
                        <div className="flex-1 md:w-64 h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-500 ease-out"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <div className="text-slate-400 font-mono w-16 text-right">
                            {formatTime(elapsedTime)}
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        {gameState.gameStatus === 'playing' && (
                             <>
                                <Button 
                                    onClick={handleGetHint} 
                                    variant="outline" 
                                    className="flex-1 md:flex-none py-2 text-sm"
                                    isLoading={hint.loading}
                                >
                                    <Sparkles size={16} className="mr-1"/> Oráculo
                                </Button>
                                <Button 
                                    onClick={giveUp} 
                                    variant="danger" 
                                    className="flex-1 md:flex-none py-2 text-sm"
                                >
                                    Desistir
                                </Button>
                             </>
                        )}
                         {gameState.gameStatus === 'finished' && (
                            <Button onClick={() => setGameState(INITIAL_STATE)} variant="primary" className="py-2">
                                Jogar Novamente
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Hint Modal / Overlay */}
            {hint.visible && (
                <div className="bg-indigo-950/90 border-b border-indigo-500/50 p-4 text-center animate-in slide-in-from-top duration-300">
                     <div className="max-w-3xl mx-auto flex flex-col items-center gap-2">
                         <div className="flex items-center gap-2 text-indigo-300 font-bold uppercase tracking-widest text-xs">
                             <Sparkles size={12} /> Dica do Oráculo
                         </div>
                         {hint.loading ? (
                             <p className="text-slate-400 italic">Consultando os astros...</p>
                         ) : (
                             <p className="text-indigo-100 text-lg font-medium">"{hint.text}"</p>
                         )}
                         <button 
                            onClick={() => setHint(h => ({ ...h, visible: false }))}
                            className="text-xs text-indigo-400 hover:text-indigo-200 mt-1 underline"
                         >
                             Fechar
                         </button>
                     </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                
                {/* Input Area - Sticky on Mobile, Sidebar on Desktop */}
                <div className="md:w-80 bg-slate-900/50 border-r border-slate-800 p-4 flex flex-col gap-4 shrink-0 z-10">
                    <div className="sticky top-0">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome do Campeão</label>
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                disabled={gameState.gameStatus === 'finished'}
                                placeholder="Digite..."
                                className="w-full bg-slate-800 border-2 border-slate-700 text-slate-100 rounded-lg p-3 pl-4 focus:border-amber-500 focus:outline-none transition-colors uppercase font-bold tracking-wider placeholder:normal-case placeholder:font-normal"
                                autoFocus
                            />
                        </div>
                        
                        {gameState.gameStatus === 'finished' && (
                             <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
                                <div className="text-3xl font-bold text-amber-400 mb-1">{percentage}%</div>
                                <div className="text-sm text-slate-400">Pontuação Final</div>
                                {percentage === 100 ? (
                                    <div className="mt-2 text-green-400 text-sm font-bold">LENDÁRIO!</div>
                                ) : (
                                    <div className="mt-2 text-slate-500 text-xs">Mais sorte na próxima!</div>
                                )}
                             </div>
                        )}
                        
                        <div className="hidden md:block mt-8 text-slate-500 text-sm leading-relaxed">
                            <p className="mb-2"><strong className="text-slate-400">Dica:</strong> Não precisa usar apóstrofos ou espaços.</p>
                            <p>Ex: "Kaisa" aceita "Kai'Sa".</p>
                        </div>
                    </div>
                </div>

                {/* Champion Grid */}
                <main className="flex-1 overflow-y-auto lol-scroll bg-slate-950 p-2 md:p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3">
                            {sortedChampions.map(champ => (
                                <ChampionCard 
                                    key={champ.id}
                                    champion={champ}
                                    isGuessed={gameState.guessedChampions.has(champ.id)}
                                    isGiveUp={gameState.giveUp}
                                    difficulty={gameState.difficulty}
                                />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}