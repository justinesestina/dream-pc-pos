/**
 * Projects & Tasks API routes.
 *
 * GET    /api/v1/projects              — list all projects
 * GET    /api/v1/projects/:id          — get single project
 * POST   /api/v1/projects              — create project
 * PUT    /api/v1/projects/:id          — update project
 * DELETE /api/v1/projects/:id          — delete project
 * GET    /api/v1/projects/tasks        — list all tasks
 * GET    /api/v1/projects/tasks/by-project/:name — tasks for project
 * POST   /api/v1/projects/tasks        — create task
 * PUT    /api/v1/projects/tasks/:id    — update task (cycle status, edit)
 * DELETE /api/v1/projects/tasks/:id    — delete task
 */
import { Hono } from "hono";
import { requireAuth, type AppVars } from "../middleware/auth.js";
import { ok, ApiError } from "../lib/errors.js";
import { projectStore, taskStore } from "../lib/project-store.js";
import type { ProjectDto, TaskDto } from "../lib/project-store.js";

export function projectsRoutes() {
  const app = new Hono<{ Variables: AppVars }>();

  /* ═══ PROJECTS ═══ */

  /** List all projects (with task counts). */
  app.get("/", requireAuth, async (c) => {
    const projects = await projectStore.list();
    return c.json(ok(projects, { total: projects.length }));
  });

  /** Get a single project. */
  app.get("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    // Guard: don't match "tasks" as a project id
    if (id === "tasks") return c.notFound();
    try {
      const project = await projectStore.get(id);
      return c.json(ok(project));
    } catch {
      throw new ApiError(404, "NOT_FOUND", `Project ${id} not found`);
    }
  });

  /** Create a project. */
  app.post("/", requireAuth, async (c) => {
    const body = await c.req.json<Partial<ProjectDto>>();
    if (!body.name?.trim()) {
      throw new ApiError(422, "VALIDATION", "Project name is required");
    }
    if (!body.startDate || !body.due) {
      throw new ApiError(422, "VALIDATION", "Start date and due date are required");
    }
    const project = await projectStore.create({
      ...body,
      status: body.status || "planning",
    });
    return c.json(ok(project), 201);
  });

  /** Update a project. */
  app.put("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json<Partial<ProjectDto>>();
    try {
      const project = await projectStore.update(id, body);
      return c.json(ok(project));
    } catch {
      throw new ApiError(404, "NOT_FOUND", `Project ${id} not found`);
    }
  });

  /** Delete a project. */
  app.delete("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    try {
      await projectStore.delete(id);
      return c.json({ success: true });
    } catch {
      throw new ApiError(404, "NOT_FOUND", `Project ${id} not found`);
    }
  });

  /* ═══ TASKS ═══ */

  /** List all tasks. */
  app.get("/tasks", requireAuth, async (c) => {
    const tasks = await taskStore.list();
    return c.json(ok(tasks, { total: tasks.length }));
  });

  /** List tasks for a specific project (by project name). */
  app.get("/tasks/by-project/:name", requireAuth, async (c) => {
    const name = decodeURIComponent(c.req.param("name"));
    const tasks = await taskStore.listByProject(name);
    return c.json(ok(tasks, { total: tasks.length }));
  });

  /** Create a task. */
  app.post("/tasks", requireAuth, async (c) => {
    const body = await c.req.json<Partial<TaskDto>>();
    if (!body.title?.trim()) {
      throw new ApiError(422, "VALIDATION", "Task title is required");
    }
    if (!body.project?.trim()) {
      throw new ApiError(422, "VALIDATION", "Task must belong to a project");
    }
    const task = await taskStore.create({
      ...body,
      status: body.status || "todo",
    });
    return c.json(ok(task), 201);
  });

  /** Update a task (status cycle, edit fields). */
  app.put("/tasks/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json<Partial<TaskDto>>();
    try {
      const task = await taskStore.update(id, body);
      return c.json(ok(task));
    } catch {
      throw new ApiError(404, "NOT_FOUND", `Task ${id} not found`);
    }
  });

  /** Delete a task. */
  app.delete("/tasks/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    try {
      await taskStore.delete(id);
      return c.json({ success: true });
    } catch {
      throw new ApiError(404, "NOT_FOUND", `Task ${id} not found`);
    }
  });

  return app;
}
