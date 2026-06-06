"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FirmwareSelect({ options }: { options: string[] }) {
  const [v, setV] = useState(options[0] ?? "");
  const label = (f: string) => (f === "Generic" ? "Универсальный (Generic)" : f);
  return (
    <Select value={v} onValueChange={setV}>
      <SelectTrigger className="mono mt-1 h-9 w-full"><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((f) => (
          <SelectItem key={f} value={f} className="mono">{label(f)}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
