import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-px size-3.5 shrink-0 text-primary" aria-hidden />
      <span>
        AI-generated content may contain errors. Review important information before relying on it.
      </span>
    </p>
  );
}
