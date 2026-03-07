"use client";

import { useState } from "react";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ContactForm } from "./single-contact-form";
import { BulkCreateContactForm } from "./bulk-create-contact-form";

function CreateContactDialog() {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Contacts</DialogTitle>
          <DialogDescription>
            Create a single contact or import multiple contacts from CSV
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Contact</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>
          <TabsContent value="single">
            <ContactForm />
          </TabsContent>
          <TabsContent value="bulk">
            <BulkCreateContactForm />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export { CreateContactDialog };
