"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Shield, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pt-32 pb-24 sm:px-6 sm:pt-40 sm:pb-32 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.18),transparent)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm"
      >
        <Zap className="h-3.5 w-3.5" />
        AI-powered security scanning for the modern web
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="mt-8 max-w-4xl text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
      >
        The way AI secures
        <br className="hidden sm:block" /> the web.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="mt-6 max-w-2xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg"
      >
        Agent-driven vulnerability scanning with real-time browser preview. Find
        security flaws before attackers do — with zero configuration.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
      >
        <Button size="lg" className="gap-2 rounded-full px-8" asChild>
          <Link href="/register" prefetch={false}>
            Start Scanning
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="gap-2 rounded-full px-8"
          asChild
        >
          <Link href="/login" prefetch={false}>
            <Shield className="h-4 w-4" />
            View Dashboard
          </Link>
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-6 text-xs text-muted-foreground"
      >
        No credit card required. Free tier available.
      </motion.p>
    </section>
  );
}
