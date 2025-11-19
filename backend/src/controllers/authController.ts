import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  console.time('register-total');
  try {
    const { email, password, full_name, phone, accepted_terms, terms_version } = req.body;
    console.log('DEBUG: Register attempt with email:', email, 'accepted_terms:', accepted_terms, 'full_name:', full_name);
    console.log('DEBUG: Checking if roles exist...');
    const { data: rolesCheck, error: rolesError } = await supabase.from('roles').select('*');
    console.log('DEBUG: Roles in DB:', rolesCheck, 'Error:', rolesError);
    console.time('signup');

    if (!email || !password || !full_name) {
      console.log('DEBUG: Validation failed - missing required fields');
      throw new AppError('Email, password, and full name are required', 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('DEBUG: Validation failed - invalid email format');
      throw new AppError('Invalid email format', 400);
    }

    if (password.length < 8) {
      console.log('DEBUG: Validation failed - password too short');
      throw new AppError('Password must be at least 8 characters long', 400);
    }

    if (!accepted_terms) {
      console.log('DEBUG: Validation failed - terms not accepted');
      throw new AppError('You must accept the Terms of Service and Privacy Policy', 400);
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    console.timeEnd('signup');

    if (authError) {
      console.error('DEBUG: Signup error:', authError);
      throw new AppError(authError.message, 400);
    }

    console.log('DEBUG: Signup successful, user id:', authData.user?.id);
    console.log('DEBUG: Session present after signUp:', !!authData.session);
    console.time('insert-user');

    if (!authData.user) {
      throw new AppError('Failed to create user', 500);
    }

    console.log('DEBUG: Attempting to insert user profile for id:', authData.user.id);
    const { data: userData, error: userError} = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          full_name,
          phone: phone || null,
          accepted_terms_at: new Date().toISOString(),
          terms_version: terms_version,
        }
      ])
      .select()
      .single();
    console.timeEnd('insert-user');
    console.log('DEBUG: User insert result - data:', userData, 'error:', userError);

    if (userError) {
      console.error('DEBUG: Insert user error:', userError);
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new AppError('Failed to create user profile', 500);
    }

    console.log('DEBUG: User profile created');
    console.time('role-ops');

    const { data: borrowerRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'borrower')
      .single();

    console.log('DEBUG: Borrower role found:', borrowerRole);
    if (borrowerRole) {
      await supabase.from('user_roles').insert([
        {
          user_id: authData.user.id,
          role_id: borrowerRole.id,
        }
      ]);

      await supabase.from('borrower_profiles').insert([
        {
          user_id: authData.user.id,
        }
      ]);
    }
    console.timeEnd('role-ops');

    console.timeEnd('register-total');
    res.status(201).json({
      message: 'User registered successfully',
      user: userData,
      session: authData.session,
    });
  } catch (error) {
    console.timeEnd('register-total');
    console.log('DEBUG: Register error type:', error instanceof AppError ? 'AppError' : typeof error, 'Message:', (error as Error)?.message || 'No message');
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  console.log('DEBUG: Login attempt started for email:', req.body.email);
  try {
    const { email, password } = req.body;
    console.log('DEBUG: Login - extracted email and password');

    if (!email || !password) {
      console.log('DEBUG: Login - validation failed: missing email or password');
      throw new AppError('Email and password are required', 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log('DEBUG: Login - validation failed: invalid email format');
      throw new AppError('Invalid email format', 400);
    }
    console.log('DEBUG: Login - validation passed, attempting signInWithPassword');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('DEBUG: Login - signInWithPassword result - data:', !!data, 'error:', error);

    if (error) {
      console.log('DEBUG: Login - signInWithPassword error:', error.message);
      throw new AppError('Invalid credentials', 401);
    }

    console.log('DEBUG: Login - signIn successful, user id:', data.user?.id);
    console.log('DEBUG: Login - fetching user roles');

    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', data.user.id);
    console.log('DEBUG: Login - user roles fetched:', userRoles, 'error:', rolesError);

    const roles = userRoles?.map((ur: any) => ur.roles.name) || [];
    console.log('DEBUG: Login - roles extracted:', roles);

    console.log('DEBUG: Login - fetching user profile');
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    console.log('DEBUG: Login - user profile fetched:', !!userProfile, 'error:', profileError);

    console.log('DEBUG: Login - preparing response');
    const response = {
      message: 'Login successful',
      session: data.session,
      user: {
        ...userProfile,
        email: data.user.email,
        roles,
      },
    };
    console.log('DEBUG: Login - response prepared, sending JSON');
    res.json(response);
    console.log('DEBUG: Login - response sent successfully');
  } catch (error) {
    console.log('DEBUG: Login - caught error, type:', error instanceof AppError ? 'AppError' : typeof error, 'message:', (error as Error)?.message || 'No message');
    if (error instanceof AppError) {
      console.log('DEBUG: Login - sending AppError response:', error.statusCode, error.message);
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('DEBUG: Login - unexpected error:', error);
      console.log('DEBUG: Login - sending 500 response');
      res.status(500).json({ error: 'Login failed' });
    }
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      throw new AppError('Failed to fetch profile', 500);
    }

    res.json({
      user: {
        ...userProfile,
        email: req.user.email,
        roles: req.user.roles,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      await supabase.auth.admin.signOut(token);
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) {
      throw new AppError('Failed to send password reset email', 500);
    }

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to process password reset request' });
    }
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { access_token, password } = req.body;

    if (!access_token || !password) {
      throw new AppError('Access token and new password are required', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400);
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(access_token);

    if (userError || !user) {
      throw new AppError('Invalid or expired token', 401);
    }

    const { error } = await supabase.auth.admin.updateUserById(
      user.id,
      { password }
    );

    if (error) {
      throw new AppError('Failed to reset password', 500);
    }

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new AppError('Refresh token is required', 400);
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      throw new AppError('Invalid refresh token', 401);
    }

    res.json({
      message: 'Token refreshed successfully',
      session: data.session,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Refresh token error:', error);
      res.status(500).json({ error: 'Failed to refresh token' });
    }
  }
};
