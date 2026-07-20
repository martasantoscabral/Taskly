import { type Response, type NextFunction } from "express";
import { type AuthenticatedRequest } from "./authGuard.js";

export const requireRole = (...rolesPermitidos: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.utilizador) {
      return res.status(401).json({ error: "Utilizador não autenticado." });
    }

    if (!req.utilizador.role || !rolesPermitidos.includes(req.utilizador.role)) {
      return res.status(403).json({ error: "Não autorizado." });
    }

    return next();
  };
};

export const roleGroupVerify = ()