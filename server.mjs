import express from "express";
import errorHandler, { NotFoundError, ValidationError } from "./middleware.mjs";

const app = express();
const PORT = 8080;

app.use(express.json());

const boards = [
  {
    id: 1,
    name: "Application Development 1",
    description: "Group project",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Application Development 2",
    description: "Individual project",
    createdAt: new Date().toISOString(),
  },
];
let nextBoardId = 3;

app.get("/boards", (req, res) => {
  res.json({ boards });
});

app.get("/boards/:id", (req, res, next) => {
  const boardId = parseInt(req.params.id);
  const board = boards.find((b) => b.id === boardId);

  if (!board) {
    return next(new NotFoundError("Board", boardId));
  }

  res.json({ board });
});

app.post("/boards", (req, res, next) => {
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
    id: nextBoardId++,
    name: name.trim(),
    description: description?.trim() || null,
    createdAt: new Date().toISOString(),
  };
  boards.push(newBoard);

  res.status(201).json({ board: newBoard });
});

app.put("/boards/:id", (req, res, next) => {
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

app.delete("/boards/:id", (req, res, next) => {
  const boardId = parseInt(req.params.id);
  const boardIndex = boards.findIndex((b) => b.id === boardId);

  if (boardIndex === -1) {
    return next(new NotFoundError("Board", boardId));
  }

  boards.splice(boardIndex, 1);

  res.status(204).send();
});

app.use(express.static("public"));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
