// src/shared/errors.ts
export class AppError extends Error {
  status: number;
  code: string;
  message: string;

  constructor(status: number, code: string, message?: string) {
    super(message || code);
    this.status = status;
    this.code = code;
    this.message = message || code;
  }
}
