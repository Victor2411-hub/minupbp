"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { ArrowRight, Globe } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/50 backdrop-blur-xl shadow-2xl">
          <Globe className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="mb-4 text-5xl font-bold text-gray-900 drop-shadow-sm">
          MUN Evaluation Platform
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-600">
          Manage your Model United Nations committees with elegance and efficiency.
          Real-time grading, personalized evaluation sheets, and seamless management.
        </p>
      </motion.div>

      <div className="flex gap-4">
        <Link href="/login">
          <GlassButton className="flex items-center gap-2 px-8 py-4 text-lg">
            Enter as Table <ArrowRight className="h-5 w-5" />
          </GlassButton>
        </Link>
      </div>

      <footer className="absolute bottom-4 text-sm text-gray-400">
        © 2025 MUN Platform. Designed with Glassmorphism.
      </footer>
    </main>
  );
}
