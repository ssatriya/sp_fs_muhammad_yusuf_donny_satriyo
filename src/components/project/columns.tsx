"use client";

import Link from "next/link";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/store/modal-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProjectById } from "@/lib/api";
import { toast } from "sonner";

export const columns: ColumnDef<Project>[] = [
  {
    id: "rowNumber",
    header: "#",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
    size: 40,
  },
  {
    accessorKey: "name",
    header: "Name",
    size: 150,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <p className="truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px]">
        {row.original.description}
      </p>
    ),
    minSize: 200,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id;
      const name = row.original.name;
      const description = row.original.description;
      const { openEditProjectModal } = useModalStore();
      const queryClient = useQueryClient();

      const { mutate: deleteProject } = useMutation({
        mutationFn: async (id: string) => deleteProjectById(id),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["project-list"] });
          toast.success("Project and all its tasks deleted successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete project");
        },
      });

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link
                  href={`/projects/${id}`}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>View Details</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => openEditProjectModal({ id, name, description })}
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
                <span>Edit Project</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="flex items-center gap-2"
                onClick={() => deleteProject(id)}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    size: 80,
    meta: {
      className: "text-right",
    },
    enableResizing: false,
  },
];
