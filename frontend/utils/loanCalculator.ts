import { LoanCalculation } from '../types';

export const calculateLoan = (
  amount: number,
  annualRate: number,
  termMonths: number
): LoanCalculation => {
  const monthlyRate = annualRate / 100 / 12;
  
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = amount / termMonths;
  } else {
    monthlyPayment =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - amount;

  return {
    loanAmount: amount,
    interestRate: annualRate,
    termMonths,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};
