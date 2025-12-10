import React from 'react';
import { CylinderSession } from '../types';
import { calculateStats } from '../services/storageService';
import { Calendar, Zap, Clock } from 'lucide-react';

interface HistorySessionCardProps {
  session: CylinderSession;
}

const HistorySessionCard: React.FC<HistorySessionCardProps> = ({ session }) => {
  const stats = calculateStats(session);

  const formatDuration = (hours: number) => {
    const totalMinutes = Math.floor(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const startDate = new Date(session.startDate).toLocaleDateString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  const endDate = session.endDate 
    ? new Date(session.endDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })
    : 'Activ';

  return (
    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 shadow-md hover:border-gray-600 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-700/50 rounded-xl text-gray-400">
             <Calendar size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-200">
                {startDate} {session.endDate ? `- ${endDate}` : ''}
            </h3>
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                {session.endDate ? 'Sesiune Închisă' : 'Sesiune Activă'}
            </p>
          </div>
        </div>
        <div className="text-right">
           <span className="block text-2xl font-black font-mono text-gray-300">
             {formatDuration(stats.totalHours)}
           </span>
           <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Durată</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
         <div className="bg-gray-900/40 rounded-xl p-3 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-yellow-500" />
                <span className="text-xs font-bold text-gray-400 uppercase">Scor Consum</span>
            </div>
            <span className="font-black text-xl text-yellow-400 tracking-wide">{stats.totalUnits.toFixed(1)}</span>
         </div>
         
         <div className="bg-gray-900/40 rounded-xl p-3 border border-gray-700/50">
             <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-blue-500" />
                <span className="text-xs font-bold text-gray-400 uppercase">Mix Termic</span>
             </div>
             <div className="flex justify-between text-xs font-mono text-gray-400 mt-1.5">
                 <span title="Nivel 1" className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500/50"></span>{Math.round(stats.hoursL1)}h</span>
                 <span title="Nivel 2" className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500/50"></span>{Math.round(stats.hoursL2)}h</span>
                 <span title="Nivel 3" className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500/50"></span>{Math.round(stats.hoursL3)}h</span>
             </div>
         </div>
      </div>
    </div>
  );
};

export default HistorySessionCard;