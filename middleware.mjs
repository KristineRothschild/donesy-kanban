import { translate } from "./locales/i18n.mjs";

class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

class ForbiddenError extends ApiError {
  constructor(
    message = "You shall not pass! The board is protected by the One User with the highest IQ.",
  ) {
    super(message, { status: 403, code: "FORBIDDEN" });
  }
}

class ValidationError extends ApiError {
  constructor(details = [], message = "Invalid request body") {
    super(message, { status: 400, code: "VALIDATION_ERROR", details });
  }
}

class NotFoundError extends ApiError {
  constructor(resource = "Resource", id) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, { status: 404, code: "NOT_FOUND" });
    this.resource = resource;
    this.resourceId = id;
  }
}

const errorHandler = (err, req, res, next) => {
  const status = Number(err?.status || err?.statusCode || 500);
  const lang = req?.lang || "en";
  const code = err?.code || "INTERNAL_SERVER_ERROR";

  let message;
  if (err?.resource) {
    const key = err.resourceId ? "not_found_with_id" : "not_found";
    const translatedResource = translate(lang, err.resource);
    message = translate(lang, key)
      .replace("{resource}", translatedResource)
      .replace("{id}", err.resourceId);
  } else {
    message = translate(lang, err?.message || "Internal server error");
  }

  let details =
    Array.isArray(err?.details) && err.details.length > 0
      ? err.details.map((d) => ({ ...d, message: translate(lang, d.message) }))
      : undefined;

  const payload = {
    error: {
      message,
      code,
      ...(details ? { details } : {}),
    },
  };

  res.status(status).json(payload);
};

export { ApiError, ForbiddenError, ValidationError, NotFoundError };
export default errorHandler;
