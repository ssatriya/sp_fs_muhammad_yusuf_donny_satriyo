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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createProject, updateProject } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EditProjectResponse } from "@/types";
import { EditProjectSchema, editProjectSchema } from "@/schema/zod";
import { Textarea } from "@/components/ui/textarea";
import { useModalStore } from "@/store/modal-store";
import { useEffect } from "react";

const EditProject = () => {
  const queryClient = useQueryClient();
  const { isEditProjectModalOpen, closeEditProjectModal, projectData } =
    useModalStore();

  const form = useForm<EditProjectSchema>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
    },
  });

  //   Using useEffect to set default value due to timing when modal open and
  //   projectData availability. If assigning directly inside useForm hooks
  //   the default values will not be applied.
  useEffect(() => {
    if (projectData) {
      form.setValue("id", projectData.id);
      form.setValue("name", projectData.name);
      form.setValue("description", projectData.description);
    }
  }, [projectData]);

  const { mutate, isPending } = useMutation<
    EditProjectResponse,
    Error,
    EditProjectSchema
  >({
    mutationKey: ["edit-project"],
    mutationFn: (payload: EditProjectSchema) => updateProject(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project-list"] });
      toast.success(data.message);
      closeEditProjectModal();
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Try again later.");
    },
  });

  const onSubmit = async (payload: EditProjectSchema) => {
    mutate(payload);
  };

  return (
    <Dialog
      open={isEditProjectModalOpen}
      onOpenChange={(open) => {
        if (!open) closeEditProjectModal();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
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
                    <Input
                      placeholder="Enter project name"
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
                onClick={closeEditProjectModal}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Update Project
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProject;
