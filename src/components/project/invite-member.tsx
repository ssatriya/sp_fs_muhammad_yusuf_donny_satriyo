"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Send, UserPlus, Users } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { inviteMember, searchUsers } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { InviteMemberToProjectRespons } from "@/types";
import SettingHeading from "@/components/setting-heading";
import { Card, CardContent } from "@/components/ui/card";
import { ReactAsyncSelect } from "@/components/react-select";
import { inviteMemberToProject, InviteMemberToProject } from "@/schema/zod";
import { toast } from "sonner";

type Props = {
  projectId: string;
};

const InviteMember = ({ projectId }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const form = useForm<InviteMemberToProject>({
    resolver: zodResolver(inviteMemberToProject),
    defaultValues: {
      invitedUserId: "",
    },
  });

  const { mutate, isPending } = useMutation<
    InviteMemberToProjectRespons,
    Error,
    InviteMemberToProject
  >({
    mutationKey: ["invite-member", projectId],
    mutationFn: async (payload: InviteMemberToProject) =>
      await inviteMember(projectId, payload),
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Try again later.");
    },
    onSuccess: (data) => {
      toast.success(data.message);
      form.reset();
      setSelected(null);
    },
  });

  const onSubmit = (payload: InviteMemberToProject) => {
    mutate(payload);
  };

  return (
    <div>
      <SettingHeading
        title="Invite Member"
        description="Invite new member to the project and assign them to certain task"
      />
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Label
                    htmlFor="search-user"
                    className="text-base font-medium"
                  >
                    Search User
                  </Label>
                </div>
                <Controller
                  name="invitedUserId"
                  control={form.control}
                  render={({ field }) => (
                    <ReactAsyncSelect
                      loadOptions={() => searchUsers(searchQuery)}
                      inputId="search-user"
                      cacheOptions
                      isClearable
                      value={selected}
                      className="w-full"
                      onChange={(selected) => {
                        if (selected) {
                          field.onChange(selected.value as string);
                          setSelected({
                            value: selected.value as string,
                            label: selected.label as string,
                          });
                        } else {
                          form.resetField("invitedUserId");
                          setSelected(null);
                        }
                      }}
                      onInputChange={(val) => setSearchQuery(val)}
                      placeholder="Type name or email to search users..."
                    />
                  )}
                  rules={{ required: true }}
                />
                <p className="text-xs text-muted-foreground">
                  Search by name or email address to find existing users
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="pt-4">
            <Button
              type="submit"
              className="flex items-center gap-2"
              disabled={isPending || !form.formState.isDirty}
            >
              <Send className="h-4 w-4" />
              {isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </div>

          <Card className="bg-muted/50">
            <CardContent>
              <div className="flex items-start gap-3">
                <UserPlus className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">How invitations work</p>
                  <p className="text-xs text-muted-foreground">
                    The user will receive an invitation in their dashboard to
                    join this project. They can accept or decline the
                    invitation. You can only invite a user that already has an
                    account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default InviteMember;
