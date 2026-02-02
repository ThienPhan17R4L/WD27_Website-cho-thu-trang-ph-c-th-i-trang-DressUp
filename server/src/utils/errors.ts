export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(code: string, message: string, details?: unknown) {
    super(400, code, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(code: string, message: string, details?: unknown) {
    super(401, code, message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(code: string, message: string, details?: unknown) {
    super(403, code, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(code: string, message: string, details?: unknown) {
    super(404, code, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(code: string, message: string, details?: unknown) {
    super(409, code, message, details);
  }
}
