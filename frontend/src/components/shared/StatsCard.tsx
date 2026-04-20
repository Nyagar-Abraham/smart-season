import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  color?: 'green' | 'orange' | 'red' | 'blue';
  className?: string;
}

export function StatsCard({ label, value, sublabel, color = 'green', className }: StatsCardProps) {
  const getColorStyles = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-[#2D6A4F] text-white';
      case 'orange':
        return 'bg-[#F28B21] text-white';
      case 'red':
        return 'bg-[#D94E33] text-white';
      case 'blue':
        return 'bg-[#1D4E89] text-white';
      default:
        return 'bg-white text-gray-900 border border-gray-200';
    }
  };

  return (
    <Card className={cn(getColorStyles(color), "overflow-hidden border-none shadow-md", className)}>
      <CardContent className="p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium opacity-90">{label}</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold">{value}</span>
            {sublabel && <span className="text-xs opacity-75">{sublabel}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
