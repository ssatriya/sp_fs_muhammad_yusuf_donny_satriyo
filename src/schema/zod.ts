import { z } from "zod";
import { TaskStatus } from "../../generated/prisma";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project description can't be mora than 100 characters"),
  description: z
    .string()
    .min(1, "Project description is required")
    .max(200, "Project description can't be mora than 200 characters"),
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;

export const editProjectSchema = z.object({
  id: z.string({ required_error: "Project id is required" }),
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project description can't be mora than 100 characters"),
  description: z
    .string()
    .min(1, "Project description is required")
    .max(200, "Project description can't be mora than 200 characters"),
});

export type EditProjectSchema = z.infer<typeof editProjectSchema>;

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task name is required")
    .max(100, "Task name can't be more than 100 characters"),
  description: z
    .string()
    .min(1, "Task description is required")
    .max(200, "Task can't be more than 200 characters"),
  status: z.nativeEnum(TaskStatus),
  assigneeId: z.string({
    required_error: "Task should be assigned to someone",
  }),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  id: z.string({ required_error: "Task id is required" }),
  title: z
    .string()
    .min(1, "Task name is required")
    .max(100, "Task name can't be more than 100 characters"),
  description: z
    .string()
    .min(1, "Task description is required")
    .max(200, "Task can't be more than 200 characters"),
  status: z.nativeEnum(TaskStatus),
  assigneeId: z.string({
    required_error: "Task should be assigned to someone",
  }),
});

export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;

export const inviteMemberToProject = z.object({
  invitedUserId: z.string({ required_error: "Invited user id is required" }),
});

export type InviteMemberToProject = z.infer<typeof inviteMemberToProject>;

export const updateTaskStatusSchema = z.object({
  taskId: z.string({ required_error: "Task id is required" }),
  status: z.nativeEnum(TaskStatus, {
    required_error: "Task status is required",
  }),
});

export type UpdateTaskStatusSchema = z.infer<typeof updateTaskStatusSchema>;
