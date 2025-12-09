import React, { useMemo } from 'react';
import { CylinderSession } from '../types';
import { calculateStats } from '../services/storageService';
import { Calendar, Timer, Zap, Archive, Trophy } from 'lucide-react';

interface HistorySessionCardProps {
  session: CylinderSession;
}

const HistorySessionCard: React.FC<HistorySessionCardProps> = ({ session }) => {
  const stats = useMemo(() => calculateStats(session), [session]);
  
  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('ro-RO', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(ts));
  };

  const getFunnyVerdict = () => {
    const { hoursL1, hoursL2, hoursL3, totalHours } = stats;
    if (totalHours < 1) return "Flash! A durat cât o pauză publicitară. ⚡";
    
    // Calculate percentages
    const p1 = hoursL1 / totalHours;
    const p3 = hoursL3 / totalHours;

    if (p1 > 0.6) return "Verdict: Ești rudă cu pinguinii? 🐧 (Prea mult T1)";
    if (p3 > 0.5) return "Verdict: Îți place viața bună, boierule! 🎩 (Mult T3)";
    if (p3 > 0.2) return "Verdict: Echilibrat, dar cu pretenții. 😉";
    return "Verdict: Un consumator responsabil și plictisitor. 👍";
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-5 hover:border-gray-600 transition-all duration-300 group hover:shadow-xl hover:shadow-black/50">
      
      {/* Header Dates */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-5 gap-2 border-b border-gray-700/50 pb-4">
        <div>
           <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">
             <Calendar size={10} />
             Instalat la
           </div>
           <p className="text-gray-200 font-medium font-mono text-sm tracking-tight">{formatDate(session.startDate)}</p>
        </div>
        <div className="md:text-right">
             <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1 md:justify-end">
                <Archive size={10} />
                Decedat la
             </div>
             <p className="text-gray-400 font-medium font-mono text-sm tracking-tight">{session.endDate ? formatDate(session.endDate) : '?'}</p>
        </div>
      </div>

      {/* Funny Verdict Banner */}
      <div className="mb-5 bg-gray-900/50 rounded-lg p-3 text-center border border-gray-700/50">
        <p className="text-sm font-bold text-gray-300 italic">"{getFunnyVerdict()}"</p>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex flex-col items-center justify-center">
             <div className="flex items-center gap-1.5 text-blue-400 mb-1">
                <Timer size={14} />
                <span className="text-[10px] font-bold uppercase">A rezistat</span>
             </div>
             <span className="text-2xl font-black text-blue-100">{stats.totalHours.toFixed(1)}<span className="text-sm text-blue-400/70 font-normal">h</span></span>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex flex-col items-center justify-center">
             <div className="flex items-center gap-1.5 text-yellow-400 mb-1">
                <Trophy size={14} />
                <span className="text-[10px] font-bold uppercase">Scor Final</span>
             </div>
             <span className="text-2xl font-black text-yellow-100">{stats.totalUnits.toFixed(1)}<span className="text-sm text-yellow-400/70 font-normal">pts</span></span>
          </div>
      </div>

      {/* Breakdown Bar Chart */}
      <div className="space-y-2 bg-black/30 p-4 rounded-xl shadow-inner">
        <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest font-bold mb-2">Compoziția Consumului</p>
        
        {/* Level 1 */}
        <div className="flex items-center gap-3 text-sm group/bar">
            <span className="w-8 text-blue-400 font-bold text-xs">❄️ T1</span>
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-500 group-hover/bar:brightness-125" style={{ width: `${stats.totalHours > 0 ? (stats.hoursL1 / stats.totalHours) * 100 : 0}%` }}></div>
            </div>
            <span className="w-12 text-right text-gray-400 font-mono text-xs">{stats.hoursL1.toFixed(1)}h</span>
        </div>

        {/* Level 2 */}
        <div className="flex items-center gap-3 text-sm group/bar">
            <span className="w-8 text-orange-400 font-bold text-xs">🏠 T2</span>
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)] transition-all duration-500 group-hover/bar:brightness-125" style={{ width: `${stats.totalHours > 0 ? (stats.hoursL2 / stats.totalHours) * 100 : 0}%` }}></div>
            </div>
            <span className="w-12 text-right text-gray-400 font-mono text-xs">{stats.hoursL2.toFixed(1)}h</span>
        </div>

        {/* Level 3 */}
        <div className="flex items-center gap-3 text-sm group/bar">
            <span className="w-8 text-purple-400 font-bold text-xs">💎 T3</span>
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all duration-500 group-hover/bar:brightness-125" style={{ width: `${stats.totalHours > 0 ? (stats.hoursL3 / stats.totalHours) * 100 : 0}%` }}></div>
            </div>
            <span className="w-12 text-right text-gray-400 font-mono text-xs">{stats.hoursL3.toFixed(1)}h</span>
        </div>
      </div>
    </div>
  );
};

export default HistorySessionCard;