import { Router } from "express";

export function createBoardRoutes({ boardsService }) {
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      const boards = await boardsService.getAllBoards();
      res.json({ boards });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const board = await boardsService.getBoardById(parseInt(req.params.id));
      res.json({ board });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const board = await boardsService.createBoard(req.body);
      res.status(201).json({ board });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const board = await boardsService.updateBoard(parseInt(req.params.id), req.body);
      res.json({ board });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      await boardsService.deleteBoard(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
