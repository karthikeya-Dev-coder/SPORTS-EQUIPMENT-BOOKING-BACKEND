import { HttpStatusCode } from "axios";
import { QueryFailedError } from "typeorm";
import { Logger } from "@/src/shared/logger";

type ErrorDetails = { [key: string]: unknown };

export const StatusCode = HttpStatusCode;

export class AppError extends Error {
  constructor(
    public message: string,
    public errorCode: number,
    public details: ErrorDetails,
  ) {
    super(message);
  }
}

export const DBError = (
  code: number,
  customMsg?: string,
  err?: QueryFailedError,
) => {
  Logger.error(`DB Error code: ${code}`);
  const errorMaps: Record<number, Array<unknown>> = {
    23505: ["Duplicate entry", StatusCode.BadRequest, { message: err?.message }],
    23503: ["Entity in use", StatusCode.BadRequest, { message: err?.message }],
  };
  const [defaultMsg, errorCode, details] = errorMaps[code]
    ? errorMaps[code]
    : [
        err?.message,
        StatusCode.BadRequest,
        { dbCode: code, error: err },
      ];
  const renMsg = customMsg ? `: ${customMsg}` : "";
  const msg = `${defaultMsg}${renMsg}`;
  throw new AppError(msg, errorCode as number, details as ErrorDetails);
};
