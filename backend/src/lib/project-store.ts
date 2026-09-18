/**
 * Project store — WooCommerce-backed (same pattern as warehouse-store.ts).
 *
 * Each project is persisted as a WC order tagged `_dpc_record = "project"`.
 * Each task is persisted as a WC order tagged `_dpc_record = "project_task"`.
 * This way data survives serverless cold-starts on Vercel.
 */
import { woocommerce, type WcOrder, type WcMetaDatum } from "./woocommerce.js";

export const RECORD_KEY = "_dpc_record";

/* ─── Project meta keys ─── */
const P = {
  name: "_dpc_prj_name",
  customer: "_dpc_prj_customer",
  customerType: "_dpc_prj_customer_type",
  status: "_dpc_prj_status",
  startDate: "_dpc_prj_start_date",
  due: "_dpc_prj_due",
  owner: "_dpc_prj_owner",
  description: "_dpc_prj_description",
  scope: "_dpc_prj_scope",
  members: "_dpc_prj_members",       // JSON stringified array
  value: "_dpc_prj_value",
};

/* ─── Task meta keys ─── */
const T = {
  title: "_dpc_tsk_title",
  project: "_dpc_tsk_project",        // project name (foreign key)
  projectId: "_dpc_tsk_project_id",   // project WC order id
  assignee: "_dpc_tsk_assignee",
  status: "_dpc_tsk_status",
  due: "_dpc_tsk_due",
  duration: "_dpc_tsk_duration",
};

/* ─── Helpers ─── */
function metaOf(order: WcOrder, key: string): unknown {
  return order.meta_data?.find((m: WcMetaDatum) => m.key === key)?.value;
}
function metaStr(order: WcOrder, key: string): string {
  const v = metaOf(order, key);
  return v === undefined || v === null ? "" : String(v);
}

/* ─── Type definitions (backend mirror) ─── */
export type ProjectStatus = "planning" | "active" | "on_hold" | "completed";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface ProjectDto {
  id: string;
  name: string;
  customer: string;
  customerType: string;
  status: ProjectStatus;
  startDate: string;
  due: string;
  owner: string;
  description: string;
  scope: string;
  members: string[];
  value: number;
  tasks: number;   // computed
  done: number;    // computed
}

export interface TaskDto {
  id: string;
  title: string;
  project: string;
  projectId: string;
  assignee: string;
  status: TaskStatus;
  due: string;
  duration: string;
}

/* ─── Order → DTO mapping ─── */
function mapOrderToProject(order: WcOrder, taskCount = 0, doneCount = 0): ProjectDto {
  const rawStatus = metaStr(order, P.status) as ProjectStatus;
  const status: ProjectStatus = ["planning", "active", "on_hold", "completed"].includes(rawStatus) ? rawStatus : "planning";
  let members: string[] = [];
  try {
    const raw = metaOf(order, P.members);
    if (typeof raw === "string" && raw.startsWith("[")) members = JSON.parse(raw);
    else if (typeof raw === "string" && raw) members = raw.split(",").map((s) => s.trim());
  } catch { /* ignore parse errors */ }

  return {
    id: `PRJ-${order.id}`,
    name: metaStr(order, P.name) || `Project ${order.id}`,
    customer: metaStr(order, P.customer),
    customerType: metaStr(order, P.customerType) || "walk-in",
    status,
    startDate: metaStr(order, P.startDate),
    due: metaStr(order, P.due),
    owner: metaStr(order, P.owner),
    description: metaStr(order, P.description),
    scope: metaStr(order, P.scope),
    members,
    value: Number(metaOf(order, P.value)) || 0,
    tasks: taskCount,
    done: doneCount,
  };
}

function mapOrderToTask(order: WcOrder): TaskDto {
  const rawStatus = metaStr(order, T.status) as TaskStatus;
  const status: TaskStatus = ["todo", "in_progress", "done"].includes(rawStatus) ? rawStatus : "todo";
  return {
    id: `TSK-${order.id}`,
    title: metaStr(order, T.title) || `Task ${order.id}`,
    project: metaStr(order, T.project),
    projectId: metaStr(order, T.projectId),
    assignee: metaStr(order, T.assignee),
    status,
    due: metaStr(order, T.due),
    duration: metaStr(order, T.duration),
  };
}

/* ─── DTO → WC meta mapping ─── */
function projectToMeta(input: Partial<ProjectDto>): WcMetaDatum[] {
  const meta: WcMetaDatum[] = [{ key: RECORD_KEY, value: "project" }];
  const push = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    meta.push({ key, value: value as string | number | boolean });
  };
  push(P.name, input.name);
  push(P.customer, input.customer);
  push(P.customerType, input.customerType);
  push(P.status, input.status);
  push(P.startDate, input.startDate);
  push(P.due, input.due);
  push(P.owner, input.owner);
  push(P.description, input.description);
  push(P.scope, input.scope);
  if (input.members) push(P.members, JSON.stringify(input.members));
  push(P.value, input.value);
  return meta;
}

function taskToMeta(input: Partial<TaskDto>): WcMetaDatum[] {
  const meta: WcMetaDatum[] = [{ key: RECORD_KEY, value: "project_task" }];
  const push = (key: string, value: unknown) => {
    if (value === undefined || value === null) return;
    meta.push({ key, value: value as string | number | boolean });
  };
  push(T.title, input.title);
  push(T.project, input.project);
  push(T.projectId, input.projectId);
  push(T.assignee, input.assignee);
  push(T.status, input.status);
  push(T.due, input.due);
  push(T.duration, input.duration);
  return meta;
}

function wcIdFromProjectId(id: string): number {
  const n = Number(id.startsWith("PRJ-") ? id.slice(4) : id);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid project id: ${id}`);
  return n;
}
function wcIdFromTaskId(id: string): number {
  const n = Number(id.startsWith("TSK-") ? id.slice(4) : id);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid task id: ${id}`);
  return n;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PROJECT CRUD
   ═══════════════════════════════════════════════════════════════════════════════ */

export const projectStore = {
  /** Fetch all projects with task counts computed. */
  async list(): Promise<ProjectDto[]> {
    const allOrders = await woocommerce.ordersAll();
    const projectOrders = allOrders.filter((o) => metaOf(o, RECORD_KEY) === "project");
    const taskOrders = allOrders.filter((o) => metaOf(o, RECORD_KEY) === "project_task");

    return projectOrders.map((po) => {
      const projectName = metaStr(po, P.name);
      const pTasks = taskOrders.filter((to) => metaStr(to, T.project) === projectName);
      const doneCount = pTasks.filter((to) => metaStr(to, T.status) === "done").length;
      return mapOrderToProject(po, pTasks.length, doneCount);
    });
  },

  /** Fetch a single project by id. */
  async get(id: string): Promise<ProjectDto> {
    const wcId = wcIdFromProjectId(id);
    const order = await woocommerce.order(wcId);
    // Fetch tasks for this project
    const allOrders = await woocommerce.ordersAll();
    const projectName = metaStr(order, P.name);
    const taskOrders = allOrders.filter(
      (o) => metaOf(o, RECORD_KEY) === "project_task" && metaStr(o, T.project) === projectName,
    );
    const doneCount = taskOrders.filter((o) => metaStr(o, T.status) === "done").length;
    return mapOrderToProject(order, taskOrders.length, doneCount);
  },

  /** Create a new project. */
  async create(input: Partial<ProjectDto>): Promise<ProjectDto> {
    const meta = projectToMeta(input);
    const order = await woocommerce.createOrder({
      status: "pending",
      meta_data: meta,
    });
    return mapOrderToProject(order);
  },

  /** Update an existing project. */
  async update(id: string, input: Partial<ProjectDto>): Promise<ProjectDto> {
    const wcId = wcIdFromProjectId(id);
    const meta = projectToMeta(input);
    const order = await woocommerce.updateOrder(wcId, { meta_data: meta });
    return mapOrderToProject(order);
  },

  /** Delete a project. */
  async delete(id: string): Promise<void> {
    const wcId = wcIdFromProjectId(id);
    await woocommerce.deleteOrder(wcId);
  },
};

/* ═══════════════════════════════════════════════════════════════════════════════
   TASK CRUD
   ═══════════════════════════════════════════════════════════════════════════════ */

export const taskStore = {
  /** Fetch all tasks. */
  async list(): Promise<TaskDto[]> {
    const allOrders = await woocommerce.ordersAll();
    return allOrders
      .filter((o) => metaOf(o, RECORD_KEY) === "project_task")
      .map(mapOrderToTask);
  },

  /** Fetch tasks for a specific project name. */
  async listByProject(projectName: string): Promise<TaskDto[]> {
    const allOrders = await woocommerce.ordersAll();
    return allOrders
      .filter(
        (o) => metaOf(o, RECORD_KEY) === "project_task" && metaStr(o, T.project) === projectName,
      )
      .map(mapOrderToTask);
  },

  /** Create a new task. */
  async create(input: Partial<TaskDto>): Promise<TaskDto> {
    const meta = taskToMeta(input);
    const order = await woocommerce.createOrder({
      status: "pending",
      meta_data: meta,
    });
    return mapOrderToTask(order);
  },

  /** Update a task (e.g. cycle status). */
  async update(id: string, input: Partial<TaskDto>): Promise<TaskDto> {
    const wcId = wcIdFromTaskId(id);
    const meta = taskToMeta(input);
    const order = await woocommerce.updateOrder(wcId, { meta_data: meta });
    return mapOrderToTask(order);
  },

  /** Delete a task. */
  async delete(id: string): Promise<void> {
    const wcId = wcIdFromTaskId(id);
    await woocommerce.deleteOrder(wcId);
  },
};
