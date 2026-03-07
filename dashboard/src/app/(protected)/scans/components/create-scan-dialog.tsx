"use client";

import { Plus } from "lucide-react";
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
import type { Scan, CreateScanInput } from "@/__generated__/graphql";
import { ScanStatus } from "@/__generated__/graphql";
import { createScanSchema } from "../schemas/create-scan.schema";

const CREATABLE_SCAN_STATUSES: ScanStatus[] = [
  ScanStatus.Queued,
  ScanStatus.Draft,
];

type ScanFormData = CreateScanInput;

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
    },
  });

  const [createScan, { loading }] = useMutation<
    Scan,
    { input: CreateScanInput }
  >(CREATE_SCAN);

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
