import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { AppError } from '../middleware/errorHandler';
import { sendTokenCookie, clearTokenCookie } from '../utils/cookie';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      const error: AppError = new Error('User already exists');
      error.statusCode = 400;
      return next(error);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    const token = user.getSignedJwtToken();

    sendTokenCookie(res, token);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error: AppError = new Error('Please provide an email and password');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      const error: AppError = new Error('Invalid credentials');
      error.statusCode = 401;
      return next(error);
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      const error: AppError = new Error('Invalid credentials');
      error.statusCode = 401;
      return next(error);
    }

    const token = user.getSignedJwtToken();

    sendTokenCookie(res, token);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response) => {
  clearTokenCookie(res);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
