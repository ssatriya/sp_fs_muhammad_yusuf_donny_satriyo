import PageLayout from "@/components/page-layout";
import { BreadcrumbItem } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
];

export default function DashboardPage() {
  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"></div>
    </PageLayout>
  );
}
