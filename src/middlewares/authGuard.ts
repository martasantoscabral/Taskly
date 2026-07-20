import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido nas variáveis de ambiente.');
}

export interface JwtPayload {
  id_utilizador: number;
  role?: 'USER' | 'ADMIN';
}

export interface AuthenticatedRequest extends Request {
  utilizador?: JwtPayload;
}

export const authGuard = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Acesso negado. Token em falta.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.utilizador = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido ou expirado.',
    });
  }
};