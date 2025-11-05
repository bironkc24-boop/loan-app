export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
}

export interface Role {
  id: string;
  name: 'borrower' | 'admin' | 'rider';
  description?: string;
  created_at: string;
}

export type EmploymentStatus = 'employed' | 'self_employed' | 'unemployed' | 'retired' | 'student';

export interface BorrowerProfile {
  id: string;
  user_id: string;
  employment_status?: EmploymentStatus;
  employer_name?: string;
  monthly_income?: number;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  documents?: any[];
  credit_score?: number;
  created_at: string;
  updated_at: string;
}

export type RiderStatus = 'active' | 'inactive' | 'on_leave' | 'suspended';

export interface Rider {
  id: string;
  user_id?: string;
  status: RiderStatus;
  zone?: string;
  max_assignments: number;
  current_assignments: number;
  total_completed: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export type LoanProductType = 'personal' | 'business' | 'education' | 'home' | 'auto';
export type LoanStatus = 'pending' | 'reviewing' | 'approved' | 'rejected' | 'disbursed' | 'active' | 'closed' | 'defaulted';

export interface Loan {
  id: string;
  borrower_id: string;
  rider_id?: string;
  product_type: LoanProductType;
  amount: number;
  term_months: number;
  interest_rate: number;
  status: LoanStatus;
  purpose?: string;
  applied_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  approved_at?: string;
  disbursed_at?: string;
  closed_at?: string;
  monthly_payment?: number;
  total_repayment?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type DocumentType = 'id_proof' | 'income_proof' | 'address_proof' | 'bank_statement' | 'other';

export interface LoanDocument {
  id: string;
  loan_id: string;
  storage_path: string;
  file_name: string;
  file_type?: string;
  file_size?: number;
  document_type: DocumentType;
  uploaded_at: string;
  uploaded_by?: string;
}

export interface LoanStatusHistory {
  id: string;
  loan_id: string;
  old_status?: LoanStatus;
  new_status: LoanStatus;
  notes?: string;
  changed_by?: string;
  changed_at: string;
}

export type AssignmentStatus = 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface RiderAssignment {
  id: string;
  rider_id: string;
  loan_id: string;
  status: AssignmentStatus;
  assigned_at: string;
  assigned_by?: string;
  completed_at?: string;
  notes?: string;
}

export type NotificationType = 'loan_status' | 'assignment' | 'system' | 'reminder';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  related_loan_id?: string;
  created_at: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}
