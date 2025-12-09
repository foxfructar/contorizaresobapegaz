import React, { useEffect, useState } from 'react';
import { CylinderSession, HeatLevel } from './types';
import * as storageService from './services/storageService';
import ActiveSessionCard from './components/ActiveSessionCard';
import HistorySessionCard from './components/HistorySessionCard';
import { PlusCircle, Flame, Ghost, History, Database, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<CylinderSession[]>([]);
  const [activeSession, setActiveSession] = useState<CylinderSession | undefined>(undefined);
  const [historySessions, setHistorySessions] = useState<CylinderSession[]>([]);
  const [isFirebase, setIsFirebase] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Subscribe to real-time updates (Firebase or LocalEvent)
  useEffect(() => {
    // Check connection type
    setIsFirebase(storageService.isUsingFirebase());

    const unsubscribe = storageService.subscribeToSessions((data) => {
      setSessions(data);
      // Sortăm local pentru siguranță: cele active primele, apoi după dată
      const active = data.find(s => s.isActive);
      const history = data.filter(s => !s.isActive).sort((a, b) => b.startDate - a.startDate);
      
      setActiveSession(active);
      setHistorySessions(history);
    });

    return () => unsubscribe();
  }, []);

  const handleNewCylinder = async () => {
    if (isProcessing) return;

    // Only ask for confirmation if there is an active session running that we are about to close
    if (activeSession) {
      const confirmMsg = "Sigur arunci butelia asta? Ești convins că nu mai are niciun strop? 🤔";
      if (!window.confirm(confirmMsg)) {
        return; 
      }
    }
    
    setIsProcessing(true);
    try {
      // Async call - UI will update automatically via subscription
      await storageService.startNewCylinder(activeSession?.id);
      // Notă: "Revenirea la home screen" se face automat deoarece 
      // variabila `activeSession` se va actualiza prin abonament,
      // iar componenta va randa ActiveSessionCard în loc de Empty State.
    } catch (e) {
      console.error("Error starting cylinder:", e);
      alert("A apărut o eroare la crearea buteliei. Verifică consola.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeLevel = async (id: string, level: HeatLevel) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;
    
    // Check if we are actually changing the level (avoid spam)
    const lastLog = session.logs[session.logs.length - 1];
    if (lastLog.level === level) return;

    try {
      await storageService.changeLevel(id, level, session.logs);
    } catch (e) {
      console.error("Error changing level:", e);
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-[#0B1120] text-gray-200 selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl text-white shadow-lg group-hover:rotate-12 transition-transform duration-300">
                <Flame size={24} className="fill-white animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900 animate-bounce"></div>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                Monitor GPL <span className="text-purple-400 font-normal opacity-50 text-sm">v3.3</span>
              </h1>
              <div className="flex items-center gap-1">
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest group-hover:text-purple-400 transition-colors">Ediția "Facturi Mici"</p>
                 {isFirebase ? (
                   <span className="bg-green-500/10 text-green-400 text-[9px] px-1.5 py-0.5 rounded border border-green-500/20 flex items-center gap-1">
                     <Database size={8} /> LIVE
                   </span>
                 ) : (
                   <span className="bg-yellow-500/10 text-yellow-400 text-[9px] px-1.5 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1">
                     <Database size={8} /> LOCAL (Safe Mode)
                   </span>
                 )}
              </div>
            </div>
          </div>
          
          {!activeSession && (
              <button 
                onClick={handleNewCylinder}
                disabled={isProcessing}
                className={`cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.4)] transform hover:scale-105 active:scale-95 border border-indigo-400/30 ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
              >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                  <span className="hidden sm:inline">{isProcessing ? 'Se instalează...' : 'Instalează Butoiul 🛢️'}</span>
                  <span className="sm:hidden">{isProcessing ? '...' : 'Nouă 🆕'}</span>
              </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8 space-y-12">
        
        {/* Active Session Area */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeSession ? (
            <ActiveSessionCard 
              session={activeSession}
              onChangeLevel={handleChangeLevel}
              onNewCylinder={handleNewCylinder}
            />
          ) : (
            <div className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-[2rem] p-10 text-center relative overflow-hidden group hover:border-indigo-500/50 transition-colors duration-500">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                <div className="mx-auto bg-gray-800 p-6 rounded-full w-24 h-24 flex items-center justify-center mb-6 shadow-2xl border border-gray-700 group-hover:scale-110 transition-transform duration-500">
                    <Ghost size={48} className="text-gray-600 group-hover:text-indigo-400 transition-colors duration-500" />
                </div>
                <h3 className="text-3xl font-black text-white mb-2">Liniște... Prea multă liniște. 🕸️</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                    Momentan nu consumi nimic. Ori e vară, ori ai plecat în Bahamas, ori ai uitat să pornești aplicația.
                </p>
                <button 
                    onClick={handleNewCylinder}
                    disabled={isProcessing}
                    className={`cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-indigo-500/20 hover:translate-y-[-2px] transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto relative z-10 ${isProcessing ? 'opacity-80 scale-95' : ''}`}
                >
                   {isProcessing ? <Loader2 className="animate-spin" /> : <span>PORNEȘTE CĂLDURA! 🔥</span>}
                </button>
            </div>
          )}
        </section>

        {/* History Area */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="bg-gray-800 p-2 rounded-lg">
               <History className="text-gray-400" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-200">Cimitirul de Butelii ⚰️</h2>
            <span className="ml-auto bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full font-mono border border-gray-700">
                Total: {historySessions.length}
            </span>
          </div>

          <div className="space-y-6">
            {historySessions.length > 0 ? (
              historySessions.map(session => (
                <HistorySessionCard key={session.id} session={session} />
              ))
            ) : (
              <div className="text-center py-16 bg-gray-800/30 rounded-3xl border border-gray-800 border-dashed">
                  <p className="text-gray-600 font-bold text-lg mb-1">Gol. Vid. Nimic.</p>
                  <p className="text-gray-700 text-sm italic">"Istoria se scrie acum..."</p>
              </div>
            )}
          </div>
        </section>

        {/* Footer Info */}
        <footer className="text-center text-gray-600 text-[10px] pt-12 pb-8 opacity-60 hover:opacity-100 transition-opacity">
            <p className="font-mono mb-2">Creat pentru confortul tău termic și disconfortul tău financiar.</p>
            <div className="flex justify-center gap-4">
              <span>❄️ T1 = 1 pct/h</span>
              <span>🏠 T2 = 2 pct/h</span>
              <span>💎 T3 = 3 pct/h</span>
            </div>
        </footer>
      </main>
    </div>
  );
};

export default App;