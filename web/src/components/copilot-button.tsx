"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export function CopilotButton({
  seed,
  label = "Спросить со-пилота",
  variant = "secondary",
  size = "default",
  className = "",
  floating = false,
}: {
  seed?: string;
  label?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
  floating?: boolean;
}) {
  const { openAi } = useStore();
  if (floating) {
    return (
      <button
        onClick={() => openAi(seed)}
        className="fixed bottom-5 right-5 z-40 flex h-12 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary-hover"
      >
        <Sparkles className="h-5 w-5" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  }
  return (
    <Button variant={variant} size={size} className={`gap-1.5 ${className}`} onClick={() => openAi(seed)}>
      <Sparkles className="h-4 w-4" /> {label}
    </Button>
  );
}
