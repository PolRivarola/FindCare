import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4", 
  lg: "h-6 w-6"
};

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  className,
  interactive = false,
  onRatingChange
}: StarRatingProps) {
  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, i) => (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              i < rating 
                ? "text-yellow-400 fill-current" 
                : "text-gray-300",
              interactive && onRatingChange && "cursor-pointer hover:text-yellow-300 hover:scale-105 transition-all"
            )}
            onClick={() => handleStarClick(i + 1)}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          ({rating}/{maxRating})
        </span>
      )}
    </div>
  );
}
