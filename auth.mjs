import { UnauthorizedError } from "./middleware.mjs";

export function getSessionUserId(req) {
  const raw = req.session?.userId;
  if (raw === undefined || raw === null) {
    throw new UnauthorizedError();
  }
  const id = parseInt(raw, 10);
  if (!Number.isFinite(id)) {
    throw new UnauthorizedError("Invalid session");
  }
  return id;
}
