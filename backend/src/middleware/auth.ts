import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('DEBUG: Authenticate middleware called for path:', req.path);
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('DEBUG: Missing or invalid auth header');
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    console.log('DEBUG: Token present, length:', token.length);

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.log('DEBUG: Supabase getUser error:', error, 'user:', !!user);
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    console.log('DEBUG: User authenticated:', user.id, user.email);
    console.log('DEBUG: Fetching roles for user:', user.id);
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('DEBUG: Roles fetch error:', rolesError);
      res.status(500).json({ error: 'Failed to fetch user roles' });
      return;
    }

    const roles = userRoles?.map((ur: any) => ur.roles.name) || [];
    console.log('DEBUG: Fetched roles:', roles);

    req.user = {
      id: user.id,
      email: user.email!,
      roles
    };

    console.log('DEBUG: Auth middleware success, proceeding to next');
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.roles
      });
      return;
    }

    next();
  };
};
