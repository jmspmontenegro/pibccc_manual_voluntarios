import { Badge } from "@/components/ui/badge";

export function TeamBadge({ name, color }: { name: string; color: string }) {
  return (
    <Badge
      style={{ backgroundColor: color, color: "#fff", borderColor: "transparent" }}
      className="font-semibold"
    >
      {name}
    </Badge>
  );
}
