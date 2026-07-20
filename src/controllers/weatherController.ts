import { type Request, type Response } from 'express';
import * as weatherService from '../services/weatherService';
import { type AuthenticatedRequest } from '../middlewares/authGuard.js';

/**
 * GET /api/weather/:city
 * Obtém o clima pelo nome da cidade
 * O próprio user pode ver o seu perfil; admin pode ver qualquer um.
 */
export const getWeatherCity = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.utilizador) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  try {
    const city = String(req.params.city);
    const clima = await weatherService.weatherCity(city)
    return res.json(clima);
  } catch (error) {
    console.error('Erro ao obter clima:', error);
    return res.status(500).json({ error: 'Erro ao obter clima' });
  }
};

export const getWeatherCode = async (req: AuthenticatedRequest, res: Response) => {}
