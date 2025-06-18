import PageLayout from "@/components/page-layout";
import CreateProject from "@/components/project/create-project";
import EditProject from "@/components/project/edit-project";
import ProjectList from "@/components/project/project-list";
import { BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Projects",
    href: "/projects",
  },
];

export default function ProjectsPage() {
  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      <ProjectList />
      <CreateProject />
      <EditProject />
    </PageLayout>
  );
}
