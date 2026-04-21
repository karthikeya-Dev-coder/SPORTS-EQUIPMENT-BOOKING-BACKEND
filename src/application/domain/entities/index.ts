export type UserRole = 'admin' | 'staff' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string | null | undefined;
  avatar?: string | null | undefined;
  department?: string | null | undefined;
  createdAt: Date;
  isActive: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  totalQuantity: number;
  available: number;
  inUse: number;
  assignedStaffId?: string;
  assignedStaff?: User;
  createdAt: Date;
}

export interface Booking {
  id: string;
  studentId: string;
  equipmentId: string;
  date: string; // ISO format
  timeSlot: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected' | 'returned' | 'overdue';
  createdAt: Date;
}

export interface Warning {
  id: string;
  studentId: string;
  reason: string;
  level: 1 | 2 | 3;
  issuedBy: string; // staff/admin ID
  issuedAt: Date;
  amount?: number;
  isPaid: boolean;
  paidAt?: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  details: string;
  timestamp: Date;
}
