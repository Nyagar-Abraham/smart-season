import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = ["Planted", "Growing", "Ready", "Harvested"];

interface CropProgressProps {
  currentStage: string;
  className?: string;
}

export function CropProgress({ currentStage, className }: CropProgressProps) {
  const currentIndex = stages.findIndex(s => s.toLowerCase() === currentStage.toLowerCase());

  return (
    <div className={cn("flex items-center w-full justify-between max-w-lg", className)}>
      {stages.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        
        return (
          <div key={stage} className="flex flex-col items-center relative flex-1">
            {/* Line */}
            {index !== 0 && (
              <div 
                className={cn(
                  "absolute h-0.5 w-full top-4 -translate-y-1/2 left-[-50%]",
                  index <= currentIndex ? "bg-green-600" : "bg-gray-200"
                )} 
              />
            )}
            
            {/* Circle */}
            <div 
              className={cn(
                "z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                isCompleted ? "bg-green-600 border-green-600 text-white" : 
                isCurrent ? "bg-white border-green-600 text-green-600" : 
                "bg-white border-gray-200 text-gray-400"
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-xs font-bold">{index + 1}</span>
              )}
            </div>
            
            {/* Label */}
            <span className={cn(
              "mt-2 text-[10px] md:text-xs font-medium",
              index <= currentIndex ? "text-green-800" : "text-gray-400"
            )}>
              {stage}
            </span>
          </div>
        );
      })}
    </div>
  );
}
