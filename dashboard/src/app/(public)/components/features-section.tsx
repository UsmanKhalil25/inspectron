"use client";

import { motion } from "motion/react";
import { Bot, Eye, FileText, Globe, Radar, Workflow } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURES = [
  {
    icon: Bot,
    title: "Agent-Driven Scanning",
    description:
      "Intelligent AI agents that navigate and analyze your applications like real users — finding vulnerabilities traditional scanners miss.",
  },
  {
    icon: Eye,
    title: "Real-Time Browser Preview",
    description:
      "Watch your scan unfold live. See exactly what the agent sees with a real-time browser preview stream as it explores your site.",
  },
  {
    icon: Radar,
    title: "Vulnerability Detection",
    description:
      "Detect XSS, SQL injection, misconfigurations, and more. Get detailed severity ratings and actionable remediation guidance.",
  },
  {
    icon: Workflow,
    title: "Automated Workflows",
    description:
      "Queue scans, monitor progress, and receive results automatically. Integrate into your CI/CD pipeline with zero friction.",
  },
  {
    icon: Globe,
    title: "Full-Stack Coverage",
    description:
      "From frontend JavaScript to backend APIs. Scan SPAs, server-rendered apps, and REST/GraphQL endpoints in one pass.",
  },
  {
    icon: FileText,
    title: "Detailed Reports",
    description:
      "Export clean, shareable security reports. Track trends over time and prove compliance with structured vulnerability data.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to stay secure.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A complete security scanning platform powered by AI. No proxies, no
            complex setup — just results.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Card className="h-full rounded-2xl border-border/60 bg-background/50 shadow-sm transition-colors hover:border-border">
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <feature.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
