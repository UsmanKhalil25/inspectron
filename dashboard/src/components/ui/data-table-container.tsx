"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DataTableContainerProps {
  title: React.ReactNode;
  description: React.ReactNode;
  children: React.ReactNode;
}

export function DataTableContainer({
  title,
  description,
  children,
}: DataTableContainerProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
