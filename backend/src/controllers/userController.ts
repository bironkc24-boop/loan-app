import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    const { full_name, phone, avatar_url } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({
        full_name,
        phone,
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update profile', 500);
    }

    res.json({
      message: 'Profile updated successfully',
      user: data,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
};

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isAdmin = req.user?.roles.includes('admin');

    if (!isAdmin && req.user?.id !== id) {
      throw new AppError('Insufficient permissions', 403);
    }

    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new AppError('User not found', 404);
    }

    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', id);

    const roles = userRoles?.map((ur: any) => ur.roles.name) || [];

    res.json({
      user: {
        ...userProfile,
        roles,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
};

export const updateBorrowerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Not authenticated', 401);
    }

    const {
      employment_status,
      employer_name,
      monthly_income,
      address,
      city,
      state,
      zip_code,
    } = req.body;

    const { data, error } = await supabase
      .from('borrower_profiles')
      .upsert({
        user_id: userId,
        employment_status,
        employer_name,
        monthly_income,
        address,
        city,
        state,
        zip_code,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update borrower profile', 500);
    }

    res.json({
      message: 'Borrower profile updated successfully',
      profile: data,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Update borrower profile error:', error);
      res.status(500).json({ error: 'Failed to update borrower profile' });
    }
  }
};
