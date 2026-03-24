const STORAGE_KEY = "donesy-offline-state-v1";

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function getDefaultState() {
  return {
    version: 1,
    user: null,
    boards: [],
    lastBoardSnapshot: null,
  };
}

function canUseStorage() {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch (error) {
    return false;
  }
}

function readState() {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return {
      ...getDefaultState(),
      ...parsed,
    };
  } catch (error) {
    return null;
  }
}

function writeState(state) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Ignore storage write failures so the app still works online.
  }
}

function normalizeUser(user) {
  if (!user || user.id === undefined || user.id === null) {
    return null;
  }

  return {
    id: user.id,
    name: user.name || "",
    email: user.email || "",
  };
}

export function saveOfflineUser(user) {
  const normalizedUser = normalizeUser(user);
  if (!normalizedUser) {
    return;
  }

  const state = readState() || getDefaultState();
  const hasDifferentUser = state.user && state.user.id !== normalizedUser.id;

  state.user = normalizedUser;

  if (hasDifferentUser) {
    state.boards = [];
    state.lastBoardSnapshot = null;
  }

  writeState(state);
}

export function saveOfflineBoards(userId, boards) {
  const state = readState();
  if (!state || state.user?.id !== userId) {
    return;
  }

  state.boards = Array.isArray(boards) ? cloneValue(boards) : [];
  writeState(state);
}

export function saveOfflineBoardSnapshot(userId, board, columns, tasks) {
  const state = readState();
  if (!state || state.user?.id !== userId || !board?.id) {
    return;
  }

  state.lastBoardSnapshot = {
    userId,
    boardId: board.id,
    board: cloneValue(board),
    columns: Array.isArray(columns) ? cloneValue(columns) : [],
    tasks: Array.isArray(tasks) ? cloneValue(tasks) : [],
    savedAt: new Date().toISOString(),
  };

  writeState(state);
}

export function getOfflineBootstrap() {
  const state = readState();
  if (!state?.user || !state?.lastBoardSnapshot) {
    return null;
  }

  if (state.lastBoardSnapshot.userId !== state.user.id) {
    return null;
  }

  return {
    user: cloneValue(state.user),
    boards: Array.isArray(state.boards) ? cloneValue(state.boards) : [],
    boardSnapshot: cloneValue(state.lastBoardSnapshot),
  };
}

export function getOfflineBoards(userId) {
  const state = readState();
  if (!state || state.user?.id !== userId) {
    return null;
  }

  return Array.isArray(state.boards) ? cloneValue(state.boards) : [];
}

export function getOfflineBoardSnapshot(userId, boardId) {
  const state = readState();
  if (!state?.lastBoardSnapshot) {
    return null;
  }

  if (state.lastBoardSnapshot.userId !== userId || state.lastBoardSnapshot.boardId !== boardId) {
    return null;
  }

  return cloneValue(state.lastBoardSnapshot);
}

export function clearOfflineBoardSnapshot(boardId) {
  const state = readState();
  if (!state?.lastBoardSnapshot) {
    return;
  }

  if (boardId === undefined || state.lastBoardSnapshot.boardId === boardId) {
    state.lastBoardSnapshot = null;
    writeState(state);
  }
}

export function clearOfflineCache() {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Ignore storage cleanup failures.
  }
}
