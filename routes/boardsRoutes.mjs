import { Router } from "express";
import { getSessionUserId } from "../auth.mjs";

export function createBoardRoutes({ boardsService, tasksService }) {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const userId = getSessionUserId(req);
      const boards = await boardsService.getBoardsForUser(userId);
      res.json({ boards });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const userId = getSessionUserId(req);
      const board = await boardsService.createBoard({ ...req.body, ownerId: userId });
      res.status(201).json({ board });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:boardId/columns", async (req, res, next) => {
    try {
      const userId = getSessionUserId(req);
      const boardId = parseInt(req.params.boardId, 10);
      const columns = await boardsService.getColumnsForBoard(boardId, userId);
      res.json({ columns });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:boardId/tasks", async (req, res, next) => {
    try {
      const userId = getSessionUserId(req);
      const boardId = parseInt(req.params.boardId, 10);
      const tasks = await tasksService.listTasks(boardId, userId);
      res.json({ tasks });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:boardId/tasks", async (req, res, next) => {
    try {
      const userId = getSessionUserId(req);
      const boardId = parseInt(req.params.boardId, 10);
      const task = await tasksService.createTask(boardId, userId, req.body);
      res.status(201).json({ task });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const userId = getSessionUserId(req);
      const id = parseInt(req.params.id, 10);
      const board = await boardsService.getBoardByIdForUser(id, userId);
      res.json({ board });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const userId = getSessionUserId(req);
      const id = parseInt(req.params.id, 10);
      const board = await boardsService.updateBoardForOwner(id, userId, req.body);
      res.json({ board });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const userId = getSessionUserId(req);
      const id = parseInt(req.params.id, 10);
      await boardsService.deleteBoardForOwner(id, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
