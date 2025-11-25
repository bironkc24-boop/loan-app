import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from './notificationController';

export const getAllLoans = async (req: AuthRequest, res: Response) => {
  try {
    console.log('DEBUG: getAllLoans called');

    // First, get all loans without joins
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('*')
      .order('applied_at', { ascending: false });

    if (loansError) {
      console.error('DEBUG: Loans query error:', loansError);
      throw new AppError('Failed to fetch loans', 500);
    }

    console.log('DEBUG: Found loans:', loans?.length || 0);

    // If no loans, return empty array
    if (!loans || loans.length === 0) {
      return res.json({ loans: [] });
    }

    // Get borrower info separately (email is in auth.users)
    const borrowerIds = [...new Set(loans.map(l => l.borrower_id))];
    const { data: borrowers, error: borrowersError } = await supabase
      .from('users')
      .select('id, full_name, phone')
      .in('id', borrowerIds);

    // Get emails from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    const emailMap = authUsers?.users?.reduce((map, user) => {
      if (user.email) {
        map[user.id] = user.email;
      }
      return map;
    }, {} as Record<string, string>) || {};

    if (borrowersError) {
      console.error('DEBUG: Borrowers query error:', borrowersError);
      // Continue without borrower info
    }

    // Combine the data
    const loansWithBorrowers = loans.map(loan => {
      const borrower = borrowers?.find(b => b.id === loan.borrower_id);
      return {
        ...loan,
        users: borrower ? {
          ...borrower,
          email: emailMap[loan.borrower_id] || null
        } : null
      };
    });

    console.log('DEBUG: Returning loans with borrowers');
    res.json({ loans: loansWithBorrowers });
  } catch (error) {
    console.error('DEBUG: getAllLoans final error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch loans' });
    }
  }
};

export const updateLoanStatus = async (req: AuthRequest, res: Response) => {
  try {
    console.log('DEBUG: updateLoanStatus called for loan:', req.params.id, 'status:', req.body.status);
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
      console.error('DEBUG: Loan update error:', error);
      throw new AppError('Failed to update loan status', 500);
    }

    console.log('DEBUG: Loan updated successfully');

    const statusMessages: Record<string, string> = {
      reviewing: 'Your loan application is now under review',
      approved: 'Congratulations! Your loan has been approved',
      rejected: 'Your loan application has been reviewed',
      disbursed: 'Your loan has been disbursed',
      active: 'Your loan is now active',
      closed: 'Your loan has been closed'
    };

    if (data.borrower_id && statusMessages[status]) {
      await createNotification(
        data.borrower_id,
        'loan_status',
        'Loan Status Update',
        statusMessages[status],
        id
      );
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

    const { data: riderData } = await supabase
      .from('riders')
      .select('user_id')
      .eq('id', rider_id)
      .single();

    if (riderData?.user_id) {
      await createNotification(
        riderData.user_id,
        'assignment',
        'New Loan Assignment',
        'You have been assigned a new loan verification task',
        id
      );
    }

    if (data.borrower_id) {
      await createNotification(
        data.borrower_id,
        'assignment',
        'Rider Assigned',
        'A field agent has been assigned to verify your loan application',
        id
      );
    }

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
    console.log('DEBUG: getAllRiders called');

    // Get all riders
    const { data: riders, error: ridersError } = await supabase
      .from('riders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ridersError) {
      console.error('DEBUG: Riders query error:', ridersError);
      throw new AppError('Failed to fetch riders', 500);
    }

    console.log('DEBUG: Found riders:', riders?.length || 0);

    // If no riders, return empty array
    if (!riders || riders.length === 0) {
      return res.json({ riders: [] });
    }

    // Get user info separately
    const userIds = [...new Set(riders.map(r => r.user_id).filter(id => id))];
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, phone')
      .in('id', userIds);

    // Get emails from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    const emailMap = authUsers?.users?.reduce((map, user) => {
      if (user.email) {
        map[user.id] = user.email;
      }
      return map;
    }, {} as Record<string, string>) || {};

    if (usersError) {
      console.error('DEBUG: Users query error:', usersError);
      // Continue without user info
    }

    // Combine the data
    const ridersWithUsers = riders.map(rider => {
      const user = users?.find(u => u.id === rider.user_id);
      return {
        ...rider,
        users: user ? {
          ...user,
          email: emailMap[rider.user_id || ''] || null
        } : null
      };
    });

    console.log('DEBUG: Returning riders with users');
    res.json({ riders: ridersWithUsers });
  } catch (error) {
    console.error('DEBUG: getAllRiders final error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch riders' });
    }
  }
};

export const createRider = async (req: AuthRequest, res: Response) => {
  try {
    console.log('DEBUG: createRider called with:', req.body);
    const { email, zone, max_assignments = 10 } = req.body;

    if (!email || !zone) {
      throw new AppError('Email and zone are required', 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Generate a predictable password based on email (so admin can know it)
    const basePassword = email.split('@')[0] + '123!';
    const password = basePassword.length > 12 ? basePassword.substring(0, 12) + '!' : basePassword;
    const full_name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    const phone = null; // Optional field

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
          max_assignments,
        }
      ])
      .select()
      .single();

    if (riderError) {
      throw new AppError('Failed to create rider profile', 500);
    }

    res.status(201).json({
      message: 'Rider created successfully',
      rider: riderData,
      login_credentials: {
        email: email,
        password: password,
        note: 'Please provide these credentials to the rider for login'
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Create rider error:', error);
      res.status(500).json({ error: 'Failed to create rider' });
    }
  }
};

export const updateRider = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { zone, status, max_assignments } = req.body;

    const { data, error } = await supabase
      .from('riders')
      .update({ zone, status, max_assignments, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update rider', 500);
    }

    res.json({ message: 'Rider updated successfully', rider: data });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update rider error:', error);
      res.status(500).json({ error: 'Failed to update rider' });
    }
  }
};

export const deactivateRider = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('riders')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to deactivate rider', 500);
    }

    res.json({ message: 'Rider deactivated successfully', rider: data });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Deactivate rider error:', error);
      res.status(500).json({ error: 'Failed to deactivate rider' });
    }
  }
};

export const getAllUsers = async (_req: AuthRequest, res: Response) => {
  try {
    console.log('DEBUG: getAllUsers called');

    // Get users from our users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        *,
        roles:user_roles!user_roles_user_id_fkey(role:roles(name))
      `)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('DEBUG: Users query error:', usersError);
      throw new AppError('Failed to fetch users', 500);
    }

    console.log('DEBUG: Found users:', users?.length || 0);

    // Get emails from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    const emailMap = authUsers?.users?.reduce((map, user) => {
      if (user.email) {
        map[user.id] = user.email;
      }
      return map;
    }, {} as Record<string, string>) || {};

    if (authError) {
      console.error('DEBUG: Auth users query error:', authError);
    }

    // Combine user data with emails
    const usersWithEmails = users?.map(user => ({
      ...user,
      email: emailMap[user.id] || null
    })) || [];

    console.log('DEBUG: Returning users with emails');
    res.json({ users: usersWithEmails });
  } catch (error) {
    console.error('DEBUG: getAllUsers final error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
};

export const getMetrics = async (_req: AuthRequest, res: Response) => {
  try {
    console.log('DEBUG: getMetrics called');

    // Get loan counts by status
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('status, amount');

    if (loansError) {
      console.error('DEBUG: Loans metrics error:', loansError);
    }

    // Get rider counts
    const { data: riders, error: ridersError } = await supabase
      .from('riders')
      .select('status');

    if (ridersError) {
      console.error('DEBUG: Riders metrics error:', ridersError);
    }

    const metrics = {
      total_loans: loans?.length || 0,
      pending_loans: loans?.filter(l => l.status === 'pending').length || 0,
      approved_loans: loans?.filter(l => l.status === 'approved').length || 0,
      rejected_loans: loans?.filter(l => l.status === 'rejected').length || 0,
      total_disbursed: loans?.filter(l => l.status === 'disbursed')
        .reduce((sum, l) => sum + Number(l.amount || 0), 0) || 0,
      active_riders: riders?.filter(r => r.status === 'active').length || 0,
    };

    console.log('DEBUG: Metrics calculated:', metrics);
    res.json({ metrics });
  } catch (error) {
    console.error('DEBUG: Get metrics final error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
};
