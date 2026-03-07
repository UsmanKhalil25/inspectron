"use client";
import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Papa from "papaparse";
import { useMutation } from "@apollo/client";
import {
  FileRejection,
  useDropzone,
  DropzoneRootProps,
  DropzoneInputProps,
} from "react-dropzone";
import { Upload, Download, FileText, X, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingText } from "@/components/ui/loading-text";

import { ContactsPreviewDialog } from "./contacts-preview-dialog";

import {
  BulkCreateContactResponse,
  BulkCreateContactInput,
  CreateContactInput,
} from "@/__generated__/graphql";

import { CsvParsedRow } from "../types/csv-parsed-row.type";
import { bulkCreateContactSchema } from "../schemas/bulk-create-contact.schema";
import { transformToContactSchema } from "../utils/transform-to-contact-schema";
import { BULK_CREATE_CONTACT } from "@/graphql/mutations/bulk-create-contact";
import { CONTACTS } from "@/graphql/queries/contacts";

import {
  CONTACTS_SEARCH_PARAMS,
  DEFAULT_CONTACTS_PAGE_SIZE,
} from "../constants";
import { useMapFilters } from "@/hooks/use-map-filters";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const CSV_TEMPLATE_CONTENT =
  "name,email,sms\nJohn Doe,john@example.com,+1234567890\nJane Smith,jane@example.com,+0987654321\nMike Johnson,mike@example.com,+1122334455";

function CsvTemplateDownloadButton() {
  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE_CONTENT], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "contacts_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      onClick={downloadTemplate}
      size="sm"
      className="gap-2 bg-transparent"
    >
      <Download className="h-4 w-4" />
      Download Template
    </Button>
  );
}

interface FileUploadZoneProps {
  isDragActive: boolean;
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
}

function FileUploadZone({
  isDragActive,
  getRootProps,
  getInputProps,
}: FileUploadZoneProps) {
  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
        ${
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/20"
        }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className={`p-4 rounded-full transition-colors ${isDragActive ? "bg-primary/10" : "bg-muted"}`}
        >
          <FileText
            className={`h-8 w-8 ${isDragActive ? "text-primary" : "text-muted-foreground"}`}
          />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragActive
              ? "Drop your CSV file here"
              : "Drop your CSV file here"}
          </p>
          <p className="text-sm text-muted-foreground">
            or click to browse files (max 10MB)
          </p>
        </div>
        <Input
          {...getInputProps()}
          id="csv-upload"
          type="file"
          accept=".csv"
          className="sr-only"
        />
        <Button variant="outline" type="button" size="sm">
          Browse Files
        </Button>
      </div>
    </div>
  );
}

interface UploadedFileCardProps {
  file: File;
  onRemove: () => void;
}

function UploadedFileCard({ file, onRemove }: UploadedFileCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="flex-shrink-0 p-2.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full ring-1 ring-emerald-200 dark:ring-emerald-800">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-emerald-900 dark:text-emerald-100 truncate text-base leading-tight">
                {file.name}
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1 font-medium">
                {formatFileSize(file.size)} • Ready to import
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="flex-shrink-0 text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BulkCreateContactForm() {
  const searchParams = useSearchParams();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [rawContacts, setRawContacts] = useState<CsvParsedRow[]>([]);
  const [validatedContacts, setValidatedContacts] = useState<
    CreateContactInput[]
  >([]);

  const searchFilters = useMapFilters({
    pageSize: DEFAULT_CONTACTS_PAGE_SIZE,
    params: CONTACTS_SEARCH_PARAMS,
    searchParams,
  });

  const [bulkCreateContact, { loading }] = useMutation<
    { bulkCreateContact: BulkCreateContactResponse },
    { input: BulkCreateContactInput }
  >(BULK_CREATE_CONTACT);

  const handleImport = (contacts: CreateContactInput[]) => {
    bulkCreateContact({
      variables: { input: { contacts } },

      refetchQueries: () => [{ query: CONTACTS, variables: searchFilters }],
      onCompleted: (data) => {
        const response = data.bulkCreateContact;

        if (response.summary.successful > 0) {
          toast.success("Contacts imported successfully", {
            description: `${response.summary.successful} out of ${response.summary.total} contacts were created.`,
          });
        }

        if (response.errors.length > 0) {
          toast.error("Some contacts could not be imported", {
            description: "View the preview to see the errors",
          });
        }
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create contacts");
      },
    });
  };

  const showUploadError = (title: string, description: string) => {
    toast.error(title, { description });
  };

  const handleFileDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        const { errors } = rejectedFiles[0];

        if (errors.some((e) => e.code === "file-too-large")) {
          showUploadError(
            "Upload Failed",
            "The selected file is too large. Please choose a smaller file.",
          );
        } else if (errors.some((e) => e.code === "file-invalid-type")) {
          showUploadError(
            "Invalid File Type",
            "Only CSV files are supported. Please upload a valid CSV file.",
          );
        } else {
          showUploadError(
            "Upload Failed",
            "An unexpected error occurred while uploading your file.",
          );
        }
        return;
      }

      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploadedFile(file);

      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim().toLowerCase(),
        transform: (value: string) => value.trim(),
        complete: (results) => {
          const { data, errors } = results;

          let cleanedData = data;
          if (errors.length > 0) {
            const faultyRows = new Set(errors.map((err) => err.row));
            cleanedData = data.filter((_, index) => !faultyRows.has(index));

            showUploadError(
              "CSV Parsing Issues",
              `${errors.length} row(s) could not be processed and were skipped.`,
            );
          }

          if (cleanedData.length === 0) {
            showUploadError(
              "No Data Found",
              "The CSV file is empty or could not be parsed.",
            );
            return;
          }

          const parsedRows = cleanedData.map((row) => ({
            name: row.name ?? "",
            email: row.email || undefined,
            sms: row.sms || undefined,
          }));

          setRawContacts(parsedRows);

          const contacts = transformToContactSchema(parsedRows);
          const parsed = bulkCreateContactSchema.safeParse(contacts);

          if (!parsed.success) {
            showUploadError(
              "Validation Failed",
              "Some contacts have invalid or duplicate fields. Please fix and try again.",
            );
            return;
          }

          if (parsed.data.length === 0) {
            showUploadError(
              "No Valid Contacts",
              "No valid contacts were found after parsing the CSV file.",
            );
            return;
          }

          setValidatedContacts(parsed.data);
        },
      });
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  });

  const removeFile = () => {
    setUploadedFile(null);
    setRawContacts([]);
    setValidatedContacts([]);
  };

  const resetForm = () => {
    removeFile();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Import Contacts
          </CardTitle>
          <CardDescription>
            Upload a CSV file to import multiple contacts at once. Download our
            template to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!uploadedFile ? (
            <FileUploadZone
              isDragActive={isDragActive}
              getRootProps={getRootProps}
              getInputProps={getInputProps}
            />
          ) : (
            <UploadedFileCard file={uploadedFile} onRemove={removeFile} />
          )}

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">Need a template?</p>
              <p className="text-sm text-muted-foreground">
                Download our CSV template with the correct format
              </p>
            </div>

            <CsvTemplateDownloadButton />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={resetForm}>
          Reset
        </Button>
        <ContactsPreviewDialog contacts={rawContacts} />
        <Button
          disabled={!validatedContacts.length}
          className="gap-2 min-w-[140px]"
          onClick={() => handleImport(validatedContacts)}
        >
          <Upload className="h-4 w-4" />
          {loading ? <LoadingText text="Importing..." /> : "Import Contacts"}
        </Button>
      </div>
    </div>
  );
}

export { BulkCreateContactForm };
