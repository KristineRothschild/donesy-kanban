import { randomBytes } from "node:crypto";
import { ForbiddenError, NotFoundError, ValidationError } from "../middleware.mjs";

function toBoardResponse(board, role = "owner") {
  return {
    id: board.id,
    name: board.name,
    description: board.description,
    ownerId: board.owner_id,
    visibility: board.visibility,
    role,
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

function toBoardMemberResponse(row) {
  return {
    userId: row.user_id,
    name: row.name,
    email: row.email,
    role: row.role,
  };
}

const DEFAULT_COLUMN_NAMES = ["To Do", "Doing", "Done"];
const ALLOWED_MEMBER_ROLES = ["viewer", "editor"];

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

  function normalizeMemberRole(role) {
    if (typeof role !== "string") {
      throw new ValidationError([{ field: "role", message: "role must be viewer or editor" }]);
    }

    const normalizedRole = role.trim().toLowerCase();
    if (!ALLOWED_MEMBER_ROLES.includes(normalizedRole)) {
      throw new ValidationError([{ field: "role", message: "role must be viewer or editor" }]);
    }

    return normalizedRole;
  }

  async function getBoardsForUser(userId) {
    const result = await db.query(
      `SELECT DISTINCT b.*,
              CASE
                WHEN b.owner_id = $1 THEN 'owner'
                ELSE m.role
              END AS access_role
       FROM boards b
       LEFT JOIN board_members m ON m.board_id = b.id AND m.user_id = $1
       WHERE b.owner_id = $1 OR m.user_id IS NOT NULL
       ORDER BY b.id ASC`,
      [userId],
    );
    return result.rows.map((row) => toBoardResponse(row, row.access_role || "owner"));
  }

  async function getBoardByIdForUser(boardId, userId) {
    const access = await getBoardAccessForUser(boardId, userId);
    return toBoardResponse(access.board, access.role);
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
    return toBoardResponse(boardRow, "owner");
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

    return toBoardResponse(result.rows[0], "owner");
  }

  async function deleteBoardForOwner(boardId, userId) {
    await assertOwner(boardId, userId);
    const result = await db.query("DELETE FROM boards WHERE id = $1", [boardId]);
    if (result.rowCount === 0) {
      throw new NotFoundError("Board", boardId);
    }
  }

  async function createInviteForOwner(boardId, userId, role) {
    await assertOwner(boardId, userId);

    const normalizedRole = normalizeMemberRole(role);
    const token = randomBytes(16).toString("hex");

    await db.query(
      `INSERT INTO board_invites (board_id, token, role)
       VALUES ($1, $2, $3)`,
      [boardId, token, normalizedRole],
    );

    await db.query(
      `UPDATE boards
       SET visibility = 'shared',
           updated_at = NOW()
       WHERE id = $1`,
      [boardId],
    );

    return {
      token,
      role: normalizedRole,
    };
  }

  async function getMembersForOwner(boardId, userId) {
    await assertOwner(boardId, userId);

    const result = await db.query(
      `SELECT m.user_id, u.name, u.email, m.role
       FROM board_members m
       JOIN users u ON u.id = m.user_id
       WHERE m.board_id = $1
       ORDER BY u.name ASC, u.email ASC`,
      [boardId],
    );

    return result.rows.map(toBoardMemberResponse);
  }

  async function updateMemberRoleForOwner(boardId, userId, memberUserId, role) {
    await assertOwner(boardId, userId);

    const normalizedRole = normalizeMemberRole(role);
    const result = await db.query(
      `UPDATE board_members
       SET role = $1
       WHERE board_id = $2 AND user_id = $3
       RETURNING user_id, role`,
      [normalizedRole, boardId, memberUserId],
    );

    if (result.rowCount === 0) {
      throw new ValidationError([], "Member not found on this board");
    }

    return {
      userId: result.rows[0].user_id,
      role: result.rows[0].role,
    };
  }

  async function removeMemberForOwner(boardId, userId, memberUserId) {
    await assertOwner(boardId, userId);

    const result = await db.query(
      `DELETE FROM board_members
       WHERE board_id = $1 AND user_id = $2`,
      [boardId, memberUserId],
    );

    if (result.rowCount === 0) {
      throw new ValidationError([], "Member not found on this board");
    }
  }

  async function acceptInviteForUser(token, userId) {
    const result = await db.query(
      `SELECT i.board_id, i.role, b.*
       FROM board_invites i
       JOIN boards b ON b.id = i.board_id
       WHERE i.token = $1`,
      [token],
    );
    const invite = result.rows[0];

    if (!invite) {
      throw new NotFoundError("Invite", token);
    }

    if (invite.owner_id !== userId) {
      await db.query(
        `INSERT INTO board_members (board_id, user_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (board_id, user_id)
         DO UPDATE SET role = EXCLUDED.role`,
        [invite.board_id, userId, invite.role],
      );
    }

    const role = invite.owner_id === userId ? "owner" : invite.role;
    return toBoardResponse(invite, role);
  }

  return {
    getBoardAccessForUser,
    getBoardsForUser,
    getBoardByIdForUser,
    getColumnsForBoard,
    createBoard,
    createInviteForOwner,
    getMembersForOwner,
    updateMemberRoleForOwner,
    removeMemberForOwner,
    acceptInviteForUser,
    updateBoardForOwner,
    deleteBoardForOwner,
  };
}
