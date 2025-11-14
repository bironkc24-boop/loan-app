import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getAssignments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { data: rider } = await supabase
      .from('riders')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (!rider) {
      throw new AppError('Rider profile not found', 404);
    }

    const { data, error } = await supabase
      .from('rider_assignments')
      .select(`
        *,
        loan:loans(
          *,
          borrower:users!loans_borrower_id_fkey(full_name, phone, email)
        )
      `)
      .eq('rider_id', rider.id)
      .order('assigned_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch assignments', 500);
    }

    res.json({ assignments: data });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get assignments error:', error);
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  }
};

export const updateAssignmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const { data, error } = await supabase
      .from('rider_assignments')
      .update({
        status,
        notes,
        ...(status === 'completed' && { completed_at: new Date().toISOString() }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update assignment', 500);
    }

    res.json({ message: 'Assignment updated', assignment: data });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update assignment error:', error);
      res.status(500).json({ error: 'Failed to update assignment' });
    }
  }
};

export const addAssignmentNotes = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!notes) {
      throw new AppError('Notes are required', 400);
    }

    const { data: currentAssignment } = await supabase
      .from('rider_assignments')
      .select('notes')
      .eq('id', id)
      .single();

    const existingNotes = currentAssignment?.notes || '';
    const timestamp = new Date().toISOString();
    const updatedNotes = existingNotes 
      ? `${existingNotes}\n\n[${timestamp}] ${notes}`
      : `[${timestamp}] ${notes}`;

    const { data, error } = await supabase
      .from('rider_assignments')
      .update({ notes: updatedNotes })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to add notes', 500);
    }

    res.json({ message: 'Notes added successfully', assignment: data });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Add assignment notes error:', error);
      res.status(500).json({ error: 'Failed to add notes' });
    }
  }
};

export const updateAvailability = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { status } = req.body;

    const { data, error } = await supabase
      .from('riders')
      .update({ status })
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update availability', 500);
    }

    res.json({ message: 'Availability updated', rider: data });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update availability error:', error);
      res.status(500).json({ error: 'Failed to update availability' });
    }
  }
};

export const getMetrics = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { data: rider } = await supabase
      .from('riders')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (!rider) {
      throw new AppError('Rider profile not found', 404);
    }

    const { data: assignments } = await supabase
      .from('rider_assignments')
      .select('status')
      .eq('rider_id', rider.id);

    const metrics = {
      current_assignments: rider.current_assignments,
      total_completed: rider.total_completed,
      rating: rider.rating,
      pending_assignments: assignments?.filter(a => a.status === 'assigned' || a.status === 'in_progress').length || 0,
    };

    res.json({ metrics });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get rider metrics error:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  }
};
