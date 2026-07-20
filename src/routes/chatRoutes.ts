import { Router } from "express";
import { authGuard } from "../middlewares/authGuard.js";

import {
  getMensagensGrupoController,
  createMensagemGrupoController,
} from "../controllers/chatController.js";

const router = Router();

/**
 * GET /api/chat/group/:grupoId
 * Lista todas as mensagens de um grupo.
 */
router.get(
  "/group/:grupoId",
  authGuard,
  getMensagensGrupoController,
);

/**
 * POST /api/chat/group/:grupoId
 * Envia uma nova mensagem para o grupo.
 */
router.post(
  "/group/:grupoId",
  authGuard,
  createMensagemGrupoController,
);

export default router;