"use client";

import { Plus, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingText } from "@/components/ui/loading-text";

import { capitalize } from "@/common/utils/string.utils";
import { SCAN_STATUS_COLORS } from "@/common/constants/scan-status-colors.constant";

import { useMapFilters } from "@/hooks/use-map-filters";

import { SCANS_SEARCH_PARAMS, DEFAULT_SCANS_PAGE_SIZE } from "../constants";

import { SCANS } from "@/graphql/queries/scans";
import { CREATE_SCAN } from "@/graphql/mutations/create-scan";
import type { Scan } from "@/__generated__/graphql";
import { ScanStatus, ScanType } from "@/__generated__/graphql";
import {
  createScanSchema,
  type CreateScanFormData,
} from "../schemas/create-scan.schema";

const CREATABLE_SCAN_STATUSES: ScanStatus[] = [
  ScanStatus.Queued,
  ScanStatus.Draft,
];

const SCAN_TYPE_CONFIG: Record<
  ScanType,
  { label: string; description: string; icon: React.ElementType; color: string }
> = {
  [ScanType.Static]: {
    label: "Static",
    description: "Headers, cookies, sensitive files, CSRF",
    icon: Shield,
    color: "text-blue-400",
  },
  [ScanType.Dynamic]: {
    label: "Dynamic",
    description: "Reflected XSS, open redirects",
    icon: Zap,
    color: "text-orange-400",
  },
};

type ScanFormData = CreateScanFormData;

interface ScanFormProps {
  onSuccess: () => void;
}

function ScanForm({ onSuccess }: ScanFormProps) {
  const searchParams = useSearchParams();

  const searchFilters = useMapFilters({
    pageSize: DEFAULT_SCANS_PAGE_SIZE,
    params: SCANS_SEARCH_PARAMS,
    searchParams,
  });

  const form = useForm<ScanFormData>({
    resolver: zodResolver(createScanSchema),
    defaultValues: {
      url: "",
      status: undefined,
      scanType: ScanType.Static,
    },
  });

  const [createScan, { loading }] = useMutation<Scan, { input: ScanFormData }>(
    CREATE_SCAN,
  );

  const handleSubmit = (data: ScanFormData) => {
    createScan({
      variables: { input: data },
      refetchQueries: () => [{ query: SCANS, variables: searchFilters }],
      onCompleted: () => {
        toast.success("Scan created successfully");
        form.reset();
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create scan");
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
                          className={`mt-0.5 h-4 w-4 shrink-0 ${isSelected ? config.color : "text-muted-foreground/50"}`}
                        />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span
                            className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}
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
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${SCAN_STATUS_COLORS[status]}`}
                          />
                          <span>{capitalize(status)}</span>
                        </div>
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
          <Button type="button" variant="outline" onClick={resetForm}>
            Reset
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? <LoadingText text="Creating..." /> : "Create Scan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function CreateScanDialog() {
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
          Create Scan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Scan</DialogTitle>
          <DialogDescription>Enter the URL you want to scan.</DialogDescription>
        </DialogHeader>

        <ScanForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

export { CreateScanDialog };
