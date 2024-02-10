class ErrorResponse extends Error {
  statusCode: string | number;
  constructor(message: string | any, statusCode: string | number) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorResponse;
