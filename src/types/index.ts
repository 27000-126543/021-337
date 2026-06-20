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
  suggestion: string;
  relatedOrderIds: string[];
  relatedRectifyIds: string[];
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
export type TeamType = 'scaffolding' | 'concrete';

export interface SignRecord {
  id: string;
  confirmerName: string;
  confirmerRole: string;
  teamType: TeamType;
  teamLabel: string;
  confirmTime: string;
}

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
  signRecords: SignRecord[];
  affectedPoints: string[];
  requiredTeams: TeamType[];
}

export type RectifyStatus = 'pending' | 'submitted' | 'approved' | 'rejected';

export interface SubmissionHistoryEntry {
  round: number;
  photos: string[];
  voicePath?: string;
  voiceDuration: number;
  textDesc: string;
  submitTime: string;
  result: 'pending_review' | 'approved' | 'rejected';
  rejectReason?: string;
  rejectPhotos?: string[];
  reviewer?: string;
  reviewTime?: string;
}

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
  rejectReason?: string;
  reviewer?: string;
  reviewTime?: string;
  submissionHistory: SubmissionHistoryEntry[];
}

export interface RectifySubmission {
  photos: string[];
  voicePath?: string;
  voiceDuration: number;
  textDesc: string;
  submitTime: string;
}

export interface RectifyPhotoItem {
  type: string;
  label: string;
  photos: string[];
  desc: string;
}
