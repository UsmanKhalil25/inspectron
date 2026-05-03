"use client";

import { motion } from "motion/react";
import { Link2, ScanLine, ClipboardCheck } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Link2,
    title: "Enter your URL",
    description:
      "Paste any website URL. No installation, no configuration files — just a single input and you are ready.",
  },
  {
    number: "02",
    icon: ScanLine,
    title: "AI Agent scans",
    description:
      "Our intelligent agent crawls your application, interacts with forms, and probes for vulnerabilities in real time.",
  },
  {
    number: "03",
    icon: ClipboardCheck,
    title: "Get your report",
    description:
      "Receive a detailed security report with severity ratings, reproduction steps, and actionable fixes.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="border-y border-border/40 bg-muted/30 px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            From URL to security report in three simple steps.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.12 }}
              className="relative flex flex-col items-center text-center"
            >
              {index < STEPS.length - 1 && (
                <div className="absolute top-8 left-1/2 hidden h-px w-full -translate-x-0 bg-border/60 md:block" />
              )}

              <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-background shadow-sm">
                <step.icon className="h-6 w-6 text-foreground" />
              </div>

              <span className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Step {step.number}
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
