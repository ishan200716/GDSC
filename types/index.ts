export enum NeedCategory {
  MEDICAL = 'medical',
  FOOD = 'food',
  EDUCATION = 'education',
  HOUSING = 'housing',
  SAFETY = 'safety',
  OTHER = 'other'
}

export enum NeedStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in-progress',
  RESOLVED = 'resolved'
}

export interface CommunityNeed {
  id: string;
  title: string;
  description: string;
  category: NeedCategory | 'medical' | 'food' | 'education' | 'housing' | 'safety' | 'other';
  urgencyScore: number;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  affectedCount: number;
  status: NeedStatus | 'open' | 'in-progress' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
  assignedVolunteerId?: string;
}

export enum SkillType {
  MEDICAL = 'medical',
  LOGISTICS = 'logistics',
  EDUCATION = 'education',
  CONSTRUCTION = 'construction',
  COUNSELLING = 'counselling',
  FOOD_DISTRIBUTION = 'food_distribution'
}

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday'
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  skills: SkillType[];
  serviceRadius: number;
  availability: DayOfWeek[];
  isActive: boolean;
  matchScore?: number;
  createdAt: Date;
}

export interface VolunteerMatch {
  id?: string;
  volunteerId: string;
  needId: string;
  matchScore: number;
  aiExplanation: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface SurveyUpload {
  id: string;
  fileName: string;
  recordCount: number;
  processedCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

export interface AnalyticsData {
  totalNeeds: number;
  criticalActive: number;
  volunteersDeployed: number;
  avgResponseTimeHours: number;
  needsByCategory: Record<string, number>;
  urgencyTrend: { date: string; avgScore: number }[];
}
