"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createProject } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreateProjectResponse } from "@/types";
import { CreateProjectSchema, createProjectSchema } from "@/schema/zod";
import { Textarea } from "@/components/ui/textarea";
import { useModalStore } from "@/store/modal-store";

const CreateProject = () => {
  const queryClient = useQueryClient();
  const { isCreateProjectModalOpen, closeCreateProjectModal } = useModalStore();

  const form = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { mutate, isPending } = useMutation<
    CreateProjectResponse,
    Error,
    CreateProjectSchema
  >({
    mutationKey: ["create-project"],
    mutationFn: (payload: CreateProjectSchema) => createProject(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-list"] });
      toast.success(data.message);
      closeCreateProjectModal();
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Try again later.");
    },
  });

  const onSubmit = async (payload: CreateProjectSchema) => {
    mutate(payload);
  };

  return (
    <Dialog
      open={isCreateProjectModalOpen}
      onOpenChange={(open) => {
        if (!open) closeCreateProjectModal();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Enter you new project name in the provided field below. It should be
            unique name or not been used before.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
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
                    <Textarea
                      placeholder="Enter project description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeCreateProjectModal}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Create Project
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProject;
