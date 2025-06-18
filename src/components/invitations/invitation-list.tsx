"use client";

import { useQuery } from "@tanstack/react-query";

import { getInvitations } from "@/lib/api";
import { InvitationWithProjectAndInviter } from "@/types";
import InvitationCard from "@/components/invitations/invitation-card";
import SettingHeading from "@/components/setting-heading";

type Props = {
  initialData: InvitationWithProjectAndInviter[];
};

const InvitationList = ({ initialData }: Props) => {
  const { data } = useQuery({
    queryKey: ["invitation-list"],
    queryFn: async () => getInvitations(),
    initialData: initialData,
  });

  return (
    <div>
      <SettingHeading
        title="Invitation You Received"
        description="Manage all your invitation you receive, accept, decline or just leave until its expired"
      />
      <div className="space-y-4">
        {data.map((data) => (
          <InvitationCard key={data.id} invitation={data} />
        ))}
      </div>
    </div>
  );
};

export default InvitationList;
