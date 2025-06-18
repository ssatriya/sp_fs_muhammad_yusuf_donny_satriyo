import InvitationList from "@/components/invitations/invitation-list";
import PageLayout from "@/components/page-layout";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  BreadcrumbItem,
  Invitation,
  InvitationWithProjectAndInviter,
  Project,
  User,
} from "@/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Invitations",
    href: "/invitations",
  },
];

export default async function InvitationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  const invitations: Awaited<InvitationWithProjectAndInviter[] | null> =
    await prisma.invitations.findMany({
      where: {
        invitedUserId: session.user.id,
      },
      include: {
        project: true,
        inviter: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      <InvitationList initialData={invitations} />
    </PageLayout>
  );
}
