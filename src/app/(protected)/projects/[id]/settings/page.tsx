import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { BreadcrumbItem } from "@/types";
import PageLayout from "@/components/page-layout";
import ProjectSettings from "@/components/project/project-settings";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const initialProject = await prisma.projects.findFirst({
    where: {
      id: id,
    },
    include: {
      tasks: true,
    },
  });

  if (!initialProject) {
    return redirect("/projects");
  }

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: "Projects",
      href: "/projects",
    },
    {
      title: initialProject.name,
      href: `/projects/${initialProject.id}`,
    },
    {
      title: "Settings",
      href: `/projects/${initialProject.id}/settings`,
    },
  ];

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      <ProjectSettings projectId={id} />
    </PageLayout>
  );
}
