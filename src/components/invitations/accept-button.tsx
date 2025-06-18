"use client";

import { toast } from "sonner";
import { Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { acceptInvitation } from "@/lib/api";
import { Button } from "@/components/ui/button";

type Props = {
  invitationId: string;
};

const AcceptButton = ({ invitationId }: Props) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["accept-invitation", invitationId],
    mutationFn: async () => acceptInvitation(invitationId),
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Try again later..");
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["invitation-list"] });
    },
  });

  return (
    <Button
      size="sm"
      onClick={() => mutate()}
      className="flex items-center gap-1 flex-1"
      disabled={isPending}
    >
      <Check className="h-4 w-4" />
      Accept
    </Button>
  );
};

export default AcceptButton;
