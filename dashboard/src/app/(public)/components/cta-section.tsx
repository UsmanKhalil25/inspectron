"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-4xl flex-col items-center rounded-3xl border border-border/60 bg-muted/30 px-6 py-16 text-center sm:px-12 sm:py-20"
      >
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Start securing your applications today.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Join developers and security teams who trust Inspectron to find
          vulnerabilities before attackers do.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg" className="gap-2 rounded-full px-8" asChild>
            <Link href="/register" prefetch={false}>
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-8"
            asChild
          >
            <Link href="/login" prefetch={false}>
              Log in
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
