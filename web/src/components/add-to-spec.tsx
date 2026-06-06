"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, type CartItem } from "@/lib/store";

export function AddToSpec({
  item,
  qty = 1,
  label = "В спецификацию",
  size = "sm",
  variant = "default",
  className = "",
}: {
  item: Omit<CartItem, "qty">;
  qty?: number;
  label?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary";
  className?: string;
}) {
  const { addToCart } = useStore();
  const [done, setDone] = useState(false);

  return (
    <Button
      size={size}
      variant={done ? "secondary" : variant}
      className={`gap-1 ${className}`}
      onClick={() => {
        addToCart(item, qty);
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
    >
      {done ? <><Check className="h-3.5 w-3.5" /> Добавлено</> : <><Plus className="h-3.5 w-3.5" /> {label}</>}
    </Button>
  );
}
