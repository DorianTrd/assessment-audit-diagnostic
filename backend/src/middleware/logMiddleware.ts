// src/middleware/logMiddleware.ts
import { Request, Response, NextFunction } from "express";
import logService from "../services/LogService";

export const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logService.logRequest(
      req.originalUrl,
      req.method,
      res.statusCode,
      duration
    ).catch(err => console.error("Log error:", err));
  });

  next();
};