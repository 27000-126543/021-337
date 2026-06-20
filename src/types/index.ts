export type RiskLevel = 'safe' | 'warning' | 'danger';

export interface MeasurePoint {
  id: string;
  name: string;
  type: 'settlement' | 'inclination' | 'axial_force';
  typeLabel: string;
  value: number;
  unit: string;
  threshold: number;
  level: RiskLevel;
  location: string;
  updateTime: string;
}

export interface ForbiddenArea {
  id: string;
  name: string;
  reason: string;
}

export interface ConstructionSection {
  id: string;
  name: string;
  level: RiskLevel;
  levelText: string;
  isWorkAllowed: boolean;
  workStatusText: string;
  abnormalCount: number;
  warningCount: number;
  updateTime: string;
  measurePoints: MeasurePoint[];
  forbiddenAreas: ForbiddenArea[];
}

export type OrderType = 'stop_pouring' | 'slow_pouring';
export type OrderStatus = 'pending' | 'confirmed';

export interface PourOrder {
  id: string;
  type: OrderType;
  typeLabel: string;
  title: string;
  sectionName: string;
  reason: string;
  detailReason: string;
  publishTime: string;
  publisher: string;
  status: OrderStatus;
  confirmTime?: string;
  confirmer?: string;
  affectedPoints: string[];
}

export type RectifyStatus = 'pending' | 'submitted' | 'verified';

export interface RectifyItem {
  id: string;
  title: string;
  sectionName: string;
  issueDesc: string;
  deadline: string;
  status: RectifyStatus;
  statusText: string;
  submitTime?: string;
  photos?: string[];
  voiceDesc?: string;
  type: 'scissors_brace' | 'base_plate' | 'jacking';
  typeLabel: string;
}

export interface RectifyPhotoItem {
  type: string;
  label: string;
  photos: string[];
  desc: string;
}
