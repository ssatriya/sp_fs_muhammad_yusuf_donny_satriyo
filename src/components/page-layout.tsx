import { PropsWithChildren } from "react";

import { BreadcrumbItem } from "@/types";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import InvitationNotification from "@/components/invitation-notification";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const PageLayout = async ({
  children,
  breadcrumbs,
}: PropsWithChildren<{ breadcrumbs: BreadcrumbItem[] }>) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login");
  }

  const hasPendingInvitation = await prisma.invitations.findFirst({
    where: {
      invitedUserId: session.user.id,
      status: "PENDING",
    },
    select: { id: true },
  });

  return (
    <>
      <header className="flex justify-between h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
        <InvitationNotification initialData={!!hasPendingInvitation} />
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="@container/main flex flex-1 flex-col gap-2">
          {children}
        </div>
      </div>
    </>
  );
};

export default PageLayout;
