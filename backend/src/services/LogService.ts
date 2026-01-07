import pool from "../config/database";
import logger from "../config/logger";

export class LogService {
  async logRequest(
    route: string,
    method: string,
    statusCode: number,
    durationMs: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      // Log dans Pino
      logger.info({
        route,
        method,
        status_code: statusCode,
        duration_ms: durationMs,
        error: errorMessage,
      });

      // Log dans la base de données
      await pool.query(
        "INSERT INTO request_logs (route, method, status_code, duration_ms, error_message) VALUES ($1, $2, $3, $4, $5)",
        [route, method, statusCode, durationMs, errorMessage || null]
      );
    } catch (error) {
      console.error("Error inserting request_log:", error);
    }
  }
}

export default new LogService();