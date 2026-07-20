import { Response } from 'express';
import * as followerService from '../services/followerService.js';
import { AuthenticatedRequest } from '../middlewares/authGuard.js';

export const getFollowersByUserController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const followers = await followerService.getFollowersByUser(id);
    res.json(followers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar seguidores' });
  }
};

export const getFollowingByUserController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const following = await followerService.getFollowingByUser(id);
    res.json(following);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar utilizadores seguidos' });
  }
};

export const followUserController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.utilizador) {
      return res.status(401).json({ error: 'Utilizador não autenticado.' });
    }

    const { followingId } = req.body;

    const followerId = req.utilizador.id_utilizador;

    if (followerId === Number(followingId)) {
      return res.status(400).json({ error: 'Não pode seguir-se a si próprio.' });
    }

    const follow = await followerService.followUser(followerId, Number(followingId));
    res.status(201).json(follow);
  } catch (error) {
    res.status(400).json({ error: 'Não foi possível seguir o utilizador' });
  }
};


export const unfollowUserController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.utilizador) {
      return res.status(401).json({ error: 'Utilizador não autenticado.' });
    }

    const followingId = Number(req.query.followingId);
    const followerId = req.utilizador.id_utilizador;

    if (Number.isNaN(followingId)) {
      return res.status(400).json({ error: 'followingId inválido.' });
    }

    await followerService.unfollowUser(followerId, followingId);

    return res.status(204).send();
  } catch (error) {
    console.error("Erro unfollow:", error);
    return res.status(404).json({ error: 'Relação de follow não encontrada' });
  }
};