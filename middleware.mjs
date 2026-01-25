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
  }
}

const errorHandler = (err, req, res, next) => {
  const status = Number(err?.status || err?.statusCode || 500);
  const message = err?.message || "Internal server error";
  const code = err?.code || "INTERNAL_SERVER_ERROR";
  const details =
    Array.isArray(err?.details) && err.details.length > 0
      ? err.details
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
