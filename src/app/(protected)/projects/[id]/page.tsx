import { getProject } from "@/action/project";
import PageLayout from "@/components/page-layout";
import ProjectDetail from "@/components/project/project-detail";
import { BreadcrumbItem } from "@/types";
import { redirect } from "next/navigation";

export default async function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const initialProject = await getProject(id);

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
  ];

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      <ProjectDetail initialProject={initialProject} />
    </PageLayout>
  );
}
