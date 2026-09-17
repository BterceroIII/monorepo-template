import * as jwt from 'jsonwebtoken';

export const generateJWT = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');

  return jwt.sign({ id: userId }, secret, {
    expiresIn: '30d',
  });
};

export const verifyJWT = (token: string): any => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');

  return jwt.verify(token, secret);
};
