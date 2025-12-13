import { Response } from 'express';
import config from '../config/config';

export const sendTokenCookie = (res: Response, token: string): void => {
  const cookieOptions = {
    expires: new Date(Date.now() + config.cookie.expiresIn * 24 * 60 * 60 * 1000), // Convert days to milliseconds
    httpOnly: config.cookie.httpOnly,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    signed: true,
  };

  res.cookie('token', token, cookieOptions);
};

export const clearTokenCookie = (res: Response): void => {
  res.clearCookie('token');
};
