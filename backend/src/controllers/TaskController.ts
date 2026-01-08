import { Request, Response } from "express";
import taskService from "../services/TaskService";
import logService from "../services/LogService";
import { TaskStatus } from "../models/Task";

export class TaskController {
  async getTasks(req: Request, res: Response) {
    const start = Date.now();
    const route = "/tasks";
    const method = "GET";

    try {
      const { status, search } = req.query;

      const filters: any = {};

      if (status) {
        filters.status = status as TaskStatus;
      }

      if (search) {
        filters.search = search as string;
      }

      const tasks = await taskService.getTasks(filters);
      
      const duration = Date.now() - start;
      await logService.logRequest(route, method, 200, duration);
      console.log(`[PERF] ${method} ${route} - ${duration} ms - ${tasks.length} tasks`);

      res.json(tasks);
    } catch (error) {
      console.error("Get tasks error:", error);
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

  async createTask(req: Request, res: Response) {
    const start = Date.now();
    const route = "/tasks";
    const method = "POST";

    try {
      const { name, description, status } = req.body;

      if (!name || name.trim().length === 0) {
        const duration = Date.now() - start;
        await logService.logRequest(
          route,
          method,
          400,
          duration,
          "Task name is required"
        );
        return res.status(400).json({ error: "Task name is required" });
      }

      if (name.length > 200) {
        const duration = Date.now() - start;
        await logService.logRequest(
          route,
          method,
          400,
          duration,
          "Task name is too long"
        );
        return res.status(400).json({ error: "Task name is too long" });
      }

      const validStatuses: TaskStatus[] = ["todo", "in_progress", "done"];
      if (status && !validStatuses.includes(status)) {
        const duration = Date.now() - start;
        await logService.logRequest(route, method, 400, duration, "Invalid status");
        return res.status(400).json({ error: "Invalid status" });
      }

      const task = await taskService.createTask({
        user_id: 1,
        name: name.trim(),
        description: description || "",
        status: status || "todo",
      });

      const duration = Date.now() - start;
      await logService.logRequest(route, method, 201, duration);
      console.log(`[PERF] ${method} ${route} - ${duration} ms`);

      res.status(201).json(task);
    } catch (error) {
      console.error("Create task error:", error);
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

  async updateTaskStatus(req: Request, res: Response) {
    const start = Date.now();
    const { id } = req.params;
    const route = `/tasks/${id}/status`;
    const method = "PATCH";

    try {
      const { status } = req.body;

      if (!status) {
        const duration = Date.now() - start;
        await logService.logRequest(
          route,
          method,
          400,
          duration,
          "Status is required"
        );
        return res.status(400).json({ error: "Status is required" });
      }

      const validStatuses: TaskStatus[] = ["todo", "in_progress", "done"];
      if (!validStatuses.includes(status)) {
        const duration = Date.now() - start;
        await logService.logRequest(route, method, 400, duration, "Invalid status");
        return res.status(400).json({ error: "Invalid status" });
      }

      const task = await taskService.updateTaskStatus(parseInt(id), status);

      if (!task) {
        const duration = Date.now() - start;
        await logService.logRequest(
          route,
          method,
          404,
          duration,
          "Task not found"
        );
        return res.status(404).json({ error: "Task not found" });
      }

      const duration = Date.now() - start;
      await logService.logRequest(route, method, 200, duration);
      console.log(`[PERF] ${method} ${route} - ${duration} ms`);

      res.json(task);
    } catch (error) {
      console.error("Update task status error:", error);
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

  async startTimer(req: Request, res: Response) {
    const start = Date.now();
    const { id } = req.params;
    const route = `/tasks/${id}/start`;
    const method = "POST";

    try {
      const task = await taskService.startTaskTimer(parseInt(id));
      
      const duration = Date.now() - start;
      await logService.logRequest(route, method, 200, duration);
      console.log(`[PERF] ${method} ${route} - ${duration} ms`);

      res.json(task);
    } catch (error: any) {
      console.error("Start timer error:", error);
      const duration = Date.now() - start;

      if (error.message === "Task not found") {
        await logService.logRequest(route, method, 404, duration, error.message);
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "Timer already running") {
        await logService.logRequest(route, method, 400, duration, error.message);
        return res.status(400).json({ error: error.message });
      }

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

  async stopTimer(req: Request, res: Response) {
    const start = Date.now();
    const { id } = req.params;
    const route = `/tasks/${id}/stop`;
    const method = "POST";

    try {
      const task = await taskService.stopTaskTimer(parseInt(id));
      
      const duration = Date.now() - start;
      await logService.logRequest(route, method, 200, duration);
      console.log(`[PERF] ${method} ${route} - ${duration} ms`);

      res.json(task);
    } catch (error: any) {
      console.error("Stop timer error:", error);
      const duration = Date.now() - start;

      if (error.message === "Task not found") {
        await logService.logRequest(route, method, 404, duration, error.message);
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "Timer not running") {
        await logService.logRequest(route, method, 400, duration, error.message);
        return res.status(400).json({ error: error.message });
      }

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

export default new TaskController();