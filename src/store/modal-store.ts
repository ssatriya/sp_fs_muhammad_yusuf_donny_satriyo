import { create } from "zustand";
import { TaskStatus } from "../../generated/prisma";

type ProjectData = {
  id: string;
  name: string;
  description: string;
};

type TaskData = {
  projectId: string;
  taskId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignee: {
    value: string | null;
    label: string | null;
  };
};

type ModalState = {
  // Project Create
  isCreateProjectModalOpen: boolean;
  openCreateProjectModal: () => void;
  closeCreateProjectModal: () => void;

  // Project Edit
  isEditProjectModalOpen: boolean;
  projectData: ProjectData | null;
  openEditProjectModal: (data: ProjectData) => void;
  closeEditProjectModal: () => void;

  // Task Create
  isCreateTaskModalOpen: boolean;
  openCreateTaskModal: () => void;
  closeCreateTaskModal: () => void;

  // Task Edit
  isEditTaskModalOpen: boolean;
  taskData: TaskData | null;
  openEditTaskModal: (data: TaskData) => void;
  closeEditTaskModal: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
  // Project Create
  isCreateProjectModalOpen: false,
  openCreateProjectModal: () => set({ isCreateProjectModalOpen: true }),
  closeCreateProjectModal: () => set({ isCreateProjectModalOpen: false }),

  // Project Edit
  isEditProjectModalOpen: false,
  projectData: null,
  openEditProjectModal: (data) =>
    set({
      isEditProjectModalOpen: true,
      projectData: data,
    }),
  closeEditProjectModal: () =>
    set({
      isEditProjectModalOpen: false,
      projectData: null,
    }),

  // Task Create
  isCreateTaskModalOpen: false,
  openCreateTaskModal: () => set({ isCreateTaskModalOpen: true }),
  closeCreateTaskModal: () => set({ isCreateTaskModalOpen: false }),

  // Task Edit
  isEditTaskModalOpen: false,
  taskData: null,
  openEditTaskModal: (data) =>
    set({
      isEditTaskModalOpen: true,
      taskData: data,
    }),
  closeEditTaskModal: () =>
    set({
      isEditTaskModalOpen: false,
      taskData: null,
    }),
}));
