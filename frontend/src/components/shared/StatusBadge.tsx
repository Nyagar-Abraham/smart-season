import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'Active' | 'At Risk' | 'Completed' | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'at risk':
      case 'at_risk':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'planted':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'growing':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'ready':
        return 'bg-lime-100 text-lime-700 border-lime-200';
      case 'harvested':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-medium border",
        getStatusStyles(status),
        className
      )}
    >
      {status}
    </span>
  );
}
