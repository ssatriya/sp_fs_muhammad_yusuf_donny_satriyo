"use client";

import { DataTable } from "@/components/data-table";
import { columns } from "@/components/project/columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProjects } from "@/lib/api";
import { useModalStore } from "@/store/modal-store";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";

const ProjectList = () => {
  const { openCreateProjectModal } = useModalStore();

  const { data, isLoading } = useQuery({
    queryKey: ["project-list"],
    queryFn: async () => getProjects(),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between">
        <Input className="max-w-lg" />
        <Button onClick={() => openCreateProjectModal()}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
      {isLoading && <Loader2 className="animate-spin" />}
      {data && <DataTable columns={columns} data={data} />}
    </div>
  );
};

export default ProjectList;
