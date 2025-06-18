"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { searchMemberInProject, updateTask } from "@/lib/api";
import { UpdateTaskResponse } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateTaskSchema, UpdateTaskSchema } from "@/schema/zod";
import { ReactAsyncSelect } from "@/components/react-select";
import { useModalStore } from "@/store/modal-store";
import { TaskStatus } from "../../../generated/prisma";

const EditTask = () => {
  const queryClient = useQueryClient();
  const { isEditTaskModalOpen, closeEditTaskModal, taskData } = useModalStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const form = useForm<UpdateTaskSchema>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      id: "",
      title: "",
      description: "",
      status: undefined,
      assigneeId: "",
    },
  });

  //   Using useEffect to set default value due to timing when modal open and
  //   projectData availability. If assigning directly inside useForm hooks
  //   the default values will not be applied.
  useEffect(() => {
    if (!taskData) return;

    form.reset({
      id: taskData.taskId,
      title: taskData.title,
      description: taskData.description || "",
      status: taskData.status,
      assigneeId: taskData.assignee?.value || "",
    });

    if (taskData.assignee?.value && taskData.assignee?.label) {
      setSelected({
        value: taskData.assignee.value,
        label: taskData.assignee.label,
      });
    }
  }, [taskData, form]);

  const { mutate, isPending } = useMutation<
    UpdateTaskResponse,
    Error,
    UpdateTaskSchema
  >({
    mutationKey: ["create-task", taskData?.projectId],
    mutationFn: (payload: UpdateTaskSchema) =>
      updateTask(taskData!.projectId, payload),
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Try again later.");
    },
    onSuccess: (data) => {
      toast.success(data.message);
      closeEditTaskModal();
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const onSubmit = async (payload: UpdateTaskSchema) => {
    mutate(payload);
  };

  return (
    <Dialog
      open={isEditTaskModalOpen}
      onOpenChange={(open) => {
        if (!open) closeEditTaskModal();
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task detail based on the project requirement.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter task title"
                      {...field}
                      onFocus={(e) => {
                        // This is to unblock the text when modal open and this input being focus
                        // Without this input text will be block for some reason
                        const target = e.target as HTMLInputElement;
                        setTimeout(() => {
                          target.setSelectionRange(
                            target.value.length,
                            target.value.length
                          );
                        }, 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select task status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TaskStatus.TODO}>TODO</SelectItem>
                          <SelectItem value={TaskStatus.IN_PROGRESS}>
                            IN PROGRESS
                          </SelectItem>
                          <SelectItem value={TaskStatus.DONE}>DONE</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to</FormLabel>
                    <FormControl>
                      <ReactAsyncSelect
                        loadOptions={() =>
                          searchMemberInProject(
                            taskData!.projectId,
                            searchQuery
                          )
                        }
                        inputId="search-user"
                        cacheOptions
                        isClearable
                        value={selected}
                        className="w-full"
                        onChange={(selected) => {
                          if (selected) {
                            field.onChange(selected.value as string);
                            setSelected({
                              value: selected.value as string,
                              label: selected.label as string,
                            });
                          } else {
                            form.resetField("assigneeId");
                            setSelected(null);
                          }
                        }}
                        onInputChange={(val) => setSearchQuery(val)}
                        placeholder="Type member name or email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditTaskModal}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Update Task
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTask;
