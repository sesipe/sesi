export type UserRole = 'admin' | 'school_admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  schoolId?: string | null;
}

export interface School {
  id: string;
  name: string;
  city: string;
  email: string;
  code: string;
  status: 'active' | 'inactive';
}

export type LeadStatus = 'Novo' | 'Contatado' | 'Matriculado' | 'Desistente';

export interface Lead {
  id: string;
  responsibleName: string;
  relationship: string;
  email: string;
  whatsapp: string;
  schoolId: string;
  schoolName: string;
  course: string;
  series: string;
  status: LeadStatus;
  observations: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface LeadStatusHistory {
  id: string;
  leadId: string;
  oldStatus: LeadStatus;
  newStatus: LeadStatus;
  changedBy: string;
  changedByEmail: string;
  timestamp: Date;
  observation?: string;
}
