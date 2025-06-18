"use client";

import { toast } from "sonner";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { declineInvitation } from "@/lib/api";
import { Button } from "@/components/ui/button";

type Props = {
  invitationId: string;
};

const DeclineButton = ({ invitationId }: Props) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["accept-invitation", invitationId],
    mutationFn: async () => declineInvitation(invitationId),
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
      variant="outline"
      onClick={() => mutate()}
      className="flex items-center gap-1 flex-1"
      disabled={isPending}
    >
      <X className="h-4 w-4" />
      Decline
    </Button>
  );
};

export default DeclineButton;
