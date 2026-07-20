import { Router } from 'express';
import {
  getChallengesController,
  getChallengeByIdController,
  createChallengeController,
  updateChallengeController,
  deleteChallengeController,
  joinChallengeController,
  leaveChallengeController,
  getChallengeParticipantsController,
  updateChallengeProgressController,
  publishChallengeController,
  unpublishChallengeController,
  completeChallengeController,
  completeParticipantController,

} from '../controllers/challengeController.js';
import { authGuard } from '../middlewares/authGuard.js';

const router = Router();

router.get('/', authGuard, getChallengesController);                             //rota para listar todos os desafios
router.get('/:id', authGuard, getChallengeByIdController);                       //rota para obter um desafio por ID
router.post('/', authGuard, createChallengeController);                          //rota para criar um novo desafio
router.put('/:id', authGuard, updateChallengeController);                        //rota para atualizar um desafio específico
router.delete('/:id', authGuard, deleteChallengeController);                     //rota para eliminar um desafio específico

router.post('/:id/join', authGuard, joinChallengeController);                    //rota para um utilizador se juntar a um desafio
router.delete('/:id/leave', authGuard, leaveChallengeController);                //rota para um utilizador sair de um desafio
router.get('/:id/participants', authGuard, getChallengeParticipantsController);  //rota para obter os participantes de um desafio
router.put('/:id/progress', authGuard, updateChallengeProgressController);       //rota para atualizar o progresso de um utilizador num desafio


router.put('/:id/publish', authGuard, publishChallengeController);
router.put('/:id/unpublish', authGuard, unpublishChallengeController);
router.put('/:id/complete', authGuard, completeChallengeController);
router.put('/:id/participants/:userId/complete',authGuard,completeParticipantController);

export default router;