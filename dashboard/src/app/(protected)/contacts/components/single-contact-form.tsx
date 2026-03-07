import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { Trash2, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingText } from "@/components/ui/loading-text";
import { CommunicationChannelSelect } from "@/components/ui/communication-channel-select";

import {
  CreateContactInput,
  CommunicationChannel,
  Contact,
} from "@/__generated__/graphql";
import { createContactSchema } from "../schemas/create-contact.schema";
import { CREATE_CONTACT } from "@/graphql/mutations/create-contact";
import { CONTACTS } from "@/graphql/queries/contacts";
import { useSearchParams } from "next/navigation";
import { useMapFilters } from "@/hooks/use-map-filters";
import {
  CONTACTS_SEARCH_PARAMS,
  DEFAULT_CONTACTS_PAGE_SIZE,
} from "../constants";

type ContactFormData = CreateContactInput;

interface ContactChannelFieldProps {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  getPlaceholderText: (type: CommunicationChannel) => string;
}

function ContactChannelField({
  index,
  onRemove,
  canRemove,
  getPlaceholderText,
}: ContactChannelFieldProps) {
  return (
    <div className="flex gap-2 items-start">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
        <FormField
          name={`contactChannels.${index}.type`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CommunicationChannelSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select type"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name={`contactChannels.${index}.value`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  placeholder={getPlaceholderText(
                    field.value as CommunicationChannel,
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="mt-1"
          aria-label="Remove contact channel"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function ContactForm() {
  const searchParams = useSearchParams();

  const searchFilters = useMapFilters({
    pageSize: DEFAULT_CONTACTS_PAGE_SIZE,
    params: CONTACTS_SEARCH_PARAMS,
    searchParams,
  });

  const form = useForm<ContactFormData>({
    resolver: zodResolver(createContactSchema),
    defaultValues: {
      name: "",
      contactChannels: [{ type: CommunicationChannel.Email, value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contactChannels",
  });

  const [createContact, { loading }] = useMutation<
    { contact: Contact },
    { input: CreateContactInput }
  >(CREATE_CONTACT);

  const handleSubmit = (data: ContactFormData) => {
    createContact({
      variables: { input: data },
      refetchQueries: () => [{ query: CONTACTS, variables: searchFilters }],
      onCompleted: () => {
        toast.success("Contact created successfully");
        form.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create contact");
      },
    });
  };

  const addContactChannel = () => {
    append({ type: CommunicationChannel.Email, value: "" });
  };

  const getPlaceholderText = (type: CommunicationChannel) => {
    switch (type) {
      case CommunicationChannel.Email:
        return "Enter email address";
      case CommunicationChannel.Sms:
        return "Enter phone number";
      default:
        return "Enter value";
    }
  };

  const resetForm = () => {
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter contact name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>Contact Channels</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addContactChannel}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Channel
            </Button>
          </div>

          {fields.map((field, index) => (
            <ContactChannelField
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
              canRemove={fields.length > 1}
              getPlaceholderText={getPlaceholderText}
            />
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={resetForm}>
            Reset
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? <LoadingText text="Creating..." /> : "Create Contact"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { ContactForm };
