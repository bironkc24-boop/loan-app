import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch notifications', 500);
    }

    const unreadCount = notifications?.filter(n => !n.read).length || 0;

    res.json({
      notifications: notifications || [],
      unread_count: unreadCount
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to mark notification as read', 500);
    }

    res.json({ notification: data });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Mark as read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw new AppError('Failed to mark all as read', 500);
    }

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Mark all as read error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const createNotification = async (
  userId: string,
  type: 'loan_status' | 'assignment' | 'system' | 'reminder',
  title: string,
  message: string,
  relatedLoanId?: string
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        related_loan_id: relatedLoanId,
        read: false
      });

    if (error) {
      console.error('Error creating notification:', error);
    }
  } catch (error) {
    console.error('Create notification error:', error);
  }
};
