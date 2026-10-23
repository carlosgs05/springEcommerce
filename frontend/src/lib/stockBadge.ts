import type { BadgeVariant } from "@/components/ui/Badge";

export function getStockBadge(stock: number): { variant: BadgeVariant; label: string } {
  if (stock === 0) return { variant: "danger", label: "Agotado" };
  if (stock <= 5) return { variant: "warning", label: "Poco stock" };
  return { variant: "success", label: "En stock" };
}
