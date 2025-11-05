import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getAllLoans = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from('loans')
      .select(`
        *,
        borrower:users!loans_borrower_id_fkey(full_name, phone, email),
        rider:riders(id, user:users(full_name))
      `)
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
      console.error('Get all loans error:', error);
      res.status(500).json({ error: 'Failed to fetch loans' });
    }
  }
};

export const updateLoanStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const { data, error } = await supabase
      .from('loans')
      .update({
        status,
        notes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: req.user?.id,
        ...(status === 'approved' && { approved_at: new Date().toISOString() }),
        ...(status === 'disbursed' && { disbursed_at: new Date().toISOString() }),
        ...(status === 'closed' && { closed_at: new Date().toISOString() }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update loan status', 500);
    }

    res.json({ message: 'Loan status updated', loan: data });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update loan status error:', error);
      res.status(500).json({ error: 'Failed to update loan status' });
    }
  }
};

export const assignRider = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rider_id } = req.body;

    const { data, error } = await supabase
      .from('loans')
      .update({ rider_id })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to assign rider', 500);
    }

    await supabase.from('rider_assignments').insert([
      {
        rider_id,
        loan_id: id,
        assigned_by: req.user?.id,
        status: 'assigned',
      }
    ]);

    res.json({ message: 'Rider assigned successfully', loan: data });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Assign rider error:', error);
      res.status(500).json({ error: 'Failed to assign rider' });
    }
  }
};

export const getAllRiders = async (_req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('riders')
      .select('*, user:users(full_name, phone, email)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch riders', 500);
    }

    res.json({ riders: data });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get riders error:', error);
      res.status(500).json({ error: 'Failed to fetch riders' });
    }
  }
};

export const createRider = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, full_name, phone, zone } = req.body;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      throw new AppError('Failed to create rider account', 500);
    }

    const { error: userError } = await supabase.from('users').insert([
      {
        id: authData.user.id,
        full_name,
        phone,
      }
    ]);

    if (userError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new AppError('Failed to create user profile', 500);
    }

    const { data: riderRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'rider')
      .single();

    if (riderRole) {
      await supabase.from('user_roles').insert([
        {
          user_id: authData.user.id,
          role_id: riderRole.id,
        }
      ]);
    }

    const { data: riderData, error: riderError } = await supabase
      .from('riders')
      .insert([
        {
          user_id: authData.user.id,
          zone,
          status: 'active',
        }
      ])
      .select()
      .single();

    if (riderError) {
      throw new AppError('Failed to create rider profile', 500);
    }

    res.status(201).json({ message: 'Rider created successfully', rider: riderData });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create rider error:', error);
      res.status(500).json({ error: 'Failed to create rider' });
    }
  }
};

export const getMetrics = async (_req: AuthRequest, res: Response) => {
  try {
    const { data: loans } = await supabase.from('loans').select('status, amount');
    const { data: riders } = await supabase.from('riders').select('status');

    const metrics = {
      total_loans: loans?.length || 0,
      pending_loans: loans?.filter(l => l.status === 'pending').length || 0,
      approved_loans: loans?.filter(l => l.status === 'approved').length || 0,
      total_disbursed: loans?.filter(l => l.status === 'disbursed')
        .reduce((sum, l) => sum + Number(l.amount), 0) || 0,
      active_riders: riders?.filter(r => r.status === 'active').length || 0,
    };

    res.json({ metrics });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};
