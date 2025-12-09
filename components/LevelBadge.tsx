import React from 'react';
import { HeatLevel } from '../types';
import { Flame } from 'lucide-react';

interface LevelBadgeProps {
  level: HeatLevel;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  onClick?: () => void;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({ level, size = 'md', active = false, onClick }) => {
  
  const getColors = (lvl: HeatLevel) => {
    switch (lvl) {
      case HeatLevel.LEVEL_1: 
        return active 
          ? 'bg-green-600 text-white ring-2 ring-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]' 
          : 'bg-green-900/30 text-green-400 border border-green-800 hover:bg-green-900/50';
      case HeatLevel.LEVEL_2: 
        return active 
          ? 'bg-yellow-600 text-white ring-2 ring-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]' 
          : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800 hover:bg-yellow-900/50';
      case HeatLevel.LEVEL_3: 
        return active 
          ? 'bg-red-600 text-white ring-2 ring-red-400 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse' 
          : 'bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50';
      default: return 'bg-gray-800 text-gray-400';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : size === 'lg' ? 'px-6 py-3 text-lg' : 'px-3 py-1.5 text-sm';
  const cursorClass = onClick ? 'cursor-pointer' : 'cursor-default';

  return (
    <div 
      onClick={onClick}
      className={`rounded-lg font-bold flex items-center gap-1 transition-all duration-200 ${getColors(level)} ${sizeClasses} ${cursorClass}`}
    >
      <Flame size={size === 'sm' ? 12 : 16} className={active ? 'fill-current' : ''} />
      <span>Tr. {level}</span>
    </div>
  );
};

export default LevelBadge;