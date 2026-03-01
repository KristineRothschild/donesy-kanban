import { Router } from "express";

export function createBoardRoutes({ boardsService }) {
  const router = Router();

  router.get("/", (req, res) => {
    const boards = boardsService.getAllBoards();
    res.json({ boards });
  });

  router.get("/:id", (req, res, next) => {
    try {
      const board = boardsService.getBoardById(parseInt(req.params.id));
      res.json({ board });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", (req, res, next) => {
    try {
      const board = boardsService.createBoard(req.body);
      res.status(201).json({ board });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", (req, res, next) => {
    try {
      const board = boardsService.updateBoard(parseInt(req.params.id), req.body);
      res.json({ board });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", (req, res, next) => {
    try {
      boardsService.deleteBoard(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
