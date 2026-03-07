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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingText } from "@/components/ui/loading-text";
import { CommunicationChannelSelect } from "@/components/ui/communication-channel-select";

import { capitalize } from "@/common/utils/string.utils";
import { CAMPAIGN_STATUS_COLORS } from "@/common/constants/campaign-status-colors.constant";

import { useMapFilters } from "@/hooks/use-map-filters";

import {
  CAMPAIGNS_SEARCH_PARAMS,
  DEFAULT_CAMPAIGNS_PAGE_SIZE,
} from "../constants";

import { CAMPAIGNS } from "@/graphql/queries/campaigns";
import { CREATE_CAMPAIGN } from "@/graphql/mutations/create-campaign";
import { CAMPAIGN_STATS } from "@/graphql/queries/campaign-stats";
import type { Campaign, CreateCampaignInput } from "@/__generated__/graphql";
import { CommunicationChannel, CampaignStatus } from "@/__generated__/graphql";
import { createCampaignSchema } from "../schemas/create-campaign.schema";

const CREATABLE_CAMPAIGN_STATUSES: CampaignStatus[] = [
  CampaignStatus.Queued,
  CampaignStatus.Draft,
];

type CampaignFormData = CreateCampaignInput;

interface CampaignFormProps {
  onSuccess: () => void;
}

function CampaignForm({ onSuccess }: CampaignFormProps) {
  const searchParams = useSearchParams();

  const searchFilters = useMapFilters({
    pageSize: DEFAULT_CAMPAIGNS_PAGE_SIZE,
    params: CAMPAIGNS_SEARCH_PARAMS,
    searchParams,
  });

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      title: "",
      description: "",
      channelType: CommunicationChannel.Email,
      status: undefined,
    },
  });

  const [createCampaign, { loading }] = useMutation<
    Campaign,
    { input: CreateCampaignInput }
  >(CREATE_CAMPAIGN);

  const handleSubmit = (data: CampaignFormData) => {
    createCampaign({
      variables: { input: data },
      refetchQueries: () => [
        { query: CAMPAIGN_STATS },
        { query: CAMPAIGNS, variables: searchFilters },
      ],
      onCompleted: () => {
        toast.success("Campaign created successfully");
        form.reset();
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create campaign");
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter campaign title" />
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
                <Textarea {...field} placeholder="Enter campaign description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="channelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Channel Type</FormLabel>
                <FormControl>
                  <CommunicationChannelSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select a channel"
                  />
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
                      {CREATABLE_CAMPAIGN_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${CAMPAIGN_STATUS_COLORS[status]}`}
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
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={resetForm}>
            Reset
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? <LoadingText text="Creating..." /> : "Create Campaign"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function CreateCampaignDialog() {
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
          Create Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new campaign.
          </DialogDescription>
        </DialogHeader>

        <CampaignForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}

export { CreateCampaignDialog };
