import { Router } from "express";
import { NotFoundError, ValidationError } from "../middleware.mjs";

export function createBoardRoutes({ boards, getNextBoardId }) {
  const router = Router();

  router.get("/", (req, res) => {
    res.json({ boards });
  });

  router.get("/:id", (req, res, next) => {
    const boardId = parseInt(req.params.id);
    const board = boards.find((b) => b.id === boardId);

    if (!board) {
      return next(new NotFoundError("Board", boardId));
    }

    res.json({ board });
  });

  router.post("/", (req, res, next) => {
    const { name, description } = req.body;

    const errors = [];
    if (!name || typeof name !== "string" || name.trim() === "") {
      errors.push({
        field: "name",
        message: "Name is required and must be a non-empty string",
      });
    }

    if (errors.length > 0) {
      return next(new ValidationError(errors));
    }

    const newBoard = {
      id: getNextBoardId(),
      name: name.trim(),
      description: description?.trim() || null,
      createdAt: new Date().toISOString(),
    };
    boards.push(newBoard);

    res.status(201).json({ board: newBoard });
  });

  router.put("/:id", (req, res, next) => {
    const boardId = parseInt(req.params.id);
    const boardIndex = boards.findIndex((b) => b.id === boardId);

    if (boardIndex === -1) {
      return next(new NotFoundError("Board", boardId));
    }

    const { name, description } = req.body;

    const errors = [];
    if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
      errors.push({ field: "name", message: "Name cannot be empty" });
    }

    if (errors.length > 0) {
      return next(new ValidationError(errors));
    }

    const currentBoard = boards[boardIndex];
    const updatedBoard = {
      ...currentBoard,
      name: name?.trim() || currentBoard.name,
      description: description?.trim() || currentBoard.description,
      updatedAt: new Date().toISOString(),
    };
    boards[boardIndex] = updatedBoard;

    res.json({ board: updatedBoard });
  });

  router.delete("/:id", (req, res, next) => {
    const boardId = parseInt(req.params.id);
    const boardIndex = boards.findIndex((b) => b.id === boardId);

    if (boardIndex === -1) {
      return next(new NotFoundError("Board", boardId));
    }

    boards.splice(boardIndex, 1);

    res.status(204).send();
  });

  return router;
}
