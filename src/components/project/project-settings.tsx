"use client";

import { Trash2, Users2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import SettingHeading from "@/components/setting-heading";
import InviteMember from "@/components/project/invite-member";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  projectId: string;
};

const ProjectSettings = ({ projectId }: Props) => {
  return (
    <div>
      <div className="mb-8 space-y-0.5">
        <h2 className="text-xl font-semibold tracking-tight">
          Project Settings
        </h2>
        <p className="text-muted-foreground text-sm">
          Manage your project setting, invite member or delete project
        </p>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
        <Tabs defaultValue="invite-member" orientation="vertical">
          <div className="flex gap-8">
            <TabsList className="flex flex-col h-fit gap-2 bg-transparent p-0">
              <TabsTrigger
                value="invite-member"
                className="border-none data-[state=active]:border-none data-[state=active]:bg-accent-foreground w-full h-12 px-4 py-2 flex gap-3 justify-start text-left"
              >
                <Users2 className="flex-shrink-0" />
                <span>Invite member</span>
              </TabsTrigger>
              <TabsTrigger
                value="delete-project"
                className="border-none data-[state=active]:border-none data-[state=active]:bg-accent-foreground w-full h-12 px-4 py-2 flex gap-3 justify-start text-left"
              >
                <Trash2 className="flex-shrink-0" />
                <span>Delete project</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="invite-member">
              <InviteMember projectId={projectId} />
            </TabsContent>
            <TabsContent value="delete-project">
              <SettingHeading
                title="Delete Project"
                description="Delete current project will also remove its task and invited member"
              />
              <Button variant="destructive">Delete Project</Button>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectSettings;
