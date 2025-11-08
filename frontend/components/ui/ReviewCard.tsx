import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { ReportModal } from "./ReportModal";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { formatDate } from "@/lib/utils/dateFormat";

interface ReviewCardProps {
  id: number;
  rating?: number;
  comment?: string | null;
  date: string;
  author?: string;
  showReportButton?: boolean;
  isReported?: boolean;
  onReport?: (id: number, isReported: boolean, reason?: string) => void;
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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);


  const handleReportClick = () => {
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = (reason: string) => {
    if (onReport) {
      // For removing reports (isReported = true), we don't need a reason
      const reportReason = isReported ? undefined : reason;
      onReport(id, isReported, reportReason);
    }
    setIsReportModalOpen(false);
  };

  const handleReportModalClose = () => {
    setIsReportModalOpen(false);
  };

  const renderActions = () => {
    if (variant === "admin") {
      return (
        <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0 sm:ml-4 w-full sm:w-auto">
          {onApprove && (
            <Button
              size="sm"
              variant="default"
              onClick={() => onApprove(id)}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto text-xs md:text-sm"
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
              className="w-full sm:w-auto text-xs md:text-sm"
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
          variant={isReported ? "destructive" : "gradient"} 
          size="sm" 
          onClick={handleReportClick}
          disabled={isLoading}
          className="w-full sm:w-auto mt-3 sm:mt-0 text-xs md:text-sm"
        >
          {isReported ? 'Quitar reporte' : 'Reportar'}
        </Button>
      );
    }

    return null;
  };

  const containerClasses = cn(
    "flex flex-col sm:flex-row items-start justify-between p-3 md:p-4 rounded-lg",
    variant === "compact" ? "p-2 md:p-3" : "p-3 md:p-4",
    variant === "admin" ? "border hover:bg-gray-50" : "bg-gray-50",
    className
  );

  return (
    <>
      <div className={containerClasses}>
        <div className="flex-1 w-full sm:w-auto">
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 mb-2">
            <StarRating 
              rating={rating || 0} 
              size={variant === "compact" ? "sm" : "md"}
              showValue={variant === "admin"}
            />
            
            <span className="text-xs md:text-sm text-gray-500">
              {formatDate(date)}
            </span>
          </div>
          
          {comment && (
            <p className={cn(
              "text-gray-700 text-base w-3/4",
            )}>
              {comment}
            </p>
          )}
          
          {!comment && (
            <p className="text-xs md:text-sm text-gray-500 italic">
              Sin comentario
            </p>
          )}
          
          
          
        </div>
        
        {renderActions()}
      </div>

      {showReportButton && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={handleReportModalClose}
          onReport={handleReportSubmit}
          isLoading={isLoading}
          isReported={isReported}
        />
      )}
    </>
  );
}
