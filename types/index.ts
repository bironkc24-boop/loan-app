export interface LoanProduct {
  id: string;
  name: string;
  type: 'personal' | 'business' | 'education';
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  minTerm: number;
  maxTerm: number;
  description: string;
  icon: string;
}

export interface LoanApplication {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  term: number;
  status: 'pending' | 'approved' | 'rejected' | 'reviewing';
  applicantName: string;
  email: string;
  phone: string;
  monthlyIncome: number;
  employmentStatus: string;
  dateApplied: string;
  documents: string[];
}

export interface LoanCalculation {
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}
