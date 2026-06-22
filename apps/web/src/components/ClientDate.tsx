"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

interface ClientDateProps {
  iso: string;
  className?: string;
}

export function ClientDate({ iso, className }: ClientDateProps) {
  const [label, setLabel] = useState(() => formatDate(iso));

  useEffect(() => {
    setLabel(formatDate(iso));
  }, [iso]);

  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {label}
    </time>
  );
}
