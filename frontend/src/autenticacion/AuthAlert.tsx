import type { ReactNode } from "react";
import { CheckCircle, Info, WarningCircle } from "@phosphor-icons/react";
import { cn } from "../lib/cn";

type Tone = "error" | "success" | "info" | "warning";

const tones: Record<Tone, { box: string; Icon: typeof Info }> = {
  error: { box: "border-danger/40 bg-danger/10 text-red-200", Icon: WarningCircle },
  success: { box: "border-success/40 bg-success/10 text-green-200", Icon: CheckCircle },
  warning: { box: "border-warning/40 bg-warning/10 text-orange-200", Icon: WarningCircle },
  info: { box: "border-primary/40 bg-primary/10 text-text", Icon: Info },
};

/** Aviso en línea (reemplaza los pop-ups). Icono + texto: el color no es el único mensaje. */
export function AuthAlert({
  tone = "info",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  const { box, Icon } = tones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-control border px-3 py-2.5 text-sm",
        box,
        className,
      )}
    >
      <Icon size={20} weight="fill" aria-hidden="true" className="mt-0.5 shrink-0" />
      <div className="min-w-0 break-words">{children}</div>
    </div>
  );
}
