import { Router } from 'express';
import {createGroupController,getGroupsByUserController, createUserGroupController, deleteUserGroupController, getAllUserInGroupController, deleteGroupController} from "../controllers/groupController.js";
import { authGuard } from '../middlewares/authGuard.js';


const router = Router();
router.post("/", authGuard, createGroupController);
router.delete("/user/", authGuard, deleteUserGroupController);
router.delete("/", authGuard, deleteGroupController);
router.post("/user", authGuard, createUserGroupController);
router.get("/user", authGuard, getAllUserInGroupController);
router.get("/by-user", authGuard, getGroupsByUserController);


export default router;
