"use server";

import { prisma } from "@/lib/prisma";

export async function getProject(id: string) {
  try {
    const project = await prisma.projects.findFirst({
      where: { id },
    });
    return project;
  } catch (error) {
    throw new Error("Failed to fetch project");
  }
}
