export class AppError extends Error {
    status: number; code: string
    constructor(status: number, code: string, msg?: string) {
      super(msg ?? code); this.status = status; this.code = code
    }
  }
  