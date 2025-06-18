"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";

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
import { createTask, searchMemberInProject } from "@/lib/api";
import { CreateTaskResponse } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateTaskSchema, createTaskSchema } from "@/schema/zod";
import { ReactAsyncSelect } from "@/components/react-select";
import { TaskStatus } from "../../../generated/prisma";

type Props = {
  projectId: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const CreateTask = ({ projectId, isOpen, setIsOpen }: Props) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const form = useForm<CreateTaskSchema>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: TaskStatus.TODO,
      assigneeId: "",
    },
  });

  const { mutate, isPending } = useMutation<
    CreateTaskResponse,
    Error,
    CreateTaskSchema
  >({
    mutationKey: ["create-task", projectId],
    mutationFn: (payload: CreateTaskSchema) => createTask(projectId, payload),
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Try again later.");
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const onSubmit = async (payload: CreateTaskSchema) => {
    mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Enter task detail based on the provided field.
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
                    <Input placeholder="Enter task title" {...field} />
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
                          searchMemberInProject(projectId, searchQuery)
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
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Create Task
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTask;
