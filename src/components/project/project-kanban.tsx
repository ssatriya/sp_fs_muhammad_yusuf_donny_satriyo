"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/ui/shadcn-io/kanban";
import type { DragEndEvent } from "@/components/ui/shadcn-io/kanban";
import { getTasks, updateTaskStatus, deleteTaskById } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { TaskStatus } from "../../../generated/prisma";
import { Task, TaskWithAssignee } from "@/types";
import KanbanCardSkeleton from "@/components/ui/shadcn-io/kanban/kanban-card-skeleton";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useModalStore } from "@/store/modal-store";
import { toast } from "sonner";

const statuses = [
  { id: TaskStatus.TODO, name: "To Do", color: "#6B7280" },
  { id: TaskStatus.IN_PROGRESS, name: "In Progress", color: "#F59E0B" },
  { id: TaskStatus.DONE, name: "Done", color: "#10B981" },
];

type Props = {
  projectId: string;
};

const ProjectKanban = ({ projectId }: Props) => {
  const queryClient = useQueryClient();
  const { openEditTaskModal } = useModalStore();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => getTasks(projectId),
  });

  const { mutate: updateTask } = useMutation({
    mutationFn: async ({
      projectId,
      taskId,
      status,
    }: {
      projectId: string;
      taskId: string;
      status: TaskStatus;
    }) => updateTaskStatus(projectId, { taskId, status }),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", projectId] });

      const previousTasks = queryClient.getQueryData(["tasks", projectId]);

      queryClient.setQueryData(["tasks", projectId], (old: Task[] = []) =>
        old.map((task) => ({
          ...task,
          status: task.id === taskId ? status : task.status,
        }))
      );

      return { previousTasks };
    },
    onError: (err, vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", projectId], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  const { mutate: deleteTask } = useMutation({
    mutationFn: ({
      projectId,
      taskId,
    }: {
      projectId: string;
      taskId: string;
    }) => deleteTaskById(projectId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Task deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const newStatus = statuses.find((status) => status.id === over.id);
    if (!newStatus) return;

    if (active.data.current?.status !== newStatus.id) {
      updateTask({
        projectId,
        taskId: active.id as string,
        status: newStatus.id,
      });
    }
  };

  return (
    <KanbanProvider onDragEnd={handleDragEnd}>
      {statuses.map((status) => (
        <KanbanBoard key={status.id} id={status.id}>
          <KanbanHeader name={status.name} color={status.color} />
          <KanbanCards>
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <KanbanCardSkeleton key={`skeleton-${status.id}-${index}`} />
                ))
              : tasks
                  ?.filter((task) => task.status === status.id)
                  .map((task, index: number) => (
                    <KanbanCard
                      index={index}
                      key={task.id}
                      id={task.id}
                      name={task.title}
                      parent={status.id}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-2">
                          {task.description && (
                            <p className="m-0 text-muted-foreground text-xs line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          {task.assignee && (
                            <div className="flex items-center gap-1.5 text-xs mt-3">
                              <span className="text-muted-foreground">
                                Assigned to:
                              </span>
                              <span className="font-medium">
                                {task.assignee.name}
                              </span>
                              {task.assignee.email && (
                                <>
                                  <span className="text-muted-foreground">
                                    ·
                                  </span>
                                  <span className="text-muted-foreground truncate">
                                    {task.assignee.email}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <p className="m-0 text-muted-foreground text-xs">
                          {task.createdAt &&
                            formatDateTime(task.createdAt, {
                              timeFormatOptions: {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              },
                              timeSeparator: ", ",
                            })}
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={(e) => {
                                openEditTaskModal({
                                  taskId: task.id,
                                  projectId: task.projectId,
                                  title: task.title,
                                  status: task.status,
                                  description: task.description,
                                  assignee: {
                                    value: task.assignee?.id ?? null,
                                    label: task.assignee?.email ?? null,
                                  },
                                });
                              }}
                            >
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                              <span>Edit Task</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              className="flex items-center gap-2"
                              onClick={() =>
                                deleteTask({ projectId, taskId: task.id })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete Task</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </KanbanCard>
                  ))}
          </KanbanCards>
        </KanbanBoard>
      ))}
    </KanbanProvider>
  );
};

export default ProjectKanban;
