import { ForbiddenError, NotFoundError, ValidationError } from "../middleware.mjs";

function toBoardResponse(board) {
  return {
    id: board.id,
    name: board.name,
    description: board.description,
    ownerId: board.owner_id,
    visibility: board.visibility,
    createdAt: board.created_at,
    updatedAt: board.updated_at,
  };
}

function toColumnResponse(row) {
  return {
    id: row.id,
    boardId: row.board_id,
    name: row.name,
    position: row.position,
  };
}

const DEFAULT_COLUMN_NAMES = ["To Do", "Doing", "Done"];

export function createBoardsService({ db }) {
  async function insertDefaultColumns(boardId) {
    for (let i = 0; i < DEFAULT_COLUMN_NAMES.length; i++) {
      await db.query(
        `INSERT INTO board_columns (board_id, name, position) VALUES ($1, $2, $3)`,
        [boardId, DEFAULT_COLUMN_NAMES[i], i],
      );
    }
  }

  async function getBoardAccessForUser(boardId, userId) {
    const boardResult = await db.query(`SELECT * FROM boards WHERE id = $1`, [boardId]);
    const board = boardResult.rows[0];
    if (!board) {
      throw new NotFoundError("Board", boardId);
    }

    if (board.owner_id === userId) {
      return { role: "owner", board };
    }

    const memberResult = await db.query(
      `SELECT role FROM board_members WHERE board_id = $1 AND user_id = $2`,
      [boardId, userId],
    );
    if (memberResult.rows.length === 0) {
      throw new ForbiddenError("You do not have access to this board");
    }

    return { role: memberResult.rows[0].role, board };
  }

  async function assertOwner(boardId, userId) {
    const boardResult = await db.query(
      `SELECT owner_id FROM boards WHERE id = $1`,
      [boardId],
    );
    const board = boardResult.rows[0];
    if (!board) {
      throw new NotFoundError("Board", boardId);
    }
    if (board.owner_id !== userId) {
      throw new ForbiddenError("Only the board owner can do this");
    }
  }

  async function getBoardsForUser(userId) {
    const result = await db.query(
      `SELECT DISTINCT b.*
       FROM boards b
       LEFT JOIN board_members m ON m.board_id = b.id AND m.user_id = $1
       WHERE b.owner_id = $1 OR m.user_id IS NOT NULL
       ORDER BY b.id ASC`,
      [userId],
    );
    return result.rows.map(toBoardResponse);
  }

  async function getBoardByIdForUser(boardId, userId) {
    const access = await getBoardAccessForUser(boardId, userId);
    return toBoardResponse(access.board);
  }

  async function getColumnsForBoard(boardId, userId) {
    await getBoardAccessForUser(boardId, userId);
    const result = await db.query(
      `SELECT id, board_id, name, position
       FROM board_columns
       WHERE board_id = $1
       ORDER BY position ASC, id ASC`,
      [boardId],
    );
    return result.rows.map(toColumnResponse);
  }

  async function createBoard({ name, description, visibility, ownerId }) {
    const errors = [];
    if (!name || typeof name !== "string" || name.trim() === "") {
      errors.push({
        field: "name",
        message: "Name is required and must be a non-empty string",
      });
    }

    if (ownerId === undefined || ownerId === null) {
      errors.push({ field: "ownerId", message: "ownerId is required" });
    }

    let vis = visibility;
    if (vis === undefined || vis === null || vis === "") {
      vis = "private";
    }
    if (vis !== "private" && vis !== "shared") {
      errors.push({ field: "visibility", message: "visibility must be private or shared" });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    const result = await db.query(
      `INSERT INTO boards (name, description, owner_id, visibility)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, owner_id, visibility, created_at, updated_at`,
      [name.trim(), description?.trim() || null, ownerId, vis],
    );

    const boardRow = result.rows[0];
    await insertDefaultColumns(boardRow.id);
    return toBoardResponse(boardRow);
  }

  async function updateBoardForOwner(boardId, userId, { name, description, visibility }) {
    await assertOwner(boardId, userId);

    const errors = [];
    if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
      errors.push({ field: "name", message: "Name cannot be empty" });
    }
    if (visibility !== undefined && visibility !== null && visibility !== "") {
      if (visibility !== "private" && visibility !== "shared") {
        errors.push({ field: "visibility", message: "visibility must be private or shared" });
      }
    }
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    const existingBoardResult = await db.query(
      "SELECT id, name, description, visibility FROM boards WHERE id = $1",
      [boardId],
    );
    const currentBoard = existingBoardResult.rows[0];
    if (!currentBoard) {
      throw new NotFoundError("Board", boardId);
    }

    const nextName = name !== undefined ? name.trim() : currentBoard.name;
    const nextDescription =
      description !== undefined
        ? description?.trim() || null
        : currentBoard.description;
    const nextVisibility =
      visibility !== undefined && visibility !== null && visibility !== ""
        ? visibility
        : currentBoard.visibility;

    const result = await db.query(
      `UPDATE boards
       SET name = $1,
           description = $2,
           visibility = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, name, description, owner_id, visibility, created_at, updated_at`,
      [nextName, nextDescription, nextVisibility, boardId],
    );

    return toBoardResponse(result.rows[0]);
  }

  async function deleteBoardForOwner(boardId, userId) {
    await assertOwner(boardId, userId);
    const result = await db.query("DELETE FROM boards WHERE id = $1", [boardId]);
    if (result.rowCount === 0) {
      throw new NotFoundError("Board", boardId);
    }
  }

  return {
    getBoardAccessForUser,
    getBoardsForUser,
    getBoardByIdForUser,
    getColumnsForBoard,
    createBoard,
    updateBoardForOwner,
    deleteBoardForOwner,
  };
}
