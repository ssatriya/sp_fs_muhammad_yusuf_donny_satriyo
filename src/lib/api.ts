import kyInstance from "@/lib/ky";
import {
  CreateProjectResponse,
  CreateTaskResponse,
  EditProjectResponse,
  Invitation,
  InvitationWithProjectAndInviter,
  InviteMemberToProjectRespons,
  Project,
  SelectOption,
  Task,
  TaskWithAssignee,
  UpdateTaskResponse,
} from "@/types";
import { TaskStatus } from "../../generated/prisma";
import {
  CreateTaskSchema,
  EditProjectSchema,
  UpdateTaskSchema,
  UpdateTaskStatusSchema,
} from "@/schema/zod";

export async function getProjects(): Promise<Project[]> {
  return kyInstance.get("/api/projects").json();
}

export async function getProject(id: string): Promise<Project> {
  const response = await fetch(`/api/projects/${id}`);
  if (!response.ok) throw new Error("Failed to fetch project");
  return response.json();
}

export async function createProject(payload: {
  name: string;
}): Promise<CreateProjectResponse> {
  return kyInstance.post("/api/projects", { json: payload }).json();
}

export async function deleteProjectById(
  projectId: string
): Promise<{ message: string }> {
  return kyInstance.delete("/api/projects", { json: projectId }).json();
}

export async function inviteMember(
  projectId: string,
  payload: {
    invitedUserId: string;
  }
): Promise<InviteMemberToProjectRespons> {
  return kyInstance
    .post(`/api/projects/${projectId}/invite`, {
      json: payload,
    })
    .json();
}

export async function getInvitations(): Promise<
  InvitationWithProjectAndInviter[]
> {
  return kyInstance.get("/api/invitations").json();
}

export async function hasPendingInvitation(): Promise<{
  hasPendingInvitation: boolean;
}> {
  return await kyInstance.get("/api/invitations/pending").json();
}

export async function acceptInvitation(
  invitationId: string
): Promise<{ message: string }> {
  return await kyInstance
    .post(`/api/invitations/${invitationId}/accept`)
    .json();
}

export async function declineInvitation(
  invitationId: string
): Promise<{ message: string }> {
  return await kyInstance
    .post(`/api/invitations/${invitationId}/decline`)
    .json();
}

export async function getTasks(projectId: string): Promise<TaskWithAssignee[]> {
  return kyInstance.get(`/api/projects/${projectId}/tasks`).json();
}

export async function createTask(
  projectId: string,
  payload: CreateTaskSchema
): Promise<CreateTaskResponse> {
  return kyInstance
    .post(`/api/projects/${projectId}/tasks`, { json: payload })
    .json();
}

export async function updateTaskStatus(
  projectId: string,
  payload: UpdateTaskStatusSchema
) {
  return await kyInstance.patch(`/api/projects/${projectId}/tasks/status`, {
    json: payload,
  });
}

export async function updateTask(
  projectId: string,
  payload: UpdateTaskSchema
): Promise<UpdateTaskResponse> {
  return await kyInstance
    .patch(`/api/projects/${projectId}/tasks`, {
      json: payload,
    })
    .json();
}

export async function deleteTaskById(
  projectId: string,
  taskId: string
): Promise<{ message: string }> {
  return await kyInstance
    .delete(`/api/projects/${projectId}/tasks`, {
      json: taskId,
    })
    .json();
}

export async function searchUsers(query: string): Promise<SelectOption[]> {
  return kyInstance
    .get(`/api/users/search?q=${encodeURIComponent(query)}`)
    .json();
}

export async function searchMemberInProject(
  projectId: string,
  query: string
): Promise<SelectOption[]> {
  return await kyInstance
    .get(`/api/projects/${projectId}/assign?q=${encodeURIComponent(query)}`)
    .json();
}

export async function updateProject(
  payload: EditProjectSchema
): Promise<EditProjectResponse> {
  return kyInstance
    .patch("/api/projects", {
      json: payload,
    })
    .json();
}
