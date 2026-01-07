import { Request, Response } from "express";
import dashboardService from "../services/DashboardService";
import logService from "../services/LogService";

export class DashboardController {
  async getSummary(req: Request, res: Response) {
    const start = Date.now();
    const route = "/dashboard/summary";
    const method = "GET";

    try {
      const summary = await dashboardService.getSummary();
      
      const duration = Date.now() - start;
      await logService.logRequest(route, method, 200, duration);
      console.log(`[PERF] ${method} ${route} - ${duration} ms`);

      res.json(summary);
    } catch (error) {
      console.error("Get dashboard summary error:", error);
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

export default new DashboardController();