export enum HeatLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
}

export interface UsageLog {
  timestamp: number; // Unix timestamp
  level: HeatLevel;
}

export interface CylinderSession {
  id: string;
  startDate: number;
  endDate: number | null; // null means currently active
  logs: UsageLog[];
  isActive: boolean;
}

export interface SessionStats {
  hoursL1: number;
  hoursL2: number;
  hoursL3: number;
  totalHours: number;
  totalUnits: number; // Weighted calculation
}