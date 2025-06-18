"use client";

import AcceptButton from "@/components/invitations/accept-button";
import DeclineButton from "@/components/invitations/decline-button";
import SettingHeading from "@/components/setting-heading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatDateTime, isExpired } from "@/lib/utils";
import {
  Invitation,
  InvitationStatus,
  InvitationWithProjectAndInviter,
  Project,
  User,
} from "@/types";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Mail,
  X,
  XCircle,
} from "lucide-react";

type Props = {
  invitation: InvitationWithProjectAndInviter;
};

const InvitationCard = ({ invitation }: Props) => {
  return (
    <Card className="gap-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{invitation.project.name}</CardTitle>
            <CardDescription className="text-pretty">
              {invitation.project.description}
            </CardDescription>
          </div>
          {getStatusBadge(invitation.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={invitation.inviter.name} alt="alt" />
            <AvatarFallback>
              {invitation.inviter.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{invitation.inviter.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {invitation.inviter.email}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Invited:{" "}
            {formatDateTime(invitation.createdAt, {
              timeFormatOptions: {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              },
              timeSeparator: ", ",
            })}
          </div>
          <div
            className={cn(
              "flex items-center gap-1",
              isExpired(invitation.expiresAt) && "text-red-500"
            )}
          >
            <Clock className="h-3 w-3" />
            Expires:{" "}
            {formatDateTime(invitation.expiresAt, {
              timeFormatOptions: {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              },
              timeSeparator: ", ",
            })}
          </div>
        </div>
        {invitation.status === "PENDING" &&
          !isExpired(invitation.expiresAt) && (
            <div className="flex items-center gap-2 pt-2">
              <AcceptButton invitationId={invitation.id} />
              <DeclineButton invitationId={invitation.id} />
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default InvitationCard;

const getStatusBadge = (status: InvitationStatus) => {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case "ACCEPTED":
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Accepted
        </Badge>
      );
    case "DECLINED":
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Declined
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Expired
        </Badge>
      );
    default:
      return null;
  }
};
