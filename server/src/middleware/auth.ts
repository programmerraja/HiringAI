import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { AppError } from './errorHandler';
import config from '../config/config';

// Extend Express Request interface to include user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.signedCookies.token) {
      token = req.signedCookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const error: AppError = new Error('Not authorized to access this route');
      error.statusCode = 401;
      return next(error);
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string };

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        const error: AppError = new Error('User not found');
        error.statusCode = 404;
        return next(error);
      }

      req.user = user;
      next();
    } catch (error) {
      const err: AppError = new Error('Not authorized to access this route');
      err.statusCode = 401;
      return next(err);
    }
  } catch (error) {
    next(error);
  }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    const error: AppError = new Error('Not authorized as an admin');
    error.statusCode = 403;
    next(error);
  }
};
