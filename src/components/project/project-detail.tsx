"use client";

import { useState } from "react";
import { Plus, Settings2 } from "lucide-react";

import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import CreateTask from "@/components/task/create-task";
import Link from "next/link";
import ProjectKanban from "@/components/project/project-kanban";
import EditTask from "@/components/task/edit-task";
import { useModalStore } from "@/store/modal-store";

type Props = {
  initialProject: Project;
};

const ProjectDetail = ({ initialProject }: Props) => {
  const { openCreateTaskModal } = useModalStore();

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <div className="mb-8 space-y-0.5">
          <h2 className="text-xl font-semibold tracking-tight">
            {initialProject.name}
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg text-pretty">
            {initialProject.description}
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={openCreateTaskModal}>
            <Plus /> Add Task
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/projects/${initialProject.id}/settings`}>
              <Settings2 />
            </Link>
          </Button>
        </div>
      </div>
      <ProjectKanban projectId={initialProject.id} />
      <CreateTask projectId={initialProject.id} />
      <EditTask />
    </div>
  );
};

export default ProjectDetail;
