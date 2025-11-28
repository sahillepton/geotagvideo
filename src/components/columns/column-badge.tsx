import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ColumnBadge = ({
  icon,
  text,
  color = "default",
  className,
}: {
  icon?: React.ReactNode;
  text: string;
  color?: "default" | "success" | "error" | "warning" | "info";
  className?: string;
}) => {
  const colors = {
    default: "bg-secondary text-foreground",
    success: "bg-[#d1f4e0] text-[#419967]",
    error: "bg-[#fdd0df] text-[#c20e4d]",
    warning: "bg-yellow-200 text-yellow-900",
    info: "bg-blue-200 text-blue-900",
  };

  return (
    <Badge
      className={cn(
        "flex items-center gap-1 text-xs",
        colors[color],
        className
      )}
    >
      {icon}
      {text}
    </Badge>
  );
};

export default ColumnBadge;
