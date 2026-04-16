import { Request, Response, NextFunction } from "express";
import { authenticate as standaloneAuth, authorize as standaloneAuthorize, AuthRequest as StandaloneAuthRequest } from "../infrastructure/middleware/standalone_auth";

export type AuthRequest = StandaloneAuthRequest;

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  return standaloneAuth(req, res, next);
};

export const authorize = (roles: any[]) => {
  return standaloneAuthorize(roles);
};
