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

  router.post("/:boardId/invites", async (req, res, next) => {
    try {
      const userId = getSessionUserId(req);
      const boardId = parseInt(req.params.boardId, 10);
      const invite = await boardsService.createInviteForOwner(boardId, userId, req.body.role);
      const inviteUrl = `${req.protocol}://${req.get("host")}/?invite=${invite.token}`;
      res.status(201).json({
        invite: {
          ...invite,
          inviteUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:boardId/members", async (req, res, next) => {
    try {
      const userId = getSessionUserId(req);
      const boardId = parseInt(req.params.boardId, 10);
      const members = await boardsService.getMembersForOwner(boardId, userId);
      res.json({ members });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:boardId/members/:memberUserId", async (req, res, next) => {
    try {
      const userId = getSessionUserId(req);
      const boardId = parseInt(req.params.boardId, 10);
      const memberUserId = parseInt(req.params.memberUserId, 10);
      const member = await boardsService.updateMemberRoleForOwner(boardId, userId, memberUserId, req.body.role);
      res.json({ member });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:boardId/members/:memberUserId", async (req, res, next) => {
    try {
      const userId = getSessionUserId(req);
      const boardId = parseInt(req.params.boardId, 10);
      const memberUserId = parseInt(req.params.memberUserId, 10);
      await boardsService.removeMemberForOwner(boardId, userId, memberUserId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  router.post("/invites/:token/accept", async (req, res, next) => {
    try {
      const userId = getSessionUserId(req);
      const board = await boardsService.acceptInviteForUser(req.params.token, userId);
      res.json({ board });
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
