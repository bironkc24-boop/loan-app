import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const createLoan = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { product_type, amount, term_months, purpose, interest_rate } = req.body;

    if (!product_type || !amount || !term_months || !interest_rate) {
      throw new AppError('Missing required fields', 400);
    }

    const monthly_payment = (amount * (interest_rate / 100 / 12) * Math.pow(1 + (interest_rate / 100 / 12), term_months)) / 
                           (Math.pow(1 + (interest_rate / 100 / 12), term_months) - 1);
    
    const total_repayment = monthly_payment * term_months;

    const { data, error } = await supabase
      .from('loans')
      .insert([
        {
          borrower_id: req.user.id,
          product_type,
          amount,
          term_months,
          interest_rate,
          purpose: purpose || null,
          monthly_payment,
          total_repayment,
          status: 'pending',
        }
      ])
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create loan application', 500);
    }

    await supabase.from('notifications').insert([
      {
        user_id: req.user.id,
        type: 'loan_status',
        title: 'Loan Application Submitted',
        message: `Your ${product_type} loan application for $${amount} has been submitted successfully.`,
        related_loan_id: data.id,
      }
    ]);

    res.status(201).json({
      message: 'Loan application created successfully',
      loan: data,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create loan error:', error);
      res.status(500).json({ error: 'Failed to create loan' });
    }
  }
};

export const getLoans = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { status } = req.query;

    let query = supabase
      .from('loans')
      .select('*, rider:riders(id, user:users(full_name))')
      .eq('borrower_id', req.user.id)
      .order('applied_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError('Failed to fetch loans', 500);
    }

    res.json({ loans: data });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get loans error:', error);
      res.status(500).json({ error: 'Failed to fetch loans' });
    }
  }
};

export const getLoanById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { id } = req.params;

    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        rider:riders(id, user:users(full_name, phone)),
        documents:loan_documents(*),
        status_history:loan_status_history(*)
      `)
      .eq('id', id)
      .eq('borrower_id', req.user.id)
      .single();

    if (error || !data) {
      throw new AppError('Loan not found', 404);
    }

    res.json({ loan: data });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get loan error:', error);
      res.status(500).json({ error: 'Failed to fetch loan' });
    }
  }
};

export const uploadLoanDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { id } = req.params;
    const { file_name, storage_path, document_type } = req.body;

    if (!file_name || !storage_path || !document_type) {
      throw new AppError('Missing required fields', 400);
    }

    const { data: loan } = await supabase
      .from('loans')
      .select('id')
      .eq('id', id)
      .eq('borrower_id', req.user.id)
      .single();

    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    const { data, error } = await supabase
      .from('loan_documents')
      .insert([
        {
          loan_id: id,
          file_name,
          storage_path,
          document_type,
          uploaded_by: req.user.id,
        }
      ])
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to upload document', 500);
    }

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: data,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Upload document error:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  }
};
