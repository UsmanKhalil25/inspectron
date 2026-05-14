"use client";

import { useState } from "react";
import { useMutation, useSuspenseQuery } from "@apollo/client";
import { toast } from "sonner";
import { Plus, Shield, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableContainer } from "@/components/ui/data-table-container";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingText } from "@/components/ui/loading-text";

import { SCANS } from "@/graphql/queries/scans";
import { CREATE_SCAN } from "@/graphql/mutations/create-scan";
import { PROJECT } from "@/graphql/queries/project";
import { SCAN_STATUS_BADGE } from "@/common/constants/scan-status-badge.constant";
import { capitalize } from "@/common/utils/string.utils";
import { GetScansQuery, ScanStatus, ScanType } from "@/__generated__/graphql";

import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

const CREATABLE_SCAN_STATUSES: ScanStatus[] = [
  ScanStatus.Queued,
  ScanStatus.Draft,
];

const SCAN_TYPE_CONFIG: Record<
  ScanType,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  [ScanType.Static]: {
    label: "Static",
    description: "Headers, cookies, sensitive files, CSRF",
    icon: Shield,
  },
  [ScanType.Dynamic]: {
    label: "Dynamic",
    description: "Reflected XSS, open redirects",
    icon: Zap,
  },
};

const createScanSchema = z.object({
  url: z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .min(1, "URL is required")
    .optional()
    .or(z.literal("")),
  scanType: z
    .enum(Object.values(ScanType) as [ScanType, ...ScanType[]])
    .optional(),
  status: z
    .enum(Object.values(ScanStatus) as [ScanStatus, ...ScanStatus[]])
    .nullable()
    .optional(),
});

type ScanFormData = z.infer<typeof createScanSchema>;

function CreateScanFromProjectDialog({
  projectId,
  projectUrl,
}: {
  projectId: string;
  projectUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<ScanFormData>({
    resolver: zodResolver(createScanSchema),
    defaultValues: {
      url: projectUrl,
      status: undefined,
      scanType: ScanType.Static,
    },
  });

  const [createScan, { loading }] = useMutation(CREATE_SCAN, {
    refetchQueries: [
      {
        query: SCANS,
        variables: { filters: { projectId }, limit: 10, page: 1 },
      },
      { query: PROJECT, variables: { id: projectId } },
    ],
  });

  const handleSubmit = (data: ScanFormData) => {
    createScan({
      variables: {
        input: {
          projectId,
          url: data.url || projectUrl,
          scanType: data.scanType,
          status: data.status,
        },
      },
      onCompleted: (result) => {
        toast.success("Scan created successfully");
        form.reset();
        setOpen(false);
        router.push(`/scans/${result.createScan.id}`);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create scan");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" size="sm">
          <Plus className="h-4 w-4" />
          New Scan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Scan</DialogTitle>
          <DialogDescription>
            Start a new scan for this project.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder={projectUrl}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scanType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scan Type</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.values(ScanType) as ScanType[]).map((type) => {
                        const config = SCAN_TYPE_CONFIG[type];
                        const Icon = config.icon;
                        const isSelected = field.value === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => field.onChange(type)}
                            className={`flex items-start gap-2.5 rounded-lg border p-3 text-left transition-colors ${
                              isSelected
                                ? "border-primary/50 bg-primary/5"
                                : "border-border bg-muted/20 hover:bg-muted/40"
                            }`}
                          >
                            <Icon
                              className={`mt-0.5 h-4 w-4 shrink-0 ${
                                isSelected
                                  ? type === ScanType.Static
                                    ? "text-blue-400"
                                    : "text-orange-400"
                                  : "text-muted-foreground/50"
                              }`}
                            />
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span
                                className={`text-sm font-medium ${
                                  isSelected
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {config.label}
                              </span>
                              <span className="text-[11px] text-muted-foreground/60 leading-tight">
                                {config.description}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {CREATABLE_SCAN_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {capitalize(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <LoadingText text="Creating..." /> : "Create Scan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ScanRow({ scan }: { scan: GetScansQuery["scans"]["scans"][number] }) {
  const router = useRouter();

  return (
    <tr
      className="group cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => router.push(`/scans/${scan.id}`)}
    >
      <td className="p-4">
        <span className="font-medium text-foreground truncate block max-w-[300px]">
          {scan.url}
        </span>
      </td>
      <td className="p-4">
        <Badge variant={SCAN_STATUS_BADGE[scan.status]} className="font-medium">
          {capitalize(scan.status)}
        </Badge>
      </td>
      <td className="p-4">
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(scan.createdAt), { addSuffix: true })}
        </span>
      </td>
    </tr>
  );
}

export function ProjectScans({
  projectId,
  projectUrl,
  cookieHeader,
}: {
  projectId: string;
  projectUrl: string;
  cookieHeader: string;
}) {
  const { data } = useSuspenseQuery(SCANS, {
    variables: {
      filters: { projectId },
      limit: 10,
      page: 1,
    },
    context: {
      headers: {
        cookie: cookieHeader,
      },
    },
  });

  const scans = data?.scans?.scans || [];
  const totalPages = data?.scans?.pagination?.totalPages ?? 1;
  const hasNextPage = data?.scans?.pagination?.hasNextPage ?? false;
  const hasPreviousPage = data?.scans?.pagination?.hasPreviousPage ?? false;
  const currentPage = data?.scans?.pagination?.page ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">Scans</h3>
        <CreateScanFromProjectDialog
          projectId={projectId}
          projectUrl={projectUrl}
        />
      </div>

      {scans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed border-border/60 bg-muted/10">
          <div className="w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
            <Shield className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No scans yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-sm text-sm">
            Start your first scan for this project to discover vulnerabilities.
          </p>
        </div>
      ) : (
        <DataTableContainer
          title={`Scans (${scans.length})`}
          description="Scans for this project"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[150px]">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scans.map((scan) => (
                <ScanRow key={scan.id} scan={scan} />
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
              />
            </div>
          )}
        </DataTableContainer>
      )}
    </div>
  );
}
