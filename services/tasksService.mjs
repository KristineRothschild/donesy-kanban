import { ForbiddenError, NotFoundError, ValidationError } from "../middleware.mjs";

function toTaskResponse(row) {
  return {
    id: row.id,
    boardId: row.board_id,
    columnId: row.column_id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    assigneeUserId: row.assignee_user_id,
    position: row.position,
    reviewRequested: row.review_requested,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function canEditTasks(role) {
  return role === "owner" || role === "editor";
}

export function createTasksService({ db, boardsService }) {
  async function getTaskRow(taskId) {
    const result = await db.query(
      `SELECT * FROM tasks WHERE id = $1`,
      [taskId],
    );
    return result.rows[0];
  }

  async function listTasks(boardId, userId) {
    await boardsService.getBoardAccessForUser(boardId, userId);

    const result = await db.query(
      `SELECT t.*
       FROM tasks t
       JOIN board_columns c ON c.id = t.column_id
       WHERE t.board_id = $1
       ORDER BY c.position ASC, t.position ASC, t.id ASC`,
      [boardId],
    );
    return result.rows.map(toTaskResponse);
  }

  async function createTask(boardId, userId, body) {
    const access = await boardsService.getBoardAccessForUser(boardId, userId);
    if (!canEditTasks(access.role)) {
      throw new ForbiddenError("You do not have permission to create tasks on this board");
    }

    const title = body.title;
    if (!title || typeof title !== "string" || title.trim() === "") {
      throw new ValidationError([], "Title is required");
    }

    let columnId = body.columnId;
    if (columnId === undefined || columnId === null) {
      const colResult = await db.query(
        `SELECT id FROM board_columns WHERE board_id = $1 ORDER BY position ASC LIMIT 1`,
        [boardId],
      );
      if (colResult.rows.length === 0) {
        throw new ValidationError([], "Board has no columns");
      }
      columnId = colResult.rows[0].id;
    } else {
      columnId = parseInt(columnId, 10);
      const check = await db.query(
        `SELECT id FROM board_columns WHERE id = $1 AND board_id = $2`,
        [columnId, boardId],
      );
      if (check.rows.length === 0) {
        throw new ValidationError([], "Invalid column for this board");
      }
    }

    const description =
      body.description === undefined || body.description === null
        ? null
        : String(body.description);
    const dueDate =
      body.dueDate === undefined || body.dueDate === null || body.dueDate === ""
        ? null
        : body.dueDate;
    const reviewRequested = body.reviewRequested === undefined ? false : Boolean(body.reviewRequested);
    let assigneeUserId = body.assigneeUserId;
    if (assigneeUserId === undefined || assigneeUserId === null) {
      assigneeUserId = null;
    } else {
      assigneeUserId = parseInt(assigneeUserId, 10);
      if (!Number.isFinite(assigneeUserId)) {
        throw new ValidationError([], "assigneeUserId must be a number");
      }
    }

    const result = await db.query(
      `INSERT INTO tasks (
         board_id,
         column_id,
         title,
         description,
         due_date,
         assignee_user_id,
         review_requested,
         position
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0)
       RETURNING *`,
      [boardId, columnId, title.trim(), description, dueDate, assigneeUserId, reviewRequested],
    );
    return toTaskResponse(result.rows[0]);
  }

  async function updateTask(taskId, userId, body) {
    const existing = await getTaskRow(taskId);
    if (!existing) {
      throw new NotFoundError("Task", taskId);
    }

    const access = await boardsService.getBoardAccessForUser(existing.board_id, userId);
    if (!canEditTasks(access.role)) {
      throw new ForbiddenError("You do not have permission to edit tasks on this board");
    }

    const title =
      body.title !== undefined ? body.title : existing.title;
    if (!title || typeof title !== "string" || title.trim() === "") {
      throw new ValidationError([], "Title cannot be empty");
    }

    let columnId = existing.column_id;
    if (body.columnId !== undefined && body.columnId !== null) {
      columnId = parseInt(body.columnId, 10);
      const check = await db.query(
        `SELECT id FROM board_columns WHERE id = $1 AND board_id = $2`,
        [columnId, existing.board_id],
      );
      if (check.rows.length === 0) {
        throw new ValidationError([], "Invalid column for this board");
      }
    }

    let description = existing.description;
    if (body.description !== undefined) {
      description =
        body.description === null ? null : String(body.description);
    }

    let dueDate = existing.due_date;
    if (body.dueDate !== undefined) {
      dueDate =
        body.dueDate === null || body.dueDate === "" ? null : body.dueDate;
    }

    let assigneeUserId = existing.assignee_user_id;
    if (body.assigneeUserId !== undefined) {
      if (body.assigneeUserId === null) {
        assigneeUserId = null;
      } else {
        assigneeUserId = parseInt(body.assigneeUserId, 10);
        if (!Number.isFinite(assigneeUserId)) {
          throw new ValidationError([], "assigneeUserId must be a number");
        }
      }
    }

    let reviewRequested = existing.review_requested;
    if (body.reviewRequested !== undefined) {
      reviewRequested = Boolean(body.reviewRequested);
    }

    const result = await db.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           due_date = $3,
           column_id = $4,
           assignee_user_id = $5,
           review_requested = $6,
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        title.trim(),
        description,
        dueDate,
        columnId,
        assigneeUserId,
        reviewRequested,
        taskId,
      ],
    );
    return toTaskResponse(result.rows[0]);
  }

  async function deleteTask(taskId, userId) {
    const existing = await getTaskRow(taskId);
    if (!existing) {
      throw new NotFoundError("Task", taskId);
    }

    const access = await boardsService.getBoardAccessForUser(existing.board_id, userId);
    if (!canEditTasks(access.role)) {
      throw new ForbiddenError("You do not have permission to delete tasks on this board");
    }

    await db.query(`DELETE FROM tasks WHERE id = $1`, [taskId]);
  }

  return {
    listTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
