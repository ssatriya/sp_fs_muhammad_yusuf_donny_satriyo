"use client";

import { Bell, BellDotIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { hasPendingInvitation } from "@/lib/api";
import Link from "next/link";

type Props = {
  initialData: boolean;
};

const InvitationNotification = ({ initialData }: Props) => {
  const { data } = useQuery({
    queryKey: ["has-pending-invitation"],
    queryFn: async () => hasPendingInvitation(),
    initialData: {
      hasPendingInvitation: initialData,
    },
  });

  return (
    <div className="px-4">
      <Button variant="ghost" size="sm">
        {data.hasPendingInvitation ? (
          <Link href="/invitations">
            <BellDotIcon />
          </Link>
        ) : (
          <Bell />
        )}
      </Button>
    </div>
  );
};

export default InvitationNotification;
