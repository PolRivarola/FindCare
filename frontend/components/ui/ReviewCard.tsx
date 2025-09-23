import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  id: number;
  rating?: number;
  comment?: string | null;
  date: string;
  author?: string;
  showReportButton?: boolean;
  isReported?: boolean;
  onReport?: (id: number, isReported: boolean) => void;
  onApprove?: (id: number) => void;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
  loadingType?: "approving" | "deleting" | null;
  className?: string;
  variant?: "default" | "compact" | "admin";
}

export function ReviewCard({
  id,
  rating,
  comment,
  date,
  author,
  showReportButton = false,
  isReported = false,
  onReport,
  onApprove,
  onDelete,
  isLoading = false,
  loadingType = null,
  className,
  variant = "default"
}: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderActions = () => {
    if (variant === "admin") {
      return (
        <div className="flex space-x-2 ml-4">
          {onApprove && (
            <Button
              size="sm"
              variant="default"
              onClick={() => onApprove(id)}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loadingType === "approving" ? "Aprobando..." : "Aprobar"}
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(id)}
              disabled={isLoading}
            >
              {loadingType === "deleting" ? "Eliminando..." : "Eliminar"}
            </Button>
          )}
        </div>
      );
    }

    if (showReportButton && onReport) {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onReport(id, isReported)}
          disabled={isLoading}
        >
          {isReported ? 'Quitar reporte' : 'Reportar'}
        </Button>
      );
    }

    return null;
  };

  const containerClasses = cn(
    "flex items-start justify-between p-4 rounded-lg",
    variant === "compact" ? "p-3" : "p-4",
    variant === "admin" ? "border hover:bg-gray-50" : "bg-gray-50",
    className
  );

  return (
    <div className={containerClasses}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <StarRating 
            rating={rating || 0} 
            size={variant === "compact" ? "sm" : "md"}
            showValue={variant === "admin"}
          />
          <span className="text-sm text-gray-500">
            {formatDate(date)}
          </span>
        </div>
        
        {comment && (
          <p className={cn(
            "text-gray-700",
            variant === "compact" ? "text-sm" : "text-sm mt-1"
          )}>
            {comment}
          </p>
        )}
        
        {!comment && (
          <p className="text-sm text-gray-500 italic">
            Sin comentario
          </p>
        )}
        
        {author && (
          <p className="text-xs text-gray-500 mt-1">
            Por {author}
          </p>
        )}
      </div>
      
      {renderActions()}
    </div>
  );
}
