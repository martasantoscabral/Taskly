import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/authGuard.js";
import * as chatService from "../services/chatService.js";

/**
 * GET /api/chat/group/:grupoId
 * Lista as mensagens de um grupo.
 */
export async function getMensagensGrupoController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const grupoId = Number(req.params.grupoId);
  const userId = req.utilizador?.id_utilizador;

  if (!Number.isInteger(grupoId) || grupoId <= 0) {
    return res.status(400).json({
      error: "ID do grupo inválido.",
    });
  }

  if (!userId) {
    return res.status(401).json({
      error: "Utilizador não autenticado.",
    });
  }

  try {
    const membro = await chatService.utilizadorPertenceAoGrupo(
      grupoId,
      userId,
    );

    if (!membro) {
      return res.status(403).json({
        error: "Não pertences a este grupo.",
      });
    }

    const mensagens = await chatService.getMensagensGrupo(grupoId);

    return res.status(200).json(mensagens);
  } catch (error) {
    console.error("Erro ao carregar mensagens do grupo:", error);

    return res.status(500).json({
      error: "Erro ao carregar mensagens.",
    });
  }
}

/**
 * POST /api/chat/group/:grupoId
 * Envia uma mensagem para um grupo.
 */
export async function createMensagemGrupoController(
  req: AuthenticatedRequest,
  res: Response,
) {
  const grupoId = Number(req.params.grupoId);
  const userId = req.utilizador?.id_utilizador;
  const texto = String(req.body.texto || "").trim();

  if (!Number.isInteger(grupoId) || grupoId <= 0) {
    return res.status(400).json({
      error: "ID do grupo inválido.",
    });
  }

  if (!userId) {
    return res.status(401).json({
      error: "Utilizador não autenticado.",
    });
  }

  if (!texto) {
    return res.status(400).json({
      error: "A mensagem não pode estar vazia.",
    });
  }

  if (texto.length > 2000) {
    return res.status(400).json({
      error: "A mensagem não pode ultrapassar 2000 caracteres.",
    });
  }

  try {
    const membro = await chatService.utilizadorPertenceAoGrupo(
      grupoId,
      userId,
    );

    if (!membro) {
      return res.status(403).json({
        error: "Não pertences a este grupo.",
      });
    }

    const mensagem = await chatService.createMensagemGrupo(
      grupoId,
      userId,
      texto,
    );

    return res.status(201).json(mensagem);
  } catch (error) {
    console.error("Erro ao enviar mensagem para o grupo:", error);

    return res.status(500).json({
      error: "Erro ao enviar mensagem.",
    });
  }
}