import { NotFoundError, ValidationError } from "../middleware.mjs";

function toBoardResponse(board) {
  return {
    id: board.id,
    name: board.name,
    description: board.description,
    createdAt: board.created_at,
    updatedAt: board.updated_at,
  };
}

export function createBoardsService({ db }) {
  async function getAllBoards() {
    const result = await db.query(
      `SELECT id, name, description, created_at, updated_at
       FROM boards
       ORDER BY id ASC`,
    );
    return result.rows.map(toBoardResponse);
  }

  async function getBoardById(id) {
    const result = await db.query(
      `SELECT id, name, description, created_at, updated_at
       FROM boards
       WHERE id = $1`,
      [id],
    );
    const board = result.rows[0];
    if (!board) {
      throw new NotFoundError("Board", id);
    }

    return toBoardResponse(board);
  }

  async function createBoard({ name, description }) {
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

    const result = await db.query(
      `INSERT INTO boards (name, description)
       VALUES ($1, $2)
       RETURNING id, name, description, created_at, updated_at`,
      [name.trim(), description?.trim() || null],
    );
    return toBoardResponse(result.rows[0]);
  }

  async function updateBoard(id, { name, description }) {
    const errors = [];
    if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
      errors.push({ field: "name", message: "Name cannot be empty" });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    const existingBoardResult = await db.query(
      "SELECT id, name, description FROM boards WHERE id = $1",
      [id],
    );
    const currentBoard = existingBoardResult.rows[0];
    if (!currentBoard) {
      throw new NotFoundError("Board", id);
    }

    const result = await db.query(
      `UPDATE boards
       SET
         name = $1,
         description = $2,
         updated_at = NOW()
       WHERE id = $3
       RETURNING id, name, description, created_at, updated_at`,
      [
        name?.trim() || currentBoard.name,
        description !== undefined
          ? (description?.trim() || null)
          : currentBoard.description,
        id,
      ],
    );

    return toBoardResponse(result.rows[0]);
  }

  async function deleteBoard(id) {
    const result = await db.query("DELETE FROM boards WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      throw new NotFoundError("Board", id);
    }
  }

  return {
    getAllBoards,
    getBoardById,
    createBoard,
    updateBoard,
    deleteBoard,
  };
}
