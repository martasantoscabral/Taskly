import { Router } from "express";
import {
  suggestAndSaveSubtasksController,
  suggestSubtasksController,
} from "../controllers/taskAiController.js";

const router = Router();

router.post("/subtasks", suggestSubtasksController);
router.post("/:id/subtasks", suggestAndSaveSubtasksController);

export default router;