import { type Request, type Response } from 'express';
import * as feedService from '../services/feedService.js';
import {
  feedIdParamSchema,
  feedCommentIdParamSchema,
  feedCreateSchema,
  feedLikeSchema,
  feedCommentCreateSchema,
} from '../schemas/feedSchema.js';

export const getFeedPostsController = async (_req: Request, res: Response) => {
  try {
    const posts = await feedService.getFeedPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar feed' });
  }
};

export const getFeedPostByIdController = async (req: Request, res: Response) => {
  const paramResult = feedIdParamSchema.safeParse(req.params);

  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const post = await feedService.getFeedPostById(paramResult.data.id);

    if (!post) {
      return res.status(404).json({ error: 'Publicação não encontrada' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter publicação' });
  }
};

export const createFeedPostController = async (req: Request, res: Response) => {
  const bodyResult = feedCreateSchema.safeParse(req.body);

  if (!bodyResult.success) {
    return res.status(400).json({
      errors: bodyResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    const newPost = await feedService.createFeedPost(bodyResult.data);
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ error: 'Dados inválidos para criar publicação' });
  }
};

export const deleteFeedPostController = async (req: Request, res: Response) => {
  const paramResult = feedIdParamSchema.safeParse(req.params);

  if (!paramResult.success) {
    return res.status(400).json({
      errors: paramResult.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
  }

  try {
    await feedService.deleteFeedPost(paramResult.data.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Publicação não encontrada' });
  }
};

export const addLikeToPostController = async (req: Request, res: Response) => {
  const paramResult = feedIdParamSchema.safeParse(req.params);
  const bodyResult = feedLikeSchema.safeParse(req.body);

  if (!paramResult.success || !bodyResult.success) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  try {
    const like = await feedService.addLikeToPost(
      paramResult.data.id,
      bodyResult.data.id_user,
    );

    res.status(201).json(like);
  } catch (error) {
    res.status(400).json({ error: 'Não foi possível adicionar like' });
  }
};

export const removeLikeFromPostController = async (req: Request, res: Response) => {
  const paramResult = feedIdParamSchema.safeParse(req.params);
  const bodyResult = feedLikeSchema.safeParse(req.body);

  if (!paramResult.success || !bodyResult.success) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  try {
    await feedService.removeLikeFromPost(
      paramResult.data.id,
      bodyResult.data.id_user,
    );

    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Like não encontrado' });
  }
};

export const getCommentsByPostController = async (req: Request, res: Response) => {
  const paramResult = feedIdParamSchema.safeParse(req.params);

  if (!paramResult.success) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const comments = await feedService.getCommentsByPost(paramResult.data.id);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar comentários' });
  }
};

export const addCommentToPostController = async (req: Request, res: Response) => {
  const paramResult = feedIdParamSchema.safeParse(req.params);
  const bodyResult = feedCommentCreateSchema.safeParse(req.body);

  if (!paramResult.success || !bodyResult.success) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  try {
    const comment = await feedService.addCommentToPost(
      paramResult.data.id,
      bodyResult.data.id_user,
      bodyResult.data.comentario,
    );

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: 'Não foi possível adicionar comentário' });
  }
};

export const deleteCommentFromPostController = async (req: Request, res: Response) => {
  const paramResult = feedCommentIdParamSchema.safeParse(req.params);

  if (!paramResult.success) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    await feedService.deleteCommentFromPost(paramResult.data.commentId);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Comentário não encontrado' });
  }
};