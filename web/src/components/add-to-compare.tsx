"use client";

import { GitCompare, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, type CompareItem } from "@/lib/store";

export function AddToCompare({
  item,
  label = "Сравнить",
  size = "sm",
  variant = "outline",
  className = "",
  iconOnly = false,
}: {
  item: CompareItem;
  label?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
  iconOnly?: boolean;
}) {
  const { addToCompare, inCompare, compare, COMPARE_MAX } = useStore();
  const active = inCompare(item.sku);
  const full = !active && compare.length >= COMPARE_MAX;

  return (
    <Button
      size={size}
      variant={active ? "secondary" : variant}
      className={`gap-1 ${className}`}
      disabled={full}
      title={full ? `Можно сравнить до ${COMPARE_MAX} модулей` : undefined}
      onClick={() => addToCompare(item)}
    >
      {active ? <Check className="h-3.5 w-3.5" /> : <GitCompare className="h-3.5 w-3.5" />}
      {!iconOnly && (active ? "В сравнении" : label)}
    </Button>
  );
}
