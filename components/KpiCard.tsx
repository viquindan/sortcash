import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  amount: number;
  type: "income" | "expense" | "net";
}

export function KpiCard({ title, amount, type }: KpiCardProps) {
  const formattedAmount = new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(amount));

  return (
    <Card>
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <h3 className="text-sm font-medium text-muted mb-2">{title}</h3>
        <p
          className={cn("text-3xl font-serif font-bold", {
            "text-green": type === "income",
            "text-red": type === "expense",
            "text-accent": type === "net",
          })}
        >
          {type === "expense" ? "-" : ""}
          {formattedAmount}
        </p>
      </CardContent>
    </Card>
  );
}
