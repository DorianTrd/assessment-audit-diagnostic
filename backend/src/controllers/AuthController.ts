import { Request, Response } from "express";
import authService from "../services/AuthService";
import logService from "../services/LogService";

export class AuthController {
  async login(req: Request, res: Response) {
    const start = Date.now();
    const route = "/auth/login";
    const method = "POST";

    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const duration = Date.now() - start;
        await logService.logRequest(
          route,
          method,
          400,
          duration,
          "Email and password are required"
        );
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      const result = await authService.login(email, password);

      if (!result) {
        const duration = Date.now() - start;
        await logService.logRequest(
          route,
          method,
          401,
          duration,
          "Invalid credentials"
        );
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const duration = Date.now() - start;
      await logService.logRequest(route, method, 200, duration);
      console.log(`[PERF] ${method} ${route} - ${duration} ms`);

      res.json(result);
    } catch (error) {
      console.error("Login error:", error);
      const duration = Date.now() - start;
      await logService.logRequest(
        route,
        method,
        500,
        duration,
        error instanceof Error ? error.message : "Internal server error"
      );
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default new AuthController();