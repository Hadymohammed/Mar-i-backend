export type ResultStatus = 'Succeeded' | 'Failed';

export class Result<T = any> {
  status: ResultStatus;
  errorCode: number | null;
  message: string | null;
  data: T | null;

  private constructor(
    status: ResultStatus,
    errorCode: number | null,
    message: string | null,
    data: T | null,
  ) {
    this.status = status;
    this.errorCode = errorCode;
    this.message = message;
    this.data = data;
  }

  static ok<T>(data: T, message: string = 'Success'): Result<T> {
    return new Result('Succeeded', null, message, data);
  }

  static fail<T>(data?: T, message: string = "Failed", errorCode: number = 400): Result<T> {
    return new Result('Failed', errorCode, message, data);
  }
}
