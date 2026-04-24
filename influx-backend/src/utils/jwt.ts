import jwt from 'jsonwebtoken';

export const generateAccessToken = (user: any) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user: any) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: '7d' }
  );
};

export const setRefreshCookie = (res: any, token: string) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: isProd, // Must be true for SameSite=None
    sameSite: isProd ? 'none' : 'lax', // 'none' for cross-site prod, 'lax' for local dev
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });
};
