import { NotFoundError, ValidationError } from "../middleware.mjs";

export function createBoardsService({ boards, getNextBoardId }) {
  function getAllBoards() {
    return boards;
  }

  function getBoardById(id) {
    const board = boards.find((b) => b.id === id);

    if (!board) {
      throw new NotFoundError("Board", id);
    }

    return board;
  }

  function createBoard({ name, description }) {
    const errors = [];
    if (!name || typeof name !== "string" || name.trim() === "") {
      errors.push({
        field: "name",
        message: "Name is required and must be a non-empty string",
      });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    const newBoard = {
      id: getNextBoardId(),
      name: name.trim(),
      description: description?.trim() || null,
      createdAt: new Date().toISOString(),
    };
    boards.push(newBoard);

    return newBoard;
  }

  function updateBoard(id, { name, description }) {
    const boardIndex = boards.findIndex((b) => b.id === id);

    if (boardIndex === -1) {
      throw new NotFoundError("Board", id);
    }

    const errors = [];
    if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
      errors.push({ field: "name", message: "Name cannot be empty" });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    const currentBoard = boards[boardIndex];
    const updatedBoard = {
      ...currentBoard,
      name: name?.trim() || currentBoard.name,
      description: description?.trim() || currentBoard.description,
      updatedAt: new Date().toISOString(),
    };
    boards[boardIndex] = updatedBoard;

    return updatedBoard;
  }

  function deleteBoard(id) {
    const boardIndex = boards.findIndex((b) => b.id === id);

    if (boardIndex === -1) {
      throw new NotFoundError("Board", id);
    }

    boards.splice(boardIndex, 1);
  }

  return {
    getAllBoards,
    getBoardById,
    createBoard,
    updateBoard,
    deleteBoard,
  };
}
