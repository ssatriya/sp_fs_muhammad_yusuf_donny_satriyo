import { ZodIssue } from "zod";

import {
  Users,
  Projects,
  Memberships,
  Tasks,
  Invitations,
} from "../../generated/prisma";

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export type User = Users;

export type Project = Projects;

export type Membership = Memberships;

export type Task = Tasks;

export type Invitation = Invitations;

export type CreateProjectResponse = {
  message: string;
  data: Project;
};

export type EditProjectResponse = {
  message: string;
  data: Project;
};

export type CreateTaskResponse = {
  message: string;
  data: Task;
};

export type UpdateTaskResponse = {
  message: string;
  data: Task;
};

export type InviteMemberToProjectRespons = {
  message: string;
};

export type InvitationStatus = Invitation["status"];

export type InvitationWithProjectAndInviter = Invitation & {
  project: Project;
  inviter: User;
};

export type TaskWithAssignee = Task & {
  assignee: User | null;
};

export type SelectOption = {
  value: string;
  label: string;
};

export type FormatDateTimeOptions = {
  locale?: string;
  dateFormatOptions?: Intl.DateTimeFormatOptions;
  timeFormatOptions?: Intl.DateTimeFormatOptions;
  timeSeparator?: string;
};

export type ApiErrorType =
  | "validation_error"
  | "unauthorized"
  | "not_found"
  | "forbidden"
  | "internal_server_error"
  | "custom";

// Generic interface for API error response
export interface ApiErrorResponse {
  success: false;
  type: ApiErrorType;
  error: {
    message: string;
    fields?: Pick<ZodIssue, "path" | "message">[];
  };
}

// export type User = {
//   id: string;
//   name: string;
//   email: string;
//   emailVerified: boolean;
//   image: string | null;
//   createdAt: Date;
//   updatedAt: Date;
// };

// export type Project = {
//   id: string;
//   name: string;
//   description: string | null;
//   ownerId: string;
//   createdAt: Date;
//   updatedAt: Date;
// };

// export type Membership = {
//   id: string;
//   userId: string;
//   projectId: string;
//   role: string;
//   createdAt: Date;
//   updatedAt: Date;
// };

// export type Task = {
//   id: string;
//   title: string;
//   description: string | null;
//   status: "TODO" | "IN_PROGRESS" | "DONE";
//   priority: "LOW" | "MEDIUM" | "HIGH";
//   projectId: string;
//   assignedId: string | null;
//   createdAt: Date;
//   updatedAt: Date;
// };
