import React, { useEffect, useState } from 'react';
import { CylinderSession, HeatLevel } from '../types';
import { calculateStats } from '../services/storageService';
import { Clock, CheckCircle2, Flame, Zap, DollarSign, Battery, Snowflake, Armchair, Gem, Wallet } from 'lucide-react';

interface ActiveSessionCardProps {
  session: CylinderSession;
  onChangeLevel: (id: string, level: HeatLevel) => void;
  onNewCylinder: () => void;
}

const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({ session, onChangeLevel, onNewCylinder }) => {
  // Eliminam state-ul pentru stats ca sa nu avem lag. Calculam direct la render.
  // Pastram doar un ticker pentru a forta re-randarea la fiecare secunda.
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculam "live"
  const stats = calculateStats(session);
  const currentLevel = session.logs[session.logs.length - 1].level;

  const formatDuration = (hours: number) => {
    const totalMinutes = Math.floor(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  // Funny descriptions for current status
  const getStatusMessage = () => {
    if (currentLevel === 1) return "Încercăm să economisim... 📉";
    if (currentLevel === 2) return "E bine, e cald, e pace. ☕";
    return "Se ard banii cu viteză maximă! 💸";
  };

  return (
    <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden relative ring-1 ring-white/5 transition-all duration-500">
      {/* Animated Glow effect based on level */}
      <div className={`absolute top-0 right-0 w-80 h-80 bg-opacity-20 blur-[60px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2 transition-colors duration-700
        ${currentLevel === 3 ? 'bg-purple-500' : currentLevel === 2 ? 'bg-orange-500' : 'bg-blue-500'}`}></div>

      {/* Header Bar */}
      <div className="bg-gray-900/80 backdrop-blur-md p-5 text-white flex justify-between items-center sticky top-0 z-10 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-2xl shadow-inner transition-colors duration-300 ${currentLevel === 3 ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700/50 text-gray-400'}`}>
             {currentLevel === 3 ? <Wallet className="animate-bounce" /> : <Battery className="animate-pulse" />}
          </div>
          <div>
            <h2 className="font-black text-lg italic tracking-wide text-gray-100">BUTELIA E LIVE 🔴</h2>
            <p className="text-gray-400 text-xs font-mono truncate max-w-[150px] sm:max-w-none">{getStatusMessage()}</p>
          </div>
        </div>
        <div className="text-right">
            <span className="block text-4xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-lg">
              {formatDuration(stats.totalHours)}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Timp Scurs</span>
        </div>
      </div>

      <div className="p-6 relative z-0">
        
        {/* Level Selectors */}
        <div className="mb-8">
          <p className="text-xs text-center text-gray-500 font-bold mb-4 uppercase tracking-[0.2em] opacity-80">
            🎛️ Alege Nivelul de Confort (și Cheltuială)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Level 1 Button */}
            <button
              onClick={() => onChangeLevel(session.id, HeatLevel.LEVEL_1)}
              className={`group relative overflow-hidden flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 active:scale-95 cursor-pointer ${
                currentLevel === 1 
                  ? 'border-blue-500 bg-blue-900/40 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                  : 'border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-gray-600'
              }`}
            >
              <div className={`mb-2 transition-transform duration-300 ${currentLevel === 1 ? 'scale-110 rotate-12' : 'group-hover:scale-110'}`}>
                <Snowflake size={32} className={currentLevel === 1 ? "text-blue-400 fill-blue-400/20" : "text-gray-500"} />
              </div>
              <span className={`font-black text-sm uppercase ${currentLevel === 1 ? "text-blue-400" : "text-gray-500"}`}>
                Mod: Pinguin 🐧
              </span>
              <span className="text-[10px] text-gray-500 font-mono mt-1 opacity-70">"Mai ia o geacă"</span>
            </button>

            {/* Level 2 Button */}
            <button
              onClick={() => onChangeLevel(session.id, HeatLevel.LEVEL_2)}
              className={`group relative overflow-hidden flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 active:scale-95 cursor-pointer ${
                currentLevel === 2 
                  ? 'border-orange-500 bg-orange-900/40 shadow-[0_0_20px_rgba(249,115,22,0.3)]' 
                  : 'border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-gray-600'
              }`}
            >
              <div className={`mb-2 transition-transform duration-300 ${currentLevel === 2 ? 'scale-110' : 'group-hover:scale-110'}`}>
                <Armchair size={32} className={currentLevel === 2 ? "text-orange-400 fill-orange-400/20" : "text-gray-500"} />
              </div>
              <span className={`font-black text-sm uppercase ${currentLevel === 2 ? "text-orange-400" : "text-gray-500"}`}>
                Mod: Om Normal 🏠
              </span>
              <span className="text-[10px] text-gray-500 font-mono mt-1 opacity-70">"E acceptabil"</span>
            </button>

            {/* Level 3 Button */}
            <button
              onClick={() => onChangeLevel(session.id, HeatLevel.LEVEL_3)}
              className={`group relative overflow-hidden flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 active:scale-95 cursor-pointer ${
                currentLevel === 3 
                  ? 'border-purple-500 bg-purple-900/40 shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                  : 'border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-gray-600'
              }`}
            >
              <div className={`mb-2 transition-transform duration-300 ${currentLevel === 3 ? 'scale-110 -rotate-12' : 'group-hover:scale-110'}`}>
                <Gem size={32} className={currentLevel === 3 ? "text-purple-400 fill-purple-400/20" : "text-gray-500"} />
              </div>
              <span className={`font-black text-sm uppercase ${currentLevel === 3 ? "text-purple-400" : "text-gray-500"}`}>
                Mod: Șeic Dubai 🕌
              </span>
              <span className="text-[10px] text-gray-500 font-mono mt-1 opacity-70">"Arde cardul!"</span>
            </button>

          </div>
        </div>

        {/* Stats Panel */}
        <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-700 mb-6 backdrop-blur-sm">
          <h3 className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Clock size={14} />
            Statistici Plictisitoare
          </h3>
          <div className="space-y-3 font-mono text-sm">
             <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-blue-500">❄️</span>
                    <span>Timp pe "Zgârcit" (T1)</span>
                </div>
                <span className="text-gray-200">{formatDuration(stats.hoursL1)}</span>
             </div>
             <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-orange-500">🏠</span>
                    <span>Timp pe "Normal" (T2)</span>
                </div>
                <span className="text-gray-200">{formatDuration(stats.hoursL2)}</span>
             </div>
             <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-purple-500">💎</span>
                    <span>Timp pe "Opulență" (T3)</span>
                </div>
                <span className="text-gray-200">{formatDuration(stats.hoursL3)}</span>
             </div>
             
             <div className="pt-3 flex justify-between items-center mt-2 bg-gradient-to-r from-gray-800 to-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Scor "Cheltuială"</span>
                  <span className="text-xs text-gray-500">(Unități Ponderate)</span>
                </div>
                <div className="flex items-center gap-2">
                   <Zap className="text-yellow-400 fill-yellow-400/20" size={18} />
                   <span className="font-black text-yellow-400 text-xl tracking-wider">{stats.totalUnits.toFixed(2)}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Finish Button */}
        <button
          onClick={onNewCylinder}
          className="group w-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 border-2 border-dashed border-gray-600 hover:border-gray-500 hover:border-solid active:scale-[0.98] cursor-pointer"
        >
          <div className="relative">
            <CheckCircle2 className="group-hover:text-green-400 transition-colors" />
            <div className="absolute inset-0 bg-green-400 blur-lg opacity-0 group-hover:opacity-40 transition-opacity"></div>
          </div>
          <span>E goală, e doar metal! (Finish) 🗑️</span>
        </button>
      </div>
    </div>
  );
};

export default ActiveSessionCard;