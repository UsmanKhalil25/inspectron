"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingText } from "@/components/ui/loading-text";

import { PROJECTS } from "@/graphql/queries/projects";
import { CREATE_PROJECT } from "@/graphql/mutations/create-project";
import type { CreateProjectMutation } from "@/__generated__/graphql";
import {
  createProjectSchema,
  type CreateProjectFormData,
} from "../schemas/create-project.schema";

function ProjectForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
    },
  });

  const [createProject, { loading }] = useMutation<CreateProjectMutation>(
    CREATE_PROJECT,
    {
      refetchQueries: [{ query: PROJECTS }],
    },
  );

  const handleSubmit = (data: CreateProjectFormData) => {
    createProject({
      variables: { input: data },
      onCompleted: (result) => {
        toast.success("Project created successfully");
        form.reset();
        onSuccess();
        router.push(`/projects/${result.createProject.id}`);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create project");
      },
    });
  };

  const resetForm = () => {
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="My Website" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Optional description..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={resetForm}>
            Reset
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? <LoadingText text="Creating..." /> : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function CreateProjectDialog() {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Create a project to organize and group your scans.
          </DialogDescription>
        </DialogHeader>

        <ProjectForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

export { CreateProjectDialog };
