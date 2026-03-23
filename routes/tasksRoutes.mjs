import { Router } from "express";
import { getSessionUserId } from "../auth.mjs";

export function createTaskRoutes({ tasksService }) {
  const router = Router();

  router.put("/:taskId", async (req, res, next) => {
    try {
      const userId = getSessionUserId(req);
      const taskId = parseInt(req.params.taskId, 10);
      const task = await tasksService.updateTask(taskId, userId, req.body);
      res.json({ task });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:taskId", async (req, res, next) => {
    try {
      const userId = getSessionUserId(req);
      const taskId = parseInt(req.params.taskId, 10);
      await tasksService.deleteTask(taskId, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
